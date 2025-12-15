import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { useGiftUpload, GiftFormData } from '../hooks/useGiftUpload';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChevronRight, Monitor, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GiftUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitGift, loading, error, uploadProgress } = useGiftUpload();

  const [giftType, setGiftType] = useState<'digital' | 'physical'>('physical');
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);

      // Create preview for both digital and physical gifts
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: GiftFormData = {
      type: giftType,
      title,
      keyword,
      url: url || undefined,
      file,
      photo,
      message,
      notes,
    };

    const result = await submitGift(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  return (
    <DashboardLayout userName={user?.full_name} isAdmin={user?.role === 'admin'}>
      <div className="max-w-2xl mx-auto">

        {/* Back Button */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <h3 className="text-xl font-bold text-white">Dettagli Regalo</h3>
        </div>

        {/* Form Card - Matching Figma */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl"
        >
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Regalo caricato!</h2>
              <p className="text-slate-400">Redirect alla dashboard...</p>
            </motion.div>
          ) : (
            <>
              {/* Tabs - Matching Figma Style */}
              <div className="flex p-1 bg-slate-900/80 rounded-xl mb-6 border border-white/5 relative">
                <div className="grid grid-cols-2 w-full relative z-10">
                  <button
                    onClick={() => setGiftType('physical')}
                    className={`py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${giftType === 'physical' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span className="text-base">🎁</span>
                    Regalo Fisico
                  </button>
                  <button
                    onClick={() => setGiftType('digital')}
                    className={`py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${giftType === 'digital' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Monitor size={16} />
                    Regalo Digitale
                  </button>
                </div>
                {/* Active Tab Indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 bg-indigo-600 rounded-lg shadow-lg z-0"
                  initial={false}
                  animate={{
                    left: giftType === 'physical' ? '4px' : '50%',
                    width: 'calc(50% - 6px)',
                    x: giftType === 'physical' ? 0 : 2
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cosa regali?</label>
                  <input
                    type="text"
                    required
                    placeholder={giftType === 'physical' ? "Es. Tazza natalizia fatta a mano" : "Es. Abbonamento Spotify 3 mesi"}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Keyword */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Keyword (sul pacco)</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Es. 'Fragile', 'Profumato', 'Musicale'..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                  />
                  <p className="text-[10px] text-slate-500 ml-1">Questa parola apparirà sul pacco misterioso prima dell'apertura.</p>
                </div>

                {/* Link (Digital Only) */}
                <AnimatePresence>
                  {giftType === 'digital' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1.5"
                    >
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Link al regalo</label>
                      <input
                        type="url"
                        required={giftType === 'digital'}
                        placeholder="https://..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Photo Upload - Matching Figma */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Foto del regalo</label>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden relative ${photoPreview ? 'border-indigo-500/50 bg-slate-900/80' : 'border-white/10 bg-slate-900/30 group-hover:bg-slate-900/50 group-hover:border-white/20'}`}>
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <CheckCircle2 className="text-green-400" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-400 transition-colors">
                            <Sparkles size={20} />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">Clicca per caricare una foto</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Messaggio per il destinatario</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Scrivi un pensiero..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Notes (optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Note private (opzionale)</label>
                  <textarea
                    rows={2}
                    placeholder="Appunti personali..."
                    className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-4 py-3 text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-700 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-700 disabled:to-slate-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🎁</span>
                    {loading ? `Caricamento... ${uploadProgress}%` : 'Salva e Partecipa'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
