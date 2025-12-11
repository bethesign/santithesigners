import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

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
  revealingGift: (Gift & { user: { full_name: string } }) | null;
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

      const formattedTurns: ExtractionTurn[] = (turns || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        gift_id: t.gift_id,
        order_position: t.order_position,
        revealed_at: t.revealed_at,
        user: { full_name: t.users.full_name }
      }));

      // 2. Trova il turno corrente (primo senza revealed_at)
      const currentTurn = formattedTurns.find(t => !t.revealed_at) || null;

      // 3. Trova il mio turno
      const myTurn = formattedTurns.find(t => t.user_id === userId) || null;

      // 4. Carica regali disponibili (non ancora scelti)
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
        // Load the full gift details + who chose it
        const { data: giftData } = await supabase
          .from('gifts')
          .select('*, users!gifts_user_id_fkey(full_name)')
          .eq('id', liveState.revealing_gift_id)
          .maybeSingle();

        if (giftData) {
          revealingGift = {
            ...giftData,
            user: { full_name: giftData.users.full_name }
          };
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

    // Realtime subscription per aggiornamenti
    const subscription = supabase
      .channel('extraction_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extraction'
        },
        () => {
          loadExtractionData();
        }
      )
      .subscribe();

    // Subscription to live_state for shared reveal modal
    const liveStateSubscription = supabase
      .channel('live_state_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_state'
        },
        () => {
          loadExtractionData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      liveStateSubscription.unsubscribe();
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

      // 2. Wait 5 seconds for everyone to see the animation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. Update the extraction record (marks turn as complete)
      const { error } = await supabase
        .from('extraction')
        .update({
          gift_id: giftId,
          revealed_at: new Date().toISOString()
        })
        .eq('id', state.myTurn.id);

      if (error) throw error;

      // 4. Clear the revealing state (closes modal for everyone)
      await supabase
        .from('live_state')
        .update({ revealing_gift_id: null, revealed_at: null })
        .eq('id', 1);

      // Reload data
      await loadExtractionData();

      return { success: true, message: 'Regalo scelto!' };

    } catch (err: any) {
      console.error('Error choosing gift:', err);
      return { success: false, message: err.message || 'Errore durante la scelta' };
    }
  };

  return {
    ...state,
    chooseGift,
    reload: loadExtractionData,
  };
}
