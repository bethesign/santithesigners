import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { getGiftColor } from '../utils/giftColors';

interface Gift {
  id: string;
  keyword: string;
  user_id: string;
  title: string;
  type: 'digital' | 'physical';
  message: string;
  photo_url: string | null;
}

interface ExtractionTurn {
  id: string;
  user_id: string;
  gift_id: string | null;
  order_position: number;
  revealed_at: string | null;
  user: {
    full_name: string;
  };
  gift?: Gift;
}

interface ExtractionState {
  currentTurn: ExtractionTurn | null;
  isMyTurn: boolean;
  myTurn: ExtractionTurn | null;
  allTurns: ExtractionTurn[];
  availableGifts: Gift[];
  revealingGift: (Gift & {
    user: { full_name: string };
    chosen_by_user_id: string | null;
    chosen_by_user_name: string | null;
  }) | null;
  loading: boolean;
  error: string | null;
}

export function useInteractiveExtraction(userId: string | undefined) {
  const [state, setState] = useState<ExtractionState>({
    currentTurn: null,
    isMyTurn: false,
    myTurn: null,
    allTurns: [],
    availableGifts: [],
    revealingGift: null,
    loading: true,
    error: null,
  });

  const loadExtractionData = async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 1. Carica tutti i turni di estrazione
      const { data: turns, error: turnsError } = await supabase
        .from('extraction')
        .select(`
          id,
          user_id,
          gift_id,
          order_position,
          revealed_at,
          users!extraction_user_id_fkey(full_name)
        `)
        .order('order_position', { ascending: true });

      if (turnsError) throw turnsError;

      // Format turns - se l'utente è in extraction, ha già fatto il quiz
      const formattedTurns: ExtractionTurn[] = (turns || [])
        .map((t: any) => ({
          id: t.id,
          user_id: t.user_id,
          gift_id: t.gift_id,
          order_position: t.order_position,
          revealed_at: t.revealed_at,
          user: { full_name: t.users.full_name }
        }));

      // 4. Trova il turno corrente (primo senza revealed_at)
      const currentTurn = formattedTurns.find(t => !t.revealed_at) || null;

      // 5. Trova il mio turno
      const myTurn = formattedTurns.find(t => t.user_id === userId) || null;

      // Debug logging
      console.log('🎯 Turn Calculation:', {
        userId,
        currentTurn: currentTurn ? {
          user_id: currentTurn.user_id,
          order_position: currentTurn.order_position,
          user_name: currentTurn.user.full_name
        } : null,
        myTurn: myTurn ? {
          user_id: myTurn.user_id,
          order_position: myTurn.order_position
        } : null,
        isMyTurn: currentTurn?.user_id === userId,
        allTurns: formattedTurns.map(t => ({
          user_id: t.user_id,
          order_position: t.order_position,
          revealed_at: t.revealed_at,
          user_name: t.user.full_name
        }))
      });

      // 6. Carica regali disponibili (non ancora scelti)
      const chosenGiftIds = formattedTurns
        .filter(t => t.gift_id !== null)
        .map(t => t.gift_id);

      let giftsQuery = supabase
        .from('gifts')
        .select('id, keyword, user_id, title, type, message, photo_url');

      // Escludi regali già scelti
      if (chosenGiftIds.length > 0) {
        giftsQuery = giftsQuery.not('id', 'in', `(${chosenGiftIds.join(',')})`);
      }

      // NON escludiamo il proprio regalo dalla query!
      // Il regalo dell'utente deve essere visibile ma non selezionabile
      // (il controllo di non-selezione è fatto lato client)

      const { data: gifts, error: giftsError } = await giftsQuery;

      if (giftsError) throw giftsError;

      // Load live reveal state
      const { data: liveState } = await supabase
        .from('live_state')
        .select('revealing_gift_id')
        .eq('id', 1)
        .maybeSingle();

      let revealingGift = null;
      if (liveState?.revealing_gift_id) {
        // Load the full gift details + who created it
        const { data: giftData } = await supabase
          .from('gifts')
          .select('*, users!gifts_user_id_fkey(full_name)')
          .eq('id', liveState.revealing_gift_id)
          .maybeSingle();

        // Load who CHOSE this gift during extraction
        const { data: extractionData } = await supabase
          .from('extraction')
          .select('user_id, users!extraction_user_id_fkey(full_name)')
          .eq('gift_id', liveState.revealing_gift_id)
          .maybeSingle();

        if (giftData) {
          // Find the index of this gift in the available gifts to assign consistent color
          const giftIndex = (gifts || []).findIndex(g => g.id === giftData.id);
          const colorIndex = giftIndex !== -1 ? giftIndex : 0;

          revealingGift = {
            ...giftData,
            user: { full_name: giftData.users.full_name },
            color: getGiftColor(colorIndex),
            // Add who chose this gift
            chosen_by_user_id: extractionData?.user_id || null,
            chosen_by_user_name: extractionData?.users?.full_name || null
          };
          console.log('🎁 Revealing Gift Data:', revealingGift);
          console.log('🎨 Gift Color:', revealingGift.color);
          console.log('👤 Chosen by:', revealingGift.chosen_by_user_name);
        }
      }

      setState({
        currentTurn,
        isMyTurn: currentTurn?.user_id === userId,
        myTurn,
        allTurns: formattedTurns,
        availableGifts: gifts || [],
        revealingGift,
        loading: false,
        error: null,
      });

    } catch (err: any) {
      console.error('Error loading extraction data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Errore durante il caricamento'
      }));
    }
  };

  useEffect(() => {
    loadExtractionData();

    // Single channel for all extraction updates using broadcast
    const channel = supabase
      .channel('extraction_room')
      // Listen for gift selections (postgres changes)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extraction'
        },
        (payload) => {
          console.log('🔄 Extraction table changed:', payload);
          loadExtractionData();
        }
      )
      // Listen for broadcast messages (when someone clicks "Prossimo")
      .on('broadcast', { event: 'reveal_closed' }, (payload) => {
        console.log('📢 Reveal closed broadcast received:', payload);
        loadExtractionData();
      })
      // Listen for gift chosen broadcast
      .on('broadcast', { event: 'gift_chosen' }, (payload) => {
        console.log('📢 Gift chosen broadcast received:', payload);
        loadExtractionData();
      })
      .subscribe((status) => {
        console.log('📡 Extraction channel status:', status);
      });

    return () => {
      console.log('🔌 Unsubscribing from extraction channel');
      channel.unsubscribe();
    };
  }, [userId]);

  const chooseGift = async (giftId: string): Promise<{ success: boolean; message: string }> => {
    if (!userId || !state.myTurn) {
      return { success: false, message: 'Non sei autorizzato' };
    }

    if (!state.isMyTurn) {
      return { success: false, message: 'Non è il tuo turno!' };
    }

    try {
      // 1. Set the revealing gift (triggers reveal modal for everyone)
      await supabase
        .from('live_state')
        .update({ revealing_gift_id: giftId, revealed_at: new Date().toISOString() })
        .eq('id', 1);

      // 2. Update the extraction record (marks turn as complete)
      const { error } = await supabase
        .from('extraction')
        .update({
          gift_id: giftId,
          revealed_at: new Date().toISOString()
        })
        .eq('id', state.myTurn.id);

      if (error) throw error;

      // 3. Broadcast to all clients that a gift was chosen
      await supabase
        .channel('extraction_room')
        .send({
          type: 'broadcast',
          event: 'gift_chosen',
          payload: { giftId, userId }
        });

      return { success: true, message: 'Regalo scelto!' };

    } catch (err: any) {
      console.error('Error choosing gift:', err);
      return { success: false, message: err.message || 'Errore durante la scelta' };
    }
  };

  const closeReveal = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🚪 Closing reveal modal...');

      // Clear the revealing state (closes modal for everyone)
      const { data, error } = await supabase
        .from('live_state')
        .update({ revealing_gift_id: null, revealed_at: null })
        .eq('id', 1);

      console.log('🚪 Close reveal result:', { data, error });

      if (error) throw error;

      // Broadcast to all clients that reveal was closed
      console.log('📢 Sending reveal_closed broadcast...');
      await supabase
        .channel('extraction_room')
        .send({
          type: 'broadcast',
          event: 'reveal_closed',
          payload: { userId }
        });

      // Reload data to show next turn
      await loadExtractionData();

      return { success: true, message: 'Chiuso!' };
    } catch (err: any) {
      console.error('Error closing reveal:', err);
      return { success: false, message: err.message || 'Errore durante la chiusura' };
    }
  };

  return {
    ...state,
    chooseGift,
    closeReveal,
    reload: loadExtractionData,
  };
}
