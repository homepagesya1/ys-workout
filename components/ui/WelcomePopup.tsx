'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/LanguageContext'

interface Props {
  onClose: () => void
}

export default function WelcomePopup({ onClose }: Props) {
  const router = useRouter()
  const { tr } = useLang()
  const w = tr.auth.welcome

  const steps = [
    { icon: '✅', title: w.step1Title, desc: w.step1Body },
    { icon: '📲', title: w.step2Title, desc: w.step2Body },
    { icon: '💪', title: w.step3Title, desc: w.step3Body },
  ]

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
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <button onClick={handleNext} style={{
            width: '100%', padding: 'var(--spacing-md)',
            background: 'var(--color-primary)', color: 'var(--color-text)',
            border: 'none', borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-md)', fontWeight: '600', cursor: 'pointer',
          }}>
            {isLast ? w.toLogin : w.next}
          </button>
          {!isLast && (
            <button onClick={() => { onClose(); router.push('/login') }} style={{
              width: '100%', padding: 'var(--spacing-sm)',
              background: 'none', border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)', cursor: 'pointer',
            }}>
              {w.skip}
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
