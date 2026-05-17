// app/page.tsx
'use client'

import Link from 'next/link'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { CookieBanner } from '@/components/CookieBanner'
import { useLang } from '@/lib/LanguageContext'

export default function HomePage() {
  const { tr } = useLang()

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
        .land-fade-4 { animation: fadeUp 0.6s 0.3s ease both; }
        .land-fade-5 { animation: fadeUp 0.6s 0.4s ease both; }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-ghost:hover   { background: rgba(139,92,246,0.12) !important; }
        .land-btn-primary       { transition: opacity 0.2s ease, transform 0.2s ease; }
        .land-btn-ghost         { transition: background 0.2s ease; }
        .land-footer-link:hover { opacity: 0.75; }
        .land-footer-link       { transition: opacity 0.2s ease; }

        .screenshot-phone {
          width: 100%; max-width: 240px; border-radius: 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07);
          display: block;
        }
        .screenshot-wide {
          width: 100%; border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07);
          display: block;
        }
        .screenshot-icon {
          width: 120px; height: 120px; border-radius: 28px;
          box-shadow: 0 0 48px rgba(139,92,246,0.35), 0 16px 48px rgba(0,0,0,0.6);
          display: block;
        }
        .screenshot-wrap {
          display: flex; justify-content: center;
          align-items: center; flex-shrink: 0;
        }
        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
          max-width: 900px; margin: 0 auto 64px;
          padding: 0 var(--spacing-lg);
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

        {/* Beta Badge */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', padding: 'var(--spacing-md) var(--spacing-lg) 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)', fontSize: 'var(--font-size-sm)', color: '#FFB400', fontWeight: '500' }}>
            <span>🧪</span><span>{tr.beta}</span>
          </div>
        </div>

        {/* Hero */}
        <section style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '56px var(--spacing-lg) 64px', gap: 'var(--spacing-lg)' }}>
          <h1 className="land-fade-1" style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-1.5px', maxWidth: '700px' }}>
            {tr.hero.title1}{' '}
            <span style={{ color: 'var(--color-primary)' }}>{tr.hero.title2}</span>
          </h1>
          <p className="land-fade-2" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', maxWidth: '500px', lineHeight: '1.7' }}>
            {tr.hero.subtitle}
          </p>
          <div className="land-fade-3" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register" className="land-btn-primary" style={{ padding: '14px 32px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-md)', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
              {tr.hero.cta}
            </Link>
            <Link href="/login" className="land-btn-ghost" style={{ padding: '14px 32px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', fontWeight: '500', textDecoration: 'none', display: 'inline-block' }}>
              {tr.hero.login}
            </Link>
          </div>
          <div className="land-fade-4" style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--spacing-sm)' }}>
            {([tr.hero.badge1, tr.hero.badge2, tr.hero.badge3] as string[]).map((text, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <span>{['✅', '📱', '🔒'][i]}</span>{text}
              </span>
            ))}
          </div>
        </section>

        {/* Feature 1 */}
        <div className="feature-row land-fade-5">
          <div className="screenshot-wrap feature-img">
            <img src="/screenshots/routines.webp" alt="Routinen-Übersicht" className="screenshot-phone" />
          </div>
          <div className="feature-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f1.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f1.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f1.body}</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-row" style={{ direction: 'rtl' }}>
          <div className="screenshot-wrap feature-img" style={{ direction: 'ltr' }}>
            <img src="/screenshots/exercise.webp" alt="Workout Session" className="screenshot-wide" />
          </div>
          <div className="feature-text" style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f2.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f2.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f2.body}</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div className="screenshot-wrap feature-img">
            <img src="/screenshots/stats.webp" alt="Statistiken" className="screenshot-wide" />
          </div>
          <div className="feature-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f3.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f3.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f3.body}</p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature-row" style={{ direction: 'rtl' }}>
          <div className="screenshot-wrap feature-img" style={{ direction: 'ltr' }}>
            <img src="/screenshots/icon.webp" alt="App Icon" className="screenshot-icon" />
          </div>
          <div className="feature-text" style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f4.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f4.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f4.body}</p>
          </div>
        </div>

        {/* Feature 5 */}
        <div className="feature-row">
          <div className="screenshot-wrap feature-img">
            <img src="/screenshots/client.webp" alt="Personal Trainer Plans" className="screenshot-phone" />
          </div>
          <div className="feature-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f5.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f5.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f5.body}</p>
          </div>
        </div>

        {/* Feature 6 */}
        <div className="feature-row" style={{ direction: 'rtl' }}>
          <div className="screenshot-wrap feature-img" style={{ direction: 'ltr' }}>
            <img src="/screenshots/trainer.webp" alt="Trainer Dashboard" className="screenshot-wide" />
          </div>
          <div className="feature-text" style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <FeatureTag>{tr.features.f6.tag}</FeatureTag>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{tr.features.f6.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: 'var(--font-size-sm)' }}>{tr.features.f6.body}</p>
          </div>
        </div>

        {/* Pricing */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 var(--spacing-lg) 80px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {tr.pricing.title1} <span style={{ color: 'var(--color-primary)' }}>{tr.pricing.title2}</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', lineHeight: '1.7' }}>{tr.pricing.subtitle}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="glass" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div style={{ fontSize: '32px' }}>🎉</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>{tr.pricing.free.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.7' }}>{tr.pricing.free.body}</p>
              <Link href="/register" className="land-btn-primary" style={{ marginTop: 'auto', padding: '12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                {tr.pricing.free.cta}
              </Link>
            </div>
            <div className="glass" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <div style={{ fontSize: '32px' }}>❤️</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>{tr.pricing.support.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.7' }}>{tr.pricing.support.body}</p>
              <a href="/spenden" target="_blank" rel="noopener noreferrer" className="land-btn-ghost" style={{ marginTop: 'auto', padding: '12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(139,92,246,0.35)', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                {tr.pricing.support.cta}
              </a>
            </div>
            <div className="glass" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', opacity: 0.8 }}>
              <div style={{ fontSize: '32px' }}>🔮</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>{tr.pricing.soon.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.7' }}>
                {tr.pricing.soon.body} <strong style={{ color: 'var(--color-text)' }}>{tr.pricing.soon.price}</strong>{tr.pricing.soon.suffix}
              </p>
              <div style={{ marginTop: 'auto', padding: '12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', textAlign: 'center' }}>
                {tr.pricing.soon.unavailable}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 var(--spacing-lg) 80px' }}>
          <div style={{ display: 'inline-block', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-main)', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.06)', maxWidth: '520px' }}>
            <p style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', marginBottom: 'var(--spacing-sm)', letterSpacing: '-0.3px' }}>{tr.cta.title}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.7' }}>{tr.cta.subtitle}</p>
            <Link href="/register" className="land-btn-primary" style={{ padding: '13px 32px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
              {tr.cta.button}
            </Link>
          </div>
        </section>

        <LandingFooter />
      </main>

      {/* Cookie banner — rendered outside <main> so it floats above everything */}
      <CookieBanner />
    </>
  )
}

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '11px', fontWeight: '600', color: 'var(--color-primary)', letterSpacing: '0.5px', textTransform: 'uppercase', width: 'fit-content' }}>
      {children}
    </div>
  )
}