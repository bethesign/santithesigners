import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_BUCKET } from '../lib/constants';

export interface GiftFormData {
  type: 'digital' | 'physical';
  title: string;
  keyword: string;
  url?: string;
  file?: File | null;
  photo?: File | null;
  message: string;
  notes: string;
}

export function useGiftUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Errore upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const submitGift = async (formData: GiftFormData) => {
    if (!user) {
      setError('Utente non autenticato');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Il titolo è obbligatorio');
      }

      if (!formData.keyword.trim()) {
        throw new Error('La parola chiave è obbligatoria');
      }

      if (formData.type === 'digital') {
        if (!formData.url && !formData.file) {
          throw new Error('Inserisci almeno un URL o carica un file');
        }
      } else if (formData.type === 'physical') {
        if (!formData.photo) {
          throw new Error('La foto è obbligatoria per regali fisici');
        }
      }

      let filePath: string | null = null;
      let photoUrl: string | null = null;

      // Upload files if present
      if (formData.file) {
        setUploadProgress(30);
        filePath = await uploadFile(formData.file, user.id);
      }

      if (formData.photo) {
        setUploadProgress(50);
        photoUrl = await uploadFile(formData.photo, user.id);
      }

      setUploadProgress(70);

      // Check if gift already exists (upsert)
      const { data: existingGift } = await supabase
        .from('gifts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const giftData = {
        user_id: user.id,
        type: formData.type,
        title: formData.title.trim(),
        keyword: formData.keyword.trim().toUpperCase(),
        url: formData.url || null,
        file_path: filePath,
        photo_url: photoUrl,
        message: formData.message.trim() || null,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (existingGift) {
        // Update existing
        const { error: updateError } = await supabase
          .from('gifts')
          .update(giftData)
          .eq('id', existingGift.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('gifts')
          .insert(giftData);

        if (insertError) throw insertError;
      }

      setUploadProgress(90);

      // Update user.has_uploaded_gift flag
      await supabase
        .from('users')
        .update({ has_uploaded_gift: true })
        .eq('id', user.id);

      setUploadProgress(100);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Error submitting gift:', err);
      setError(err.message || 'Errore durante il salvataggio');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    submitGift,
    loading,
    error,
    uploadProgress,
  };
}
