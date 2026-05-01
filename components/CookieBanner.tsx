// components/CookieBanner.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext'

const CONSENT_KEY = 'ys_cookie_consent'

export function CookieBanner() {
  const { tr, lang } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'all')
    setVisible(false)
    // window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'necessary')
    setVisible(false)
    // window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes ys-banner-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ys-cookie-banner {
          position: fixed;
          z-index: 9999;
          animation: ys-banner-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          bottom: 1.25rem;
          right: 1.25rem;
          left: auto;
          max-width: 22rem;
          width: calc(100vw - 2.5rem);
          border-radius: 1rem;
          background: rgba(18, 18, 22, 0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139,92,246,0.2);
          padding: 1.125rem 1.25rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        @media (max-width: 540px) {
          .ys-cookie-banner {
            bottom: 0;
            right: 0;
            left: 0;
            max-width: 100%;
            width: 100%;
            border-radius: 1rem 1rem 0 0;
            box-shadow: 0 -4px 32px rgba(0,0,0,0.5);
          }
        }
        .ys-cookie-btn-secondary {
          flex: 1 1 0;
          padding: 0.55rem 0.75rem;
          font-size: 0.775rem;
          font-weight: 500;
          border-radius: 0.625rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #a1a1aa;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ys-cookie-btn-secondary:hover {
          background: rgba(255,255,255,0.06);
          color: #f4f4f5;
        }
        .ys-cookie-btn-primary {
          flex: 1 1 0;
          padding: 0.55rem 0.75rem;
          font-size: 0.775rem;
          font-weight: 700;
          border-radius: 0.625rem;
          border: none;
          background: var(--color-primary, #8b5cf6);
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .ys-cookie-btn-primary:hover { opacity: 0.85; }
      `}</style>

      <div
        className="ys-cookie-banner"
        role="dialog"
        aria-label={tr.cookies.title}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>🍪</span>
          <p style={{
            margin: 0,
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#f4f4f5',
            letterSpacing: '-0.01em',
          }}>
            {tr.cookies.title}
          </p>
        </div>

        {/* Body */}
        <p style={{
          margin: 0,
          fontSize: '0.775rem',
          lineHeight: 1.6,
          color: '#a1a1aa',
        }}>
          {tr.cookies.body}{' '}
          <Link
            href={`/datenschutz`}
            style={{
              color: '#c4b5fd',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {tr.cookies.learnMore}
          </Link>
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="ys-cookie-btn-secondary" onClick={handleDecline}>
            {tr.cookies.decline}
          </button>
          <button className="ys-cookie-btn-primary" onClick={handleAccept}>
            {tr.cookies.accept}
          </button>
        </div>
      </div>
    </>
  )
}