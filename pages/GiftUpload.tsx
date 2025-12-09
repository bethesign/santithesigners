import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Countdown } from '../components/dashboard/Countdown';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Upload, Link as LinkIcon, Gift, Camera } from 'lucide-react';
import { motion } from 'motion/react';

export const GiftUpload = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const extractionDate = new Date('2024-12-24T20:00:00');
  const [giftType, setGiftType] = useState('digital');

  return (
    <DashboardLayout onNavigate={onNavigate}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold">Carica il tuo regalo</h1>
               <p className="text-gray-500">Scegli qualcosa di speciale!</p>
            </div>
          </div>
          <div className="scale-75 origin-top-left md:origin-top-right">
             <Countdown targetDate={extractionDate} />
          </div>
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

              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Titolo del regalo *</label>
                    <Input placeholder="Es. Buono Amazon, Libro Kindle, Tazza..." />
                </div>

                <TabsContent value="digital" className="space-y-6 mt-0">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Link (URL)</label>
                        <Input placeholder="https://..." />
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="font-medium text-gray-700">Clicca o trascina un file qui</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG fino a 10MB</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Messaggio per il destinatario</label>
                        <Textarea placeholder="Scrivi un pensiero carino..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">Note private (solo per te)</label>
                        <Textarea placeholder="Appunti personali..." className="min-h-[60px] bg-yellow-50/50 border-yellow-200" />
                    </div>
                </TabsContent>

                <TabsContent value="physical" className="space-y-6 mt-0">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="h-16 w-16 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center mb-3 shadow-sm transition-all">
                            <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">Carica una foto del regalo</p>
                        <p className="text-xs text-gray-400 mt-1">Aiuterà a identificarlo durante l'estrazione</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Messaggio per il destinatario</label>
                        <Textarea placeholder="Scrivi un pensiero carino..." className="min-h-[100px]" />
                    </div>
                </TabsContent>
              </div>

              <div className="pt-6 mt-6 border-t">
                 <Button className="w-full text-lg h-12 rounded-full" variant="secondary">
                    Salva Regalo
                 </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};
