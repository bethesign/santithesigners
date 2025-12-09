'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)

  // Step 1 - Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Step 2 - Shipping Address (optional)
  const [skipAddress, setSkipAddress] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    zip: '',
    province: '',
    notes: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (!email) {
      router.push('/auth/login')
      return
    }

    // Fetch user data
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        router.push('/auth/login')
        return
      }

      setUserData(data)
    }

    fetchUser()
  }, [email, router, supabase])

  useEffect(() => {
    // Calculate password strength
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(strength, 3))
  }, [password])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
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
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email!,
        password: password,
        options: {
          data: {
            full_name: userData.full_name,
          }
        }
      })

      if (authError) {
        setError('Errore durante la creazione dell\'account: ' + authError.message)
        setLoading(false)
        return
      }

      // Move to step 2
      setStep(2)
      setLoading(false)
    } catch (err) {
      setError('Errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!skipAddress) {
        // Validate address
        if (!address.street || !address.city || !address.zip || !address.province) {
          setError('Compila tutti i campi obbligatori')
          setLoading(false)
          return
        }

        // Update user with address
        const { error: updateError } = await supabase
          .from('users')
          .update({
            shipping_address_street: address.street,
            shipping_address_city: address.city,
            shipping_address_zip: address.zip,
            shipping_address_province: address.province,
            shipping_address_notes: address.notes || null,
            is_shipping_address_complete: true,
          })
          .eq('email', email)

        if (updateError) {
          setError('Errore durante il salvataggio dell\'indirizzo')
          setLoading(false)
          return
        }
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorazione */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-radial from-christmas-green via-christmas-darkGreen to-christmas-darkGreen items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white text-6xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
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
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-christmas-green mb-2">
              Benvenuto, {userData.full_name}! 👋
            </h2>
            <p className="text-gray-600">
              {step === 1 ? 'Crea la tua password' : 'Inserisci il tuo indirizzo'}
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-christmas-green text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-christmas-green' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-christmas-green text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {step === 1 ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green"
                    placeholder="Crea una password sicura"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded ${
                            passwordStrength >= level
                              ? passwordStrength === 1
                                ? 'bg-red-500'
                                : passwordStrength === 2
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Forza password:{' '}
                      {passwordStrength === 1 ? 'Debole' : passwordStrength === 2 ? 'Media' : passwordStrength === 3 ? 'Forte' : ''}
                    </p>
                  </div>
                )}

                {/* Requirements Checklist */}
                <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                  <p className="font-semibold text-gray-700">La password deve contenere:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className="mr-2">{password.length >= 8 ? '✓' : '○'}</span>
                      Almeno 8 caratteri
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                      Una lettera maiuscola
                    </div>
                    <div className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '○'}</span>
                      Un numero
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Conferma Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green"
                    placeholder="Ripeti la password"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-christmas-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creazione account...' : 'Continua'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
                  L'indirizzo è necessario solo se riceverai un regalo fisico da un collega in un'altra città. Puoi compilarlo anche più tardi.
                </div>

                {/* Address Fields */}
                <div>
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                    Via e Numero
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    disabled={skipAddress}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green disabled:bg-gray-100"
                    placeholder="Via Roma, 123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      Città
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      disabled={skipAddress}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green disabled:bg-gray-100"
                      placeholder="Milano"
                    />
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">
                      CAP
                    </label>
                    <input
                      id="zip"
                      type="text"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      disabled={skipAddress}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green disabled:bg-gray-100"
                      placeholder="20100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                    Provincia
                  </label>
                  <input
                    id="province"
                    type="text"
                    value={address.province}
                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    disabled={skipAddress}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green disabled:bg-gray-100"
                    placeholder="MI"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    id="notes"
                    value={address.notes}
                    onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    disabled={skipAddress}
                    rows={2}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-christmas-green disabled:bg-gray-100"
                    placeholder="Citofono, piano, etc."
                  />
                </div>

                {/* Skip Checkbox */}
                <div className="flex items-center">
                  <input
                    id="skip"
                    type="checkbox"
                    checked={skipAddress}
                    onChange={(e) => setSkipAddress(e.target.checked)}
                    className="w-4 h-4 text-christmas-green border-gray-300 rounded focus:ring-christmas-green"
                  />
                  <label htmlFor="skip" className="ml-2 text-sm text-gray-700">
                    Compila dopo (lo inserirò se necessario)
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-christmas-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Salvataggio...' : 'Completa Registrazione'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  )
}
