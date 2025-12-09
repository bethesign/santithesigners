import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { useGiftUpload, GiftFormData } from '../hooks/useGiftUpload';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Countdown } from '../components/dashboard/Countdown';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Upload, Link as LinkIcon, Gift, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GiftUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitGift, loading, error, uploadProgress } = useGiftUpload();

  const [giftType, setGiftType] = useState<'digital' | 'physical'>('digital');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('settings')
        .select('gifts_deadline')
        .eq('id', 1)
        .single();

      if (data?.gifts_deadline) {
        setDeadline(new Date(data.gifts_deadline));
      }
    }
    loadSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (giftType === 'digital') {
        setFile(e.target.files[0]);
      } else {
        setPhoto(e.target.files[0]);
      }
    }
  };

  const handleSubmit = async () => {
    const formData: GiftFormData = {
      type: giftType,
      title,
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
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold">Carica il tuo regalo</h1>
               <p className="text-gray-500">Scegli qualcosa di speciale!</p>
            </div>
          </div>
          {deadline && (
            <div className="scale-75 origin-top-left md:origin-top-right">
              <Countdown targetDate={deadline} />
            </div>
          )}
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-t-4 border-t-brand-primary">
          <CardContent className="pt-6">
            <Tabs defaultValue="digital" onValueChange={setGiftType} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-full h-12">
                <TabsTrigger value="digital" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <LinkIcon className="h-4 w-4 mr-2" /> Regalo Digitale
                </TabsTrigger>
                <TabsTrigger value="physical" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Gift className="h-4 w-4 mr-2" /> Regalo Fisico
                </TabsTrigger>
              </TabsList>

              {success ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Regalo caricato!</h2>
                  <p className="text-gray-600">Redirect alla dashboard...</p>
                </motion.div>
              ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Titolo del regalo *</label>
                    <Input
                      placeholder="Es. Buono Amazon, Libro Kindle, Tazza..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <TabsContent value="digital" className="space-y-6 mt-0">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Link (URL)</label>
                        <Input
                          placeholder="https://..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Oppure carica un file</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                        id="digital-file"
                      />
                      <label
                        htmlFor="digital-file"
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer block"
                      >
                        <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="font-medium text-gray-700">
                          {file ? file.name : 'Clicca per caricare un file'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG fino a 10MB</p>
                      </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Messaggio per il destinatario</label>
                        <Textarea
                          placeholder="Scrivi un pensiero carino..."
                          className="min-h-[100px]"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">Note private (solo per te)</label>
                        <Textarea
                          placeholder="Appunti personali..."
                          className="min-h-[60px] bg-yellow-50/50 border-yellow-200"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="physical" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Foto del regalo *</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="physical-photo"
                      />
                      <label
                        htmlFor="physical-photo"
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer block"
                      >
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all">
                            <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">
                          {photo ? photo.name : 'Clicca per caricare una foto del regalo'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG fino a 10MB</p>
                      </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Messaggio per il destinatario</label>
                        <Textarea
                          placeholder="Scrivi un pensiero carino..."
                          className="min-h-[100px]"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">Note private (solo per te)</label>
                        <Textarea
                          placeholder="Appunti personali..."
                          className="min-h-[60px] bg-yellow-50/50 border-yellow-200"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </TabsContent>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-6 mt-6 border-t">
                  <Button
                    className="w-full text-lg h-12 rounded-full"
                    variant="secondary"
                    onClick={handleSubmit}
                    disabled={loading || !title.trim()}
                  >
                    {loading ? `Caricamento... ${uploadProgress}%` : 'Salva Regalo'}
                  </Button>
                </div>
              </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};
