import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  has_uploaded_gift: boolean;
  quiz_completed: boolean;
  quiz_position: number | null;
  is_admin: boolean;
}

export interface Settings {
  id: number;
  gifts_deadline: string | null;
  draw_enabled: boolean;
  draw_started: boolean;
  current_turn: number;
  extraction_generated_at: string | null;
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
        .select('id, full_name, email, has_uploaded_gift, is_admin')
        .order('full_name', { ascending: true });

      if (usersError) throw usersError;

      // Fetch quiz answers to get positions
      const { data: quizAnswers, error: quizError } = await supabase
        .from('quiz_answers')
        .select('user_id, answered_at')
        .order('answered_at', { ascending: true });

      if (quizError) throw quizError;

      // Combine data
      const participantsData: Participant[] = (users || []).map((user, index) => {
        const quizAnswer = quizAnswers?.find(qa => qa.user_id === user.id);
        const quizPosition = quizAnswer
          ? quizAnswers.findIndex(qa => qa.user_id === user.id) + 1
          : null;

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          has_uploaded_gift: user.has_uploaded_gift,
          quiz_completed: !!quizAnswer,
          quiz_position: quizPosition,
          is_admin: user.is_admin,
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
    reload: loadData,
  };
}
