'use client'

import Link from 'next/link'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { useLang } from '@/lib/LanguageContext'
import { translations } from './translations'

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '11px', fontWeight: '600', color: 'var(--color-primary)', letterSpacing: '0.5px', textTransform: 'uppercase', width: 'fit-content' }}>
      {children}
    </div>
  )
}

function ScreenshotPlaceholder() {
  return (
    <div style={{ aspectRatio: '9/16', maxWidth: '240px', width: '100%', borderRadius: '28px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(139,92,246,0.45)', fontSize: '12px', fontWeight: '500' }}>
      <span style={{ fontSize: '28px' }}>📱</span>
      <span>Screenshot coming soon</span>
    </div>
  )
}

export default function AppTourPage() {
  const { lang } = useLang()
  const t = translations[lang]

  const sections = [
    t.sections.routines,
    t.sections.liveSession,
    t.sections.records,
    t.sections.logbook,
    t.sections.install,
  ]

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        .land-fade-1 { animation: fadeUp 0.6s ease both; }
        .land-fade-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-primary { transition: opacity 0.2s ease, transform 0.2s ease; }
        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
          max-width: 900px; margin: 0 auto 64px;
          padding: 0 var(--spacing-lg);
        }
        .screenshot-wrap {
          display: flex; justify-content: center; align-items: center; flex-shrink: 0;
        }
        @media (max-width: 650px) {
          .feature-row { grid-template-columns: 1fr; gap: var(--spacing-lg); }
          .feature-img  { order: 2; }
          .feature-text { order: 1; }
        }
      `}</style>

      <LandingHeader />

      <main style={{ minHeight: 'calc(100dvh - 60px)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflowX: 'hidden' }}>

        {/* Glow */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animation: 'pulse-glow 6s ease-in-out infinite' }} />
        </div>

        {/* Hero */}
        <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '56px var(--spacing-lg) 64px' }}>
          <Link href="/" className="land-fade-1" style={{ display: 'inline-block', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
            {t.back}
          </Link>
          <h1 className="land-fade-2" style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-1px', maxWidth: '600px', margin: '0 auto' }}>
            {t.pageTitle}
          </h1>
        </section>

        {/* Feature rows */}
        {sections.map((s, i) => {
          const rtl = i % 2 !== 0
          return (
            <div
              key={i}
              className="feature-row"
              style={rtl ? { direction: 'rtl' } : undefined}
            >
              <div className="screenshot-wrap feature-img" style={rtl ? { direction: 'ltr' } : undefined}>
                <ScreenshotPlaceholder />
              </div>
              <div
                className="feature-text"
                style={{ ...(rtl ? { direction: 'ltr' } : {}), display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}
              >
                <FeatureTag>{s.tag}</FeatureTag>
                <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{s.title}</h2>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{s.body}</p>
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 var(--spacing-lg) 80px' }}>
          <div style={{ display: 'inline-block', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-main)', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.06)', maxWidth: '480px' }}>
            <p style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '800', marginBottom: 'var(--spacing-lg)', letterSpacing: '-0.3px' }}>{t.cta.title}</p>
            <Link href="/register" className="land-btn-primary" style={{ padding: '13px 32px', borderRadius: '9999px', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
              {t.cta.button}
            </Link>
          </div>
        </section>

        <LandingFooter />
      </main>
    </>
  )
}
