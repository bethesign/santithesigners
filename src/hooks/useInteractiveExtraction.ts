import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface Gift {
  id: string;
  keyword: string;
  user_id: string;
  title: string;
  type: 'digital' | 'physical';
  message: string;
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

      console.log('🎁 Chosen gift IDs:', chosenGiftIds);
      console.log('👤 Current userId:', userId);

      let giftsQuery = supabase
        .from('gifts')
        .select('id, keyword, user_id, title, type, message');

      // Escludi regali già scelti
      if (chosenGiftIds.length > 0) {
        console.log('🚫 Excluding chosen gifts:', chosenGiftIds);
        giftsQuery = giftsQuery.not('id', 'in', `(${chosenGiftIds.join(',')})`);
      }

      // Escludi il mio regalo (solo se userId è definito)
      if (userId) {
        console.log('🚫 Excluding my gift from user:', userId);
        giftsQuery = giftsQuery.neq('user_id', userId);
      }

      const { data: gifts, error: giftsError } = await giftsQuery;

      console.log('✅ Available gifts loaded:', gifts);
      console.log('❌ Gifts error:', giftsError);

      if (giftsError) throw giftsError;

      setState({
        currentTurn,
        isMyTurn: currentTurn?.user_id === userId,
        myTurn,
        allTurns: formattedTurns,
        availableGifts: gifts || [],
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

    return () => {
      subscription.unsubscribe();
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
      // Aggiorna il turno con il regalo scelto
      const { error } = await supabase
        .from('extraction')
        .update({
          gift_id: giftId,
          revealed_at: new Date().toISOString()
        })
        .eq('id', state.myTurn.id);

      if (error) throw error;

      // Ricarica i dati
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
