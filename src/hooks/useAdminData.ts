import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  has_uploaded_gift: boolean;
  gift_is_physical: boolean;
  quiz_completed: boolean;
  quiz_is_correct: boolean | null;
  quiz_position: number | null;
  quiz_time: number | null;
  is_admin: boolean;
}

export interface Settings {
  id: number;
  gifts_deadline: string | null;
  extraction_available_date: string | null;
  draw_enabled: boolean;
  draw_started: boolean;
  current_turn: number;
  extraction_generated_at: string | null;
  extraction_completed_at: string | null;
}

export function useAdminData() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, has_uploaded_gift, role')
        .order('full_name', { ascending: true });

      if (usersError) throw usersError;

      // Fetch quiz answers to get positions, times, and correctness
      const { data: quizAnswers, error: quizError } = await supabase
        .from('quiz_answers')
        .select('user_id, answered_at, time_elapsed, is_correct')
        .order('answered_at', { ascending: true });

      if (quizError) throw quizError;

      // Fetch gifts to check if physical
      const { data: gifts, error: giftsError } = await supabase
        .from('gifts')
        .select('user_id, type');

      if (giftsError) throw giftsError;

      // Combine data
      const participantsData: Participant[] = (users || []).map((user, index) => {
        const quizAnswer = quizAnswers?.find(qa => qa.user_id === user.id);
        const quizPosition = quizAnswer
          ? quizAnswers.findIndex(qa => qa.user_id === user.id) + 1
          : null;
        const gift = gifts?.find(g => g.user_id === user.id);

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          has_uploaded_gift: user.has_uploaded_gift,
          gift_is_physical: gift?.type === 'physical',
          quiz_completed: !!quizAnswer,
          quiz_is_correct: quizAnswer?.is_correct ?? null,
          quiz_position: quizPosition,
          quiz_time: quizAnswer?.time_elapsed || null,
          is_admin: (user as any).role === 'admin',
        };
      });

      setParticipants(participantsData);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;

      setSettings(settingsData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Errore durante il caricamento dei dati');
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return {
    participants,
    settings,
    loading,
    error,
    refreshData: loadData,
  };
}
