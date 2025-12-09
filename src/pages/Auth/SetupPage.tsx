import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'

interface SetupPageProps {
  onNavigate: (page: string) => void
  email: string
  userData: any
}

export const SetupPage: React.FC<SetupPageProps> = ({ onNavigate, email, userData }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 - Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false)

  // Step 2 - Address (optional)
  const [skipAddress, setSkipAddress] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    zip: '',
    province: '',
    notes: ''
  })

  useEffect(() => {
    // Calculate password strength
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(strength, 3))
  }, [password])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('La password deve contenere almeno una lettera maiuscola')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('La password deve contenere almeno un numero')
      return
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    setLoading(true)

    try {
      console.log('SetupPage: Creating user account with email:', email)

      // Create user account using RPC function (server-side)
      const { data: createResult, error: createError } = await supabase.rpc('create_user_account', {
        user_email: email,
        user_password: password,
        user_full_name: userData.full_name
      })

      console.log('SetupPage: Create account result:', createResult)

      if (createError) {
        console.error('CreateError:', createError)
        setError('Errore durante la creazione dell\'account: ' + createError.message)
        setLoading(false)
        return
      }

      if (!createResult.success) {
        if (createResult.error === 'user_already_exists') {
          // User exists, try to sign in with the password
          console.log('User already exists, trying signIn')
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            setError('Account già esistente. Password errata.')
            setLoading(false)
            return
          }
        } else {
          setError(createResult.message || 'Errore durante la creazione dell\'account')
          setLoading(false)
          return
        }
      } else {
        // Account created successfully, now sign in
        console.log('Account created, signing in')
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('Account creato ma errore nel login. Riprova dalla pagina di login.')
          setLoading(false)
          return
        }
      }

      // Success - move to step 2
      setStep(2)
      setLoading(false)
    } catch (err) {
      console.error('Setup error:', err)
      setError('Errore imprevisto')
      setLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)

      if (!user) {
        setError('Devi effettuare il login prima di salvare l\'indirizzo')
        setLoading(false)
        return
      }

      if (!skipAddress) {
        if (!address.street || !address.zip || !address.province) {
          setError('Compila tutti i campi obbligatori')
          setLoading(false)
          return
        }

        console.log('Updating address for user:', user.id, email)

        // Update using user ID instead of email for RLS
        // City viene presa da userData.city (già presente in users table)
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            shipping_address_street: address.street,
            shipping_address_city: userData.city, // usa la città già presente
            shipping_address_zip: address.zip,
            shipping_address_province: address.province,
            shipping_address_notes: address.notes || null,
            is_shipping_address_complete: true,
          })
          .eq('id', user.id)
          .select()

        console.log('Update result:', { updateData, updateError })

        if (updateError) {
          console.error('Update error:', updateError)
          setError('Errore salvataggio indirizzo: ' + updateError.message)
          setLoading(false)
          return
        }
      }

      onNavigate('dashboard')
    } catch (err) {
      console.error('Address submit error:', err)
      setError('Errore imprevisto')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-christmas-darkGreen via-christmas-green to-christmas-darkGreen relative overflow-hidden">
      {/* Snowflakes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white text-3xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.3
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Ti diamo il benvenuto, {userData.full_name}! 👋
          </h2>
          <p className="text-white text-lg drop-shadow-md">
            {step === 1 ? 'Crea la tua password' : 'Inserisci il tuo indirizzo (opzionale)'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-christmas-gold text-christmas-darkGreen shadow-lg' : 'bg-white/30 text-white'}`}>1</div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-christmas-gold' : 'bg-white/30'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-christmas-gold text-christmas-darkGreen shadow-lg' : 'bg-white/30 text-white'}`}>2</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 backdrop-blur-sm">
          {step === 1 ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPasswordField ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green"
                    placeholder="Crea una password sicura"
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

              {password && (
                <div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-2 flex-1 rounded ${passwordStrength >= level ? (passwordStrength === 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Forza: {passwordStrength === 1 ? 'Debole' : passwordStrength === 2 ? 'Media' : passwordStrength === 3 ? 'Forte' : ''}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-md space-y-1 text-sm">
                <p className="font-semibold text-gray-700">Requisiti:</p>
                <div className={password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>
                  {password.length >= 8 ? '✓' : '○'} Almeno 8 caratteri
                </div>
                <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Una maiuscola
                </div>
                <div className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Un numero
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Conferma Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPasswordField ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green"
                    placeholder="Ripeti la password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPasswordField(!showConfirmPasswordField)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPasswordField ? (
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

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Creazione...' : 'Continua'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
                Necessario solo se riceverai un regalo fisico da un collega in un'altra città. Puoi compilarlo dopo.
              </div>

              {/* Info Città precompilata */}
              <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-md">
                <label className="block text-xs font-semibold text-gray-500 mb-1">La tua città</label>
                <p className="text-gray-900 font-medium">{userData.city}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Via e Numero civico</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green"
                  placeholder="Via Roma, 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CAP</label>
                  <input
                    type="text"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green"
                    placeholder="20100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Provincia</label>
                  <input
                    type="text"
                    value={address.province}
                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green"
                    placeholder="MI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Note aggiuntive (opzionale)</label>
                <textarea
                  value={address.notes}
                  onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green resize-none"
                  placeholder="Scala, interno, citofono..."
                  rows={2}
                />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-christmas-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvataggio...' : 'Salva Indirizzo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSkipAddress(true)
                    handleAddressSubmit(new Event('submit') as any)
                  }}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-full border-2 border-gray-300 transition-all disabled:opacity-50"
                >
                  Compila in seguito
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
