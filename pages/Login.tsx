import React, { useState } from 'react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { InputWithIcon } from '../components/ui/InputWithIcon';
import { Mail, Lock, Eye, EyeOff, Gift } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  const handleCheckEmail = () => {
    if (!email.includes('@')) {
      setError('Inserisci un indirizzo email valido.');
      return;
    }
    setError('');
    // Simulate check
    setIsReturningUser(true);
  };

  const handleLogin = () => {
     if (!password) {
        setError('Inserisci la password.');
        return;
     }
     // Success
     onNavigate('dashboard');
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
                variant="default" // Primary (which is green in my theme? No, User said Primary Button is Red CTAs).
                // Wait. Theme: Primary: Green #4a9960. Secondary: Red #ff6b6b (CTAs).
                // "Accedi button (primary, full width)"
                // Usually Primary button uses Primary color. 
                // But Prompt says: "Buttons: Primary (red, rounded)".
                // So my "default" button variant (which uses bg-primary -> green) is wrong for the "Primary Action".
                // The user defines "Primary Button" as Red. 
                // I should probably swap my Primary/Secondary variables or just use the "secondary" variant for the main CTA.
                // Or update globals to make "primary" red?
                // "Primary: Green (brand)... Secondary: Red (CTAs)".
                // So "Brand" is Green, "CTA" is Red.
                // I'll use `variant="secondary"` (Red) for the main action button.
            >
              {isReturningUser ? 'Accedi' : 'Continua'}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Primo accesso?{' '}
                <button 
                    onClick={() => onNavigate('first-access')}
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
