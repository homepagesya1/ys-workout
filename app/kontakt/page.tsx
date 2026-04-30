// app/kontakt/page.tsx
'use client'

import { useState } from 'react'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { useLang } from '@/lib/LanguageContext'

export default function KontaktPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const { tr } = useLang()
  const c = tr.contact

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    try {
      const res = await fetch('https://formspree.io/f/mreybznj', {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
      })
      if (res.ok) { setStatus('success'); form.reset() } else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <>
      <LandingHeader />

      <main style={{
        minHeight: 'calc(100dvh - 60px)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', letterSpacing: '-0.5px' }}>{c.title}</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>{c.subtitle}</p>
          </div>

          {status === 'success' ? (
            <div className="glass" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <h2 style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{c.successTitle}</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{c.successBody}</p>
              <button onClick={() => setStatus('idle')} style={{ padding: 'var(--spacing-md)', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '600', cursor: 'pointer' }}>
                {c.successAgain}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="glass" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {status === 'error' && (
                  <div style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 'var(--radius-main)', padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)', textAlign: 'center' }}>
                    {c.errorMsg}
                  </div>
                )}
                {[
                  { label: c.emailLabel, name: 'email', type: 'email', placeholder: c.emailPlaceholder },
                  { label: c.nameLabel, name: 'name', type: 'text', placeholder: c.namePlaceholder },
                ].map(f => (
                  <div key={f.name} style={{ borderBottom: '1px solid rgba(139,92,246,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                    <input type={f.type} name={f.name} placeholder={f.placeholder} required style={{ background: 'transparent', color: 'var(--color-text)', border: 'none', outline: 'none', fontSize: 'var(--font-size-base)', width: '100%' }} />
                  </div>
                ))}
                <div style={{ borderBottom: '1px solid rgba(139,92,246,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>{c.messageLabel}</label>
                  <textarea name="message" placeholder={c.messagePlaceholder} required rows={5} style={{ background: 'transparent', color: 'var(--color-text)', border: 'none', outline: 'none', fontSize: 'var(--font-size-base)', width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
                </div>
                <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: 'var(--spacing-md)', background: status === 'sending' ? 'rgba(139,92,246,0.4)' : 'var(--color-primary)', color: 'var(--color-text)', border: 'none', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-md)', fontWeight: '600', cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s ease' }}>
                  {status === 'sending' ? c.sending : c.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <LandingFooter />
    </>
  )
}