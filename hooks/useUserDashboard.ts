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
  wonGift: {
    id: string;
    title: string;
    type: 'digital' | 'physical';
    message: string | null;
    photo_url: string | null;
    keyword: string;
  } | null;
  giftRecipient: {
    full_name: string;
    email: string;
    contact_email: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    province: string | null;
    notes: string | null;
    is_complete: boolean;
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
    wonGift: null,
    giftRecipient: null,
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

        // Fetch the gift I won (the gift I selected during extraction)
        let wonGift = null;
        if (extractionData?.revealed_at) {
          const { data: myExtraction } = await supabase
            .from('extraction')
            .select(`
              gift_id,
              gifts!inner(id, title, type, message, photo_url, keyword)
            `)
            .eq('user_id', user.id)
            .not('revealed_at', 'is', null)
            .maybeSingle();

          if (myExtraction && myExtraction.gifts) {
            wonGift = myExtraction.gifts as any;
          }
        }

        // Fetch the person who will receive my gift (who won my gift during extraction)
        let giftRecipient = null;
        if (giftData && settingsData?.draw_enabled) {
          console.log('🔍 Looking for recipient of my gift:', giftData.id);

          const { data: recipientData, error: recipientError } = await supabase
            .from('extraction')
            .select(`
              user_id,
              users!extraction_user_id_fkey(
                full_name,
                email,
                contact_email,
                shipping_address_street,
                shipping_address_city,
                shipping_address_zip,
                shipping_address_province,
                shipping_address_notes,
                is_shipping_address_complete
              )
            `)
            .eq('gift_id', giftData.id)
            .not('revealed_at', 'is', null)
            .maybeSingle();

          console.log('🔍 Recipient query result:', { recipientData, recipientError });

          if (recipientData && recipientData.users) {
            const userData = recipientData.users as any;
            giftRecipient = {
              full_name: userData.full_name,
              email: userData.email,
              contact_email: userData.contact_email || null,
              address: userData.shipping_address_street || null,
              city: userData.shipping_address_city || null,
              postal_code: userData.shipping_address_zip || null,
              province: userData.shipping_address_province || null,
              notes: userData.shipping_address_notes || null,
              is_complete: userData.is_shipping_address_complete || false
            };
            console.log('✅ Gift recipient found:', giftRecipient);
          } else {
            console.log('❌ No recipient found for gift:', giftData.id);
          }
        }

        setData({
          user: userData,
          gift: giftData,
          quizAnswer: quizData ? { ...quizData, position: quizPosition || 0 } : null,
          wonGift,
          giftRecipient,
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
          filter: `user_id=eq.${user.id}`,
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
