import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardData {
  user: {
    id: string;
    full_name: string;
    email: string;
    city: string | null;
    has_uploaded_gift: boolean;
    is_shipping_address_complete: boolean;
  } | null;
  gift: {
    id: string;
    type: 'digital' | 'physical';
    title: string;
    created_at: string;
  } | null;
  quizAnswer: {
    id: string;
    answer: string;
    answered_at: string;
    position: number; // Calculated position based on speed
  } | null;
  receivedGift: {
    giver_name: string;
    gift: any;
  } | null;
  settings: {
    gifts_deadline: string | null;
    draw_date: string | null;
    draw_enabled: boolean;
    draw_started: boolean;
    current_turn: number;
    extraction_completed_at: string | null;
  } | null;
  myTurn: {
    order_position: number;
    revealed_at: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useUserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    user: null,
    gift: null,
    quizAnswer: null,
    receivedGift: null,
    settings: null,
    myTurn: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    async function fetchDashboardData() {
      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Fetch user's gift
        const { data: giftData } = await supabase
          .from('gifts')
          .select('id, type, title, created_at')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch user's quiz answer
        const { data: quizData } = await supabase
          .from('quiz_answers')
          .select('id, answer, answered_at')
          .eq('user_id', user.id)
          .maybeSingle();

        // Calculate quiz position if quiz answered
        let quizPosition = null;
        if (quizData) {
          const { count } = await supabase
            .from('quiz_answers')
            .select('*', { count: 'exact', head: true })
            .lt('answered_at', quizData.answered_at);

          quizPosition = (count ?? 0) + 1;
        }

        // Fetch settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        // Fetch user's extraction turn (if exists)
        const { data: extractionData } = await supabase
          .from('extraction')
          .select('order_position, revealed_at')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch received gift (if revealed)
        let receivedGift = null;
        if (settingsData?.draw_enabled) {
          const { data: receivedData } = await supabase
            .from('extraction')
            .select(`
              user_id,
              revealed_at,
              users!extraction_user_id_fkey(full_name),
              gifts:gifts!inner(*)
            `)
            .eq('receiver_id', user.id)
            .not('revealed_at', 'is', null)
            .single();

          if (receivedData) {
            receivedGift = {
              giver_name: (receivedData.users as any)?.full_name || 'Anonimo',
              gift: receivedData.gifts,
            };
          }
        }

        setData({
          user: userData,
          gift: giftData,
          quizAnswer: quizData ? { ...quizData, position: quizPosition || 0 } : null,
          receivedGift,
          settings: settingsData,
          myTurn: extractionData,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Errore durante il caricamento dei dati',
        }));
      }
    }

    fetchDashboardData();

    // Setup realtime subscription for settings changes
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'extraction',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return data;
}
