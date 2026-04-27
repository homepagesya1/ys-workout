'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import WelcomePopup from '@/components/ui/WelcomePopup'

function OAuthButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', padding: 'var(--spacing-md)',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(151,125,255,0.25)',
      borderRadius: 'var(--radius-full)', color: 'var(--color-text)',
      fontSize: 'var(--font-size-sm)', fontWeight: '500', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    }}>
      {icon}{label}
    </button>
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwörter stimmen nicht überein'); return }
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    setShowPopup(true)
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <>
      {showPopup && <WelcomePopup onClose={() => setShowPopup(false)} />}
      <main style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-bg)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>YS.Workout</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Create your account</p>
          </div>
          <div className="glass" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {error && (
              <div style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 'var(--radius-main)', padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)', textAlign: 'center' }}>
                {error}
              </div>
            )}
            <OAuthButton label="Mit Google registrieren" icon={<GoogleIcon />} onClick={() => handleOAuth('google')} />
            <OAuthButton label="Mit Apple registrieren" icon={<AppleIcon />} onClick={() => handleOAuth('apple')} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(151,125,255,0.2)' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>oder</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(151,125,255,0.2)' }} />
            </div>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
              </div>
              <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 8 Zeichen" required autoComplete="new-password" />
              </div>
              <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Passwort bestätigen</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 'var(--spacing-md)', background: loading ? 'rgba(151,125,255,0.4)' : 'var(--color-primary)', color: 'var(--color-text)', border: 'none', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-md)', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Registrieren...' : 'Registrieren'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Bereits ein Account?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}