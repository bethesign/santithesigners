import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../components/ui/utils';

export const FirstAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const email = location.state?.email;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Address fields
  const [address, setAddress] = useState({
    via: '',
    citta: '',
    cap: '',
    provincia: '',
    note: ''
  });

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/login');
      return;
    }

    // Fetch user data to get name and city
    async function fetchUserData() {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, city')
        .eq('email', email)
        .maybeSingle();

      if (data) {
        setUserId(data.id);
        setUserName(data.full_name);
        // Pre-populate city from users table
        if (data.city) {
          setAddress(prev => ({ ...prev, citta: data.city }));
        }
      }
    }

    fetchUserData();
  }, [email, navigate]);

  const checkStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass)
    };
  };

  const strength = checkStrength(password);
  const isPasswordValid = strength.length && strength.uppercase && strength.number && password === confirmPassword && password.length > 0;

  const handleNext = async () => {
    if (!isPasswordValid || !email) return;

    setLoading(true);
    setError('');

    try {
      // Development warning for test emails
      if (process.env.NODE_ENV === 'development' && email.includes('@thesigners.it')) {
        console.warn('⚠️ Test email detected (@thesigners.it). Use a real email address to avoid Supabase bounce issues.');
        console.warn('See TESTING.md for guidelines on testing with valid emails.');
      }

      // Create Supabase Auth user
      const { error: signUpError } = await signUp(email, password, {
        email,
        full_name: userName,
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(`Errore: ${signUpError.message || 'Creazione account fallita'}`);
        setLoading(false);
        return;
      }

      // Success - move to step 2 (address)
      setStep(2);
      setLoading(false);
    } catch (err) {
      console.error('Error in handleNext:', err);
      setError('Errore imprevisto. Riprova.');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      navigate('/dashboard');
      return;
    }

    // Validate required fields (address + contact email)
    if (!address.via?.trim() || !address.citta?.trim() || !address.cap?.trim() || !address.provincia?.trim()) {
      setError('Tutti i campi dell\'indirizzo sono obbligatori');
      return;
    }

    if (!contactEmail?.trim()) {
      setError('L\'email personale è obbligatoria');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setError('Inserisci un\'email valida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update address and contact email in users table
      await supabase
        .from('users')
        .update({
          contact_email: contactEmail,
          shipping_address_street: address.via,
          shipping_address_city: address.citta,
          shipping_address_zip: address.cap,
          shipping_address_province: address.provincia,
          shipping_address_notes: address.note,
          is_shipping_address_complete: true,
        })
        .eq('id', userId);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Errore durante il salvataggio');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px]"
      >
        {/* Progress Indicator */}
        <div className="flex justify-center mb-6 space-x-4">
            <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 1 ? "bg-brand-secondary" : "bg-gray-200")} />
            <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 2 ? "bg-brand-secondary" : "bg-gray-200")} />
        </div>

        <Card className="border-border/50 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#da2c38]">
                {step === 1 ? "Imposta Password" : "Dove spediamo?"}
            </CardTitle>
            <p className="text-center text-gray-800">
                Ciao, {userName || 'Utente'}! {step === 1 ? "Iniziamo configurando il tuo account." : "Per i regali fisici."}
            </p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">Nuova Password</label>
                        <div className="relative">
                          <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">Conferma Password</label>
                        <div className="relative">
                          <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg text-sm">
                        <p className="font-medium text-gray-700 mb-2">Requisiti di sicurezza:</p>
                        <RequirementItem met={strength.length} text="Almeno 8 caratteri" />
                        <RequirementItem met={strength.uppercase} text="Una lettera maiuscola" />
                        <RequirementItem met={strength.number} text="Un numero" />
                        <RequirementItem met={password === confirmPassword && password.length > 0} text="Le password coincidono" />
                    </div>

                    {error && (
                      <div className="text-sm text-red-500 text-center">
                        {error}
                      </div>
                    )}

                    <Button
                        className="w-full mt-4 bg-[#226f54] text-white hover:bg-[#1a5640]"
                        disabled={!isPasswordValid || loading}
                        onClick={handleNext}
                    >
                        {loading ? 'Creazione account...' : 'Continua'}
                    </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>Se riceverai un regalo fisico, questo è l'indirizzo a cui verrà spedito.</span>
                    </div>

                    <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Email personale *"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-600 -mt-2">Email per essere contattato da chi ti ha fatto il regalo (diversa dall'email di accesso)</p>

                        <Input placeholder="Via e Numero Civico *" value={address.via} onChange={e => setAddress({...address, via: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Città *" value={address.citta} onChange={e => setAddress({...address, citta: e.target.value})} required />
                            <Input placeholder="CAP *" value={address.cap} onChange={e => setAddress({...address, cap: e.target.value})} required />
                        </div>
                        <Input placeholder="Provincia *" value={address.provincia} onChange={e => setAddress({...address, provincia: e.target.value})} required />
                        <Input placeholder="Note per il corriere (opzionale)" value={address.note} onChange={e => setAddress({...address, note: e.target.value})} />
                    </div>

                    {error && (
                      <div className="text-sm text-red-500 text-center mt-4">
                        {error}
                      </div>
                    )}

                    <Button
                        className="w-full mt-6 bg-[#226f54] text-white hover:bg-[#1a5640]"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Salvataggio...' : 'Salva e Vai'}
                    </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2">
        <div className={cn("h-4 w-4 rounded-full flex items-center justify-center", met ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400")}>
            {met ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
        </div>
        <span className={cn(met ? "text-green-700" : "text-gray-500")}>{text}</span>
    </div>
);
