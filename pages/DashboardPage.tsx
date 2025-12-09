import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { DashboardCard } from '../components/dashboard/DashboardCard'
import { Countdown } from '../components/dashboard/Countdown'
import { Button } from '../components/ui/button'
import { Gift, ScrollText, Timer, PartyPopper } from 'lucide-react'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

interface UserData {
  id: string
  email: string
  full_name: string
  city: string
  role: string
  has_uploaded_gift: boolean
  is_shipping_address_complete: boolean
}

interface GiftData {
  id: string
  type: 'digital' | 'physical'
  title: string
  created_at: string
}

interface QuizAnswer {
  id: string
  answered_at: string
  position?: number
}

interface Settings {
  gifts_deadline: string | null
  quiz_available_date: string | null
  extraction_available_date: string | null
  draw_enabled: boolean
  draw_started: boolean
  current_turn: number
  extraction_completed_at: string | null
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [gift, setGift] = useState<GiftData | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<QuizAnswer | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [hasReceivedGift, setHasReceivedGift] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get current user from auth
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        onNavigate('login')
        return
      }

      // Fetch user data from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }

      setUser(userData)

      // Fetch user's gift (maybeSingle returns null if not found instead of error)
      const { data: giftData } = await supabase
        .from('gifts')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()

      setGift(giftData)

      // Fetch quiz answer and calculate position
      const { data: answerData } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (answerData) {
        // Calculate position
        const { count } = await supabase
          .from('quiz_answers')
          .select('*', { count: 'exact', head: true })
          .lt('answered_at', answerData.answered_at)

        setQuizAnswer({
          ...answerData,
          position: (count || 0) + 1
        })
      }

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      setSettings(settingsData)

      // Check if user has received gift (after extraction)
      if (settingsData?.extraction_completed_at) {
        const { data: extractionData } = await supabase
          .from('extraction')
          .select('revealed_at')
          .eq('receiver_id', authUser.id)
          .not('revealed_at', 'is', null)
          .maybeSingle()

        setHasReceivedGift(!!extractionData)
      }

      setLoading(false)
    } catch (err) {
      console.error('Dashboard load error:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userName="..." isLive={false} onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Caricamento...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  // Calculate deadline
  const deadline = settings?.gifts_deadline ? new Date(settings.gifts_deadline) : null
  const isBeforeDeadline = deadline ? new Date() < deadline : true
  const isExtractionLive = settings?.draw_started || false

  return (
    <DashboardLayout userName={user.full_name.split(' ')[0]} isLive={isExtractionLive} onNavigate={onNavigate}>
      <div className="flex flex-col gap-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Ciao, {user.full_name.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-2">Benvenuto nel tuo pannello di controllo.</p>
          </div>
          {deadline && !settings?.extraction_completed_at && (
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <p className="text-center text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                {isBeforeDeadline ? 'Deadline regali tra' : 'Estrazione tra'}
              </p>
              <Countdown targetDate={deadline} />
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-6">
            {/* Card "Il Tuo Regalo" */}
            <DashboardCard
              title="Il Tuo Regalo"
              icon={Gift}
              status={gift ? 'completed' : 'pending'}
              actionLabel={gift ? (isBeforeDeadline ? "Modifica Regalo" : "Visualizza Regalo") : "Carica Regalo"}
              onClick={() => onNavigate('gift-upload')}
            >
              {!gift ? (
                <div>
                  <p className="mb-2">Non hai ancora caricato il regalo che farai. Caricalo per partecipare all'estrazione!</p>
                  {deadline && (
                    <p className="text-sm text-gray-500">
                      Deadline: {deadline.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-dashed">
                    <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
                      <Gift className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{gift.title}</p>
                      <p className="text-xs text-gray-500">
                        Tipo: {gift.type === 'digital' ? 'Digitale' : 'Fisico'}
                      </p>
                    </div>
                  </div>
                  {!isBeforeDeadline && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Deadline scaduta - non più modificabile
                    </div>
                  )}
                </div>
              )}
            </DashboardCard>

            {/* Card "Quiz" */}
            <DashboardCard
              title="Quiz di Posizionamento"
              icon={ScrollText}
              status={quizAnswer ? 'completed' : 'pending'}
              actionLabel={quizAnswer ? "Vedi Risultato" : "Inizia Quiz"}
              onClick={() => onNavigate('quiz')}
            >
              {!quizAnswer ? (
                <p>Rispondi al quiz per determinare l'ordine di estrazione. La velocità conta!</p>
              ) : (
                <div>
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg text-green-800 mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Quiz completato!
                    </span>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span className="font-bold">
                        {new Date(quizAnswer.answered_at).toLocaleTimeString('it-IT')}
                      </span>
                    </div>
                  </div>
                  {quizAnswer.position && (
                    <p className="text-sm text-gray-600">
                      Posizione provvisoria: <span className="font-bold">#{quizAnswer.position}</span>
                    </p>
                  )}
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Card "Regalo Ricevuto" */}
            <DashboardCard
              title="Regalo Ricevuto"
              icon={PartyPopper}
              status={hasReceivedGift ? 'completed' : 'locked'}
              actionLabel="Apri Regalo"
              disabled={!hasReceivedGift}
              onClick={() => onNavigate('gift-received')}
            >
              {!hasReceivedGift ? (
                <p className="text-gray-400 italic">Il tuo regalo apparirà qui dopo l'estrazione.</p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Gift className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-green-700">Hai ricevuto un regalo!</p>
                </div>
              )}
            </DashboardCard>

            {/* Card "Estrazione Live" */}
            <DashboardCard
              title="Estrazione Live"
              icon={Timer}
              status={
                settings?.extraction_completed_at ? 'completed' :
                settings?.draw_started ? 'active' :
                settings?.draw_enabled ? 'pending' : 'locked'
              }
              actionLabel={
                settings?.extraction_completed_at ? "Vedi Risultati" :
                settings?.draw_started ? "Segui in Diretta" :
                settings?.draw_enabled ? "Vai all'Estrazione" : "Non Disponibile"
              }
              disabled={!settings?.draw_enabled}
              onClick={() => onNavigate('extraction')}
            >
              {!settings?.draw_enabled ? (
                <div>
                  <p className="text-gray-500">L'estrazione non è ancora disponibile.</p>
                  {settings?.extraction_available_date && (
                    <p className="text-sm text-gray-400 mt-1">
                      Inizierà il {new Date(settings.extraction_available_date).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
              ) : settings?.extraction_completed_at ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-blue-700">Estrazione completata!</p>
                </div>
              ) : settings?.draw_started ? (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold animate-pulse">
                    <span className="h-2 w-2 bg-red-600 rounded-full" />
                    LIVE
                  </div>
                  <p className="mt-2 text-sm">
                    Turno {settings.current_turn} in corso
                  </p>
                </div>
              ) : (
                <p className="text-blue-600 font-medium">L'estrazione sta per iniziare! Resta connesso.</p>
              )}
            </DashboardCard>
          </div>
        </div>

        {/* Warning se non hai completato quiz o regalo */}
        {(!gift || !quizAnswer) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900">Attenzione!</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  {!gift && !quizAnswer && 'Devi caricare un regalo E completare il quiz per partecipare all\'estrazione.'}
                  {!gift && quizAnswer && 'Devi caricare un regalo per partecipare all\'estrazione.'}
                  {gift && !quizAnswer && 'Devi completare il quiz per partecipare all\'estrazione.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
