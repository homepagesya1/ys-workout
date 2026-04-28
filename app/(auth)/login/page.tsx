'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import WelcomePopup from '@/components/ui/WelcomePopup'

function OAuthButton({
  provider,
  label,
  icon,
  onClick,
}: {
  provider: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: 'var(--spacing-md)',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(151,125,255,0.25)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--color-text)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'background 0.2s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
      onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    >
      {icon}
      {label}
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Ungültige E-Mail oder Passwort')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved, has_seen_welcome')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_approved === false) {
      await supabase.auth.signOut()
      setError('Dein Account ist noch nicht freigeschaltet.')
      setLoading(false)
      return
    }

    // Erstes Login → Popup zeigen, dann Flag setzen
    if (!profile?.has_seen_welcome) {
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', data.user.id)
      setLoading(false)
      setShowWelcome(true)
      return
    }

    router.push('/routines')
    router.refresh()
  }

  async function handleOAuth(provider: 'google') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <>
      {showWelcome && (
        <WelcomePopup
          onClose={() => {
            setShowWelcome(false)
            router.push('/routines')
            router.refresh()
          }}
        />
      )}

      <main style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
              YS.Workout
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
              Login to Record your Workout
            </p>
          </div>

          <div className="glass" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

            {error && (
              <div style={{
                background: 'rgba(255,68,68,0.15)',
                border: '1px solid rgba(255,68,68,0.3)',
                borderRadius: 'var(--radius-main)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-danger)',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <OAuthButton
              provider="google"
              label="Mit Google anmelden"
              onClick={() => handleOAuth('google')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(151,125,255,0.2)' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>oder</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(151,125,255,0.2)' }} />
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  E-Mail
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
              </div>

              <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  background: loading ? 'rgba(151,125,255,0.4)' : 'var(--color-primary)',
                  color: 'var(--color-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Noch kein Account?{' '}
              <Link href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}