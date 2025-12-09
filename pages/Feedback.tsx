import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Star, Send } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../components/ui/utils';

export const Feedback = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send data to Supabase here
    setTimeout(() => {
        onNavigate('dashboard');
    }, 2000);
  };

  return (
    <DashboardLayout onNavigate={onNavigate} userName="Mario">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Feedback</h1>
        </div>

        {submitted ? (
             <Card className="text-center py-12">
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <Send className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Grazie!</h2>
                    <p className="text-gray-500">Il tuo feedback è stato inviato con successo.</p>
                </CardContent>
             </Card>
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>Com'è andata l'esperienza?</CardTitle>
                <CardDescription>
                Aiutaci a migliorare il prossimo Secret Santa lasciando un commento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                    <Label>Valutazione Generale</Label>
                    <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn(
                            "h-10 w-10 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary",
                            rating >= star ? "text-yellow-400" : "text-gray-300"
                        )}
                        >
                        <Star className="h-full w-full fill-current" />
                        </button>
                    ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Cosa ti è piaciuto di più? Cosa cambieresti?</Label>
                    <Textarea 
                        id="message" 
                        placeholder="Scrivi qui i tuoi pensieri..." 
                        className="min-h-[150px]"
                        required 
                    />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={rating === 0}>
                    Invia Feedback
                </Button>

                </form>
            </CardContent>
            </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
