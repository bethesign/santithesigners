import { supabase } from '../lib/supabase/client';

/**
 * Generates a cyclic permutation (derangement) for Secret Santa
 * Each user gives to the next person in the cycle
 * No one receives their own gift (sealed cyclic permutation)
 */

interface Participant {
  user_id: string;
  full_name: string;
  quiz_position: number;
  answered_at: string | null;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a cyclic permutation where each person gives to the next in the cycle
 * Example: [A, B, C, D] -> A gives to B, B gives to C, C gives to D, D gives to A
 */
function createCyclicPermutation(participants: Participant[]): Array<{ giver: Participant; receiver: Participant }> {
  // Shuffle to randomize who gives to whom
  const shuffled = shuffleArray(participants);

  const pairs: Array<{ giver: Participant; receiver: Participant }> = [];

  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length]; // Cyclic: last person gives to first

    pairs.push({ giver, receiver });
  }

  return pairs;
}

/**
 * Main function to generate the extraction
 * Can only be called once (checks if extraction already exists)
 */
export async function generateExtraction(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // 1. Check if extraction already exists
    const { data: existingExtraction, error: checkError } = await supabase
      .from('extraction')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing extraction:', checkError);
      return { success: false, message: 'Errore durante la verifica estrazione esistente' };
    }

    if (existingExtraction && existingExtraction.length > 0) {
      return { success: false, message: 'Estrazione già generata. Non è possibile rigenerarla.' };
    }

    // 2. Get all users who have uploaded a gift
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, has_uploaded_gift')
      .eq('has_uploaded_gift', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { success: false, message: 'Errore durante il recupero degli utenti' };
    }

    if (!users || users.length < 2) {
      return { success: false, message: 'Servono almeno 2 partecipanti con regali caricati' };
    }

    // 3. Get quiz answers to determine order
    const { data: quizAnswers, error: quizError } = await supabase
      .from('quiz_answers')
      .select('user_id, answered_at')
      .in('user_id', users.map(u => u.id))
      .order('answered_at', { ascending: true });

    if (quizError) {
      console.error('Error fetching quiz answers:', quizError);
      return { success: false, message: 'Errore durante il recupero risposte quiz' };
    }

    // 4. Create participants array with quiz positions
    const participants: Participant[] = users.map((user, index) => {
      const quizAnswer = quizAnswers?.find(qa => qa.user_id === user.id);
      const quizPosition = quizAnswer
        ? quizAnswers.findIndex(qa => qa.user_id === user.id) + 1
        : users.length + index + 1; // Users without quiz go last

      return {
        user_id: user.id,
        full_name: user.full_name,
        quiz_position: quizPosition,
        answered_at: quizAnswer?.answered_at || null,
      };
    });

    // Sort by quiz position (those who answered first get to choose first)
    participants.sort((a, b) => a.quiz_position - b.quiz_position);

    // 5. Generate cyclic permutation
    const pairs = createCyclicPermutation(participants);

    // 6. Prepare extraction data for insert
    const extractionData = pairs.map((pair, index) => ({
      user_id: pair.giver.user_id,
      receiver_id: pair.receiver.user_id,
      order_position: pair.giver.quiz_position,
      revealed_at: null, // Sealed - will be revealed during live extraction
    }));

    // 7. Insert into extraction table
    const { error: insertError } = await supabase
      .from('extraction')
      .insert(extractionData);

    if (insertError) {
      console.error('Error inserting extraction:', insertError);
      return { success: false, message: `Errore durante l'inserimento: ${insertError.message}` };
    }

    // 8. Update settings to mark extraction as generated
    const { error: settingsError } = await supabase
      .from('settings')
      .update({ extraction_generated_at: new Date().toISOString() })
      .eq('id', 1);

    if (settingsError) {
      console.error('Error updating settings:', settingsError);
      // Don't fail completely if settings update fails
    }

    return {
      success: true,
      message: `Estrazione generata con successo per ${participants.length} partecipanti`,
      count: participants.length,
    };

  } catch (error: any) {
    console.error('Unexpected error in generateExtraction:', error);
    return { success: false, message: `Errore imprevisto: ${error.message}` };
  }
}

/**
 * Delete the extraction (admin emergency function)
 * Use with caution - this will delete all extraction data
 */
export async function deleteExtraction(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('extraction')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('Error deleting extraction:', error);
      return { success: false, message: `Errore durante la cancellazione: ${error.message}` };
    }

    // Reset settings
    await supabase
      .from('settings')
      .update({
        extraction_generated_at: null,
        draw_started: false,
        current_turn: 0,
      })
      .eq('id', 1);

    return { success: true, message: 'Estrazione cancellata con successo' };
  } catch (error: any) {
    console.error('Unexpected error in deleteExtraction:', error);
    return { success: false, message: `Errore imprevisto: ${error.message}` };
  }
}

/**
 * Get extraction statistics
 */
export async function getExtractionStats(): Promise<{
  generated: boolean;
  totalParticipants: number;
  revealedCount: number;
  nextTurn: number | null;
}> {
  const { data: extractions } = await supabase
    .from('extraction')
    .select('id, revealed_at');

  const generated = extractions && extractions.length > 0;
  const totalParticipants = extractions?.length || 0;
  const revealedCount = extractions?.filter(e => e.revealed_at !== null).length || 0;

  // Get next turn
  const { data: settings } = await supabase
    .from('settings')
    .select('current_turn')
    .eq('id', 1)
    .single();

  return {
    generated,
    totalParticipants,
    revealedCount,
    nextTurn: settings?.current_turn || null,
  };
}
