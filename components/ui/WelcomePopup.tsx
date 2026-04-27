'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  onClose: () => void
}

const steps = [
  {
    icon: '✅',
    title: 'Account erstellt!',
    desc: 'Willkommen bei YS.Workout. Dein Account wurde erfolgreich registriert.',
  },
  {
    icon: '📲',
    title: 'App installieren',
    desc: 'Füge YS.Workout zum Homescreen hinzu — kein App Store nötig.',
    extra: (
      <div style={{
        background: 'rgba(151,125,255,0.08)',
        border: '1px solid rgba(151,125,255,0.2)',
        borderRadius: 'var(--radius-main)',
        padding: 'var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
        textAlign: 'left',
        lineHeight: '1.7',
      }}>
        <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '6px' }}>🍎 iPhone (Safari)</strong>
        Teilen <span style={{ color: 'var(--color-primary)' }}>⬆</span> → <em>„Zum Home-Bildschirm"</em>
        <br /><br />
        <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '6px' }}>🤖 Android (Chrome)</strong>
        Menü <span style={{ color: 'var(--color-primary)' }}>⋮</span> → <em>„Zum Startbildschirm"</em>
        <br /><br />
        <Link href="/help" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', fontWeight: '500' }}>
          Ausführliche Anleitung →
        </Link>
      </div>
    ),
  },
  {
    icon: '💪',
    title: 'Bereit!',
    desc: 'Jetzt kannst du dich einloggen und mit dem Tracken starten.',
  },
]

export default function WelcomePopup({ onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1
  const current = steps[step]

  function handleNext() {
    if (isLast) {
      onClose()
      router.push('/login')
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--spacing-lg)',
      zIndex: 1000,
    }}>
      <div className="glass" style={{
        width: '100%', maxWidth: '360px',
        padding: 'var(--spacing-xl)',
        display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)',
        animation: 'swSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: '3px', borderRadius: '99px', flex: 1,
              background: i <= step ? 'var(--color-primary)' : 'rgba(151,125,255,0.2)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ fontSize: '52px', lineHeight: 1 }}>{current.icon}</div>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
              {current.title}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              {current.desc}
            </p>
          </div>
          {'extra' in current && current.extra}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <button onClick={handleNext} style={{
            width: '100%', padding: 'var(--spacing-md)',
            background: 'var(--color-primary)', color: 'var(--color-text)',
            border: 'none', borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-md)', fontWeight: '600', cursor: 'pointer',
          }}>
            {isLast ? 'Zum Login' : 'Weiter'}
          </button>
          {!isLast && (
            <button onClick={() => { onClose(); router.push('/login') }} style={{
              width: '100%', padding: 'var(--spacing-sm)',
              background: 'none', border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)', cursor: 'pointer',
            }}>
              Überspringen
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes swSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}