import React, { useState } from 'react'
import { supabase } from '../../lib/supabase/client'

interface LoginPageProps {
  onNavigate: (page: string, data?: any) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // STEP 1: User inserts email → check if authorized
      if (!showPassword) {
        const { data: checkData, error: checkError } = await supabase.rpc('check_email_authorized', {
          user_email: email
        })

        if (checkError || !checkData?.authorized) {
          setError('Email non autorizzata. Non fai parte del Secret Santa.')
          setLoading(false)
          return
        }

        // Email exists in users table → check if auth account exists
        const { data: userExists, error: checkAuthError } = await supabase.rpc('check_auth_user_exists', {
          user_email: email
        })

        console.log('Auth user exists check:', { userExists, checkAuthError })
        console.log('UserExists type:', typeof userExists, 'value:', userExists)

        // IMPORTANT: checkAuthError means the RPC function doesn't exist or failed
        if (checkAuthError) {
          console.error('RPC check_auth_user_exists failed:', checkAuthError)
          setError('Errore nel controllo utente. Verifica che le funzioni RPC siano state create su Supabase.')
          setLoading(false)
          return
        }

        // If user exists in auth → show password field for login
        if (userExists === true) {
          console.log('User exists in auth, showing password field')
          setShowPassword(true)
          setLoading(false)
          return
        }

        // User doesn't exist in auth → FIRST ACCESS → redirect to setup
        console.log('First access, redirecting to setup')
        onNavigate('setup', {
          email,
          userData: {
            id: checkData.user_id,
            full_name: checkData.full_name,
            city: checkData.city,
            role: checkData.role
          }
        })
        setLoading(false)
        return
      }

      // STEP 2: Password field shown → try login
      const { data: checkData } = await supabase.rpc('check_email_authorized', {
        user_email: email
      })

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Password errata. Riprova.')
        setLoading(false)
        return
      }

      // Login successful
      console.log('Login successful!')
      if (checkData?.role === 'admin') {
        onNavigate('admin')
      } else {
        onNavigate('dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorazione */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-christmas-green via-christmas-darkGreen to-christmas-darkGreen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white text-6xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            >
              {i % 3 === 0 ? '🎄' : i % 3 === 1 ? '🎁' : '❄️'}
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-christmas-offWhite mb-4">
            Secret Santa
          </h1>
          <p className="text-2xl text-christmas-gold">2024</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-christmas-offWhite">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-christmas-green mb-2">
              Secret Santa 🎄
            </h2>
            <h1 className="text-4xl font-black text-christmas-darkGreen mb-2">
              Bentornato!
            </h1>
            <p className="text-gray-600">
              Accedi per partecipare allo scambio regali
            </p>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email aziendale
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green"
                    placeholder="mario.rossi@thesigners.it"
                  />
                </div>
              </div>

              {/* Password Input - shown only after email check */}
              {showPassword && (
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPasswordField ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={showPassword}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green"
                      placeholder="Inserisci la tua password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordField(!showPasswordField)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordField ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Caricamento...' : showPassword ? 'Accedi' : 'Continua'}
              </button>
            </form>

            {/* Info Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Primo accesso? Inserisci la tua email aziendale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
