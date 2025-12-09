import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkEmailExists } from '../lib/supabase/auth';
import { supabase } from '../lib/supabase/client';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { InputWithIcon } from '../components/ui/InputWithIcon';
import { Mail, Lock, Eye, EyeOff, Gift } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  const handleCheckEmail = async () => {
    if (!email.includes('@')) {
      setError('Inserisci un indirizzo email valido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if email exists in users table (pre-authorized users)
      const emailExists = await checkEmailExists(email);

      if (!emailExists) {
        setError('Email non autorizzata. Non fai parte del Secret Santa.');
        setLoading(false);
        return;
      }

      // Try to sign in with a dummy password to check if account exists
      const { error: testError } = await supabase.auth.signInWithPassword({
        email,
        password: '__test__password__check__',
      });

      // If user doesn't exist yet, redirect to first access
      if (testError && testError.message.includes('Invalid login credentials')) {
        // This could mean: no account, or wrong password
        // We'll show password field and handle it there
        setIsReturningUser(true);
      } else {
        // Some other error or success (shouldn't happen with dummy password)
        setIsReturningUser(true);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking email:', err);
      setError('Errore durante la verifica. Riprova.');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError('Inserisci la password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email o password non corretti.');
        } else {
          setError('Errore durante il login. Riprova.');
        }
        setLoading(false);
        return;
      }

      // Success - AuthContext will handle redirect via ProtectedRoute
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Errore durante il login. Riprova.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <Card className="border-border/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Bentornato!
            </CardTitle>
            <p className="text-center text-sm text-gray-500">
              Accedi al tuo account Secret Santa
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <InputWithIcon
                icon={Mail}
                type="email"
                placeholder="nome@azienda.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isReturningUser) handleCheckEmail();
                }}
                className={error ? "border-red-500 ring-red-500/20" : ""}
              />
            </div>

            {isReturningUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <InputWithIcon
                  icon={Lock}
                  iconPosition="left"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // Second icon for toggle is not supported by my simple InputWithIcon component properly yet
                  // but I can add a button outside or hack it. 
                  // Let's rely on standard UI pattern: Input with toggle inside right.
                  // My InputWithIcon supports right icon but not both left and right easily unless I update it.
                  // Wait, InputWithIcon takes `icon` and `iconPosition`. It doesn't take `rightIcon`.
                  // I'll just use a relative wrapper here for the eye icon.
                />
                 <div className="flex justify-end -mt-8 mr-3 relative z-10">
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                 </div>
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}

            <Button
                className="w-full text-lg font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                size="lg"
                onClick={isReturningUser ? handleLogin : handleCheckEmail}
                disabled={loading}
                variant="default"
            >
              {loading ? 'Caricamento...' : (isReturningUser ? 'Accedi' : 'Continua')}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Primo accesso?{' '}
                <button
                    onClick={() => navigate('/first-access')}
                    className="font-semibold text-brand-primary hover:underline focus:outline-none"
                >
                  Attiva il tuo account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
};
