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

const screenshots: string[] = [
  'Trainer_Dashboard.PNG',
  'Trainer_Client.PNG',
  'Trainer_Templates.PNG',
  'Trainer_Client_Logbook.PNG',
  'Client_Plan.PNG',
  'Client_Dashboard_Active_session.PNG',
]

export default function PersonalTrainerPage() {
  const { lang } = useLang()
  const t = translations[lang]

  const sections = [
    t.sections.clients,
    t.sections.planBuilder,
    t.sections.templates,
    t.sections.logbook,
    t.sections.clientPlans,
    t.sections.clientSession,
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
        .land-fade-3 { animation: fadeUp 0.6s 0.2s ease both; }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-primary { transition: opacity 0.2s ease, transform 0.2s ease; }
        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
          max-width: 900px; margin: 0 auto 64px;
          padding: 0 var(--spacing-lg);
        }
        .screenshot-phone {
          width: 100%; max-width: 240px; border-radius: 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07);
          display: block;
        }
        .screenshot-wrap {
          display: flex; justify-content: center; align-items: center; flex-shrink: 0;
        }
        @media (max-width: 650px) {
          .feature-row { grid-template-columns: 1fr; gap: var(--spacing-lg); }
          .screenshot-phone { max-width: 200px; }
          .feature-img  { order: 2; }
          .feature-text { order: 1; }
        }
      `}</style>

      <LandingHeader />

      <main style={{ minHeight: 'calc(100dvh - 60px)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflowX: 'hidden' }}>

        {/* Glow */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', animation: 'pulse-glow 6s ease-in-out infinite' }} />
        </div>

        {/* Hero */}
        <section style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '56px var(--spacing-lg) 72px', gap: 'var(--spacing-lg)' }}>
          <Link href="/" className="land-fade-1" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
            {t.back}
          </Link>
          <h1 className="land-fade-2" style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1.5px', maxWidth: '680px' }}>
            {t.hero.title}
          </h1>
          <p className="land-fade-2" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', maxWidth: '520px', lineHeight: '1.7' }}>
            {t.hero.subtitle}
          </p>
          <Link href="/register" className="land-btn-primary land-fade-3" style={{ padding: '14px 32px', borderRadius: '9999px', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-md)', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
            {t.hero.cta}
          </Link>
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
                <img
                  src={`/pt-feature/${screenshots[i]}`}
                  alt={s.title}
                  className="screenshot-phone"
                />
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
          <div style={{ display: 'inline-block', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-main)', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.06)', maxWidth: '520px' }}>
            <p style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', marginBottom: 'var(--spacing-sm)', letterSpacing: '-0.3px' }}>{t.cta.title}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.7' }}>{t.cta.subtitle}</p>
            <Link href="/register" className="land-btn-primary" style={{ padding: '13px 32px', borderRadius: '9999px', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
              {t.cta.button}
            </Link>
          </div>
        </section>

        {/* Contact trainer */}
        <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 var(--spacing-lg) 80px' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-main)', border: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)', maxWidth: '480px' }}>
            <span style={{ fontSize: '32px' }}>🏋️</span>
            <p style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: '700', letterSpacing: '-0.3px' }}>{t.contact.title}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{t.contact.body}</p>
            <Link href="/kontakt" className="land-btn-primary" style={{ padding: '11px 28px', borderRadius: '9999px', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}>
              {t.contact.button}
            </Link>
          </div>
        </section>

        <LandingFooter />
      </main>
    </>
  )
}
