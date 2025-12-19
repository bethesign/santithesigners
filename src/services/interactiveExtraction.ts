import { supabase } from '../lib/supabase/client';

interface StartExtractionResult {
  success: boolean;
  message: string;
}

/**
 * Inizia l'estrazione live interattiva
 *
 * Crea i turni di estrazione ordinati per classifica quiz
 * NON pre-assegna i regali - gli utenti li scelgono cliccando sulle keyword
 */
export async function startInteractiveExtraction(): Promise<StartExtractionResult> {
  try {
    // 1. Verifica che non ci sia già un'estrazione attiva
    const { data: settings } = await supabase
      .from('settings')
      .select('draw_enabled')
      .eq('id', 1)
      .single();

    if (settings?.draw_enabled) {
      return {
        success: false,
        message: 'Estrazione già attiva!'
      };
    }

    // 2. Ottieni tutti gli utenti che hanno completato quiz E caricato regalo
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, has_uploaded_gift');

    if (usersError) throw usersError;
    if (!users || users.length < 2) {
      return {
        success: false,
        message: 'Servono almeno 2 partecipanti con regali caricati'
      };
    }

    // Filtra solo chi ha caricato il regalo
    const eligibleUsers = users.filter(u => u.has_uploaded_gift);

    if (eligibleUsers.length < 2) {
      return {
        success: false,
        message: 'Servono almeno 2 partecipanti con regali caricati'
      };
    }

    // 3. Ottieni classifica quiz (ordine di estrazione)
    const { data: quizAnswers, error: quizError } = await supabase
      .from('quiz_answers')
      .select('user_id, is_correct, time_elapsed, answered_at')
      .order('is_correct', { ascending: false, nullsFirst: false })
      .order('time_elapsed', { ascending: true, nullsLast: true }) // Chi non ha risposto (NULL) va alla fine
      .order('answered_at', { ascending: true }); // Tie-breaker: chi ha premesso submit prima vince

    if (quizError) throw quizError;

    // 4. Crea mappa di posizioni quiz
    const quizPositions = new Map<string, number>();
    quizAnswers?.forEach((answer, index) => {
      quizPositions.set(answer.user_id, index + 1);
    });

    // 5. Ordina utenti per posizione quiz (chi non ha fatto quiz va alla fine)
    const orderedUsers = eligibleUsers.sort((a, b) => {
      const posA = quizPositions.get(a.id) || 9999;
      const posB = quizPositions.get(b.id) || 9999;
      return posA - posB;
    });

    // 6. Cancella eventuali turni precedenti
    await supabase.from('extraction').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 7. Crea i turni di estrazione (senza gift_id pre-assegnato!)
    const extractionRecords = orderedUsers.map((user, index) => ({
      user_id: user.id,
      receiver_id: user.id, // Manteniamo per compatibilità, sarà aggiornato dopo scelta
      gift_id: null, // NULL - sarà assegnato quando l'utente clicca sulla keyword
      order_position: index + 1,
      revealed_at: null
    }));

    const { error: insertError } = await supabase
      .from('extraction')
      .insert(extractionRecords);

    if (insertError) throw insertError;

    // 8. Abilita l'estrazione nelle settings
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        draw_enabled: true,
        extraction_started_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) throw updateError;

    return {
      success: true,
      message: `Estrazione live iniziata! ${orderedUsers.length} partecipanti pronti.`,
      turnsCreated: orderedUsers.length
    };

  } catch (error: any) {
    console.error('Error starting interactive extraction:', error);
    return {
      success: false,
      message: error.message || 'Errore durante l\'avvio dell\'estrazione'
    };
  }
}

/**
 * Ferma l'estrazione live e resetta tutto
 */
export async function stopInteractiveExtraction(): Promise<StartExtractionResult> {
  try {
    // 1. Disabilita l'estrazione
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        draw_enabled: false,
        extraction_completed_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Estrazione live terminata!'
    };

  } catch (error: any) {
    console.error('Error stopping extraction:', error);
    return {
      success: false,
      message: error.message || 'Errore durante l\'arresto dell\'estrazione'
    };
  }
}

/**
 * Resetta completamente l'estrazione (cancella tutti i turni)
 * ATTENZIONE: Operazione irreversibile!
 */
export async function resetExtraction(): Promise<StartExtractionResult> {
  try {
    // 1. Cancella tutti i record di estrazione
    await supabase.from('extraction').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Resetta settings
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        draw_enabled: false,
        extraction_started_at: null,
        extraction_completed_at: null
      })
      .eq('id', 1);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Estrazione resettata con successo!'
    };

  } catch (error: any) {
    console.error('Error resetting extraction:', error);
    return {
      success: false,
      message: error.message || 'Errore durante il reset dell\'estrazione'
    };
  }
}
