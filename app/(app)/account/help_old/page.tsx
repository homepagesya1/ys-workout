import Link from 'next/link'

export default function LandingPage() {
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
        .land-nav-link:hover    { color: var(--color-text) !important; }
        .land-feature-card:hover { border-color: rgba(139,92,246,0.4) !important; transform: translateY(-2px); }
        .land-feature-card { transition: border-color 0.2s ease, transform 0.2s ease; }
        .land-btn-primary  { transition: opacity 0.2s ease, transform 0.2s ease; }
        .land-btn-ghost    { transition: background 0.2s ease; }
        .land-nav-link     { transition: color 0.2s ease; }
        .land-footer-link:hover { opacity: 0.75; }
        .land-footer-link  { transition: opacity 0.2s ease; }
      `}</style>

      {/* ── Sticky Navbar (AUSSERHALB von main, damit overflow nicht stört) ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 var(--spacing-lg)',
        height: '60px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(9,9,15,0.85)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
      }}>
        {/* Links: Logo */}
        <span style={{
          fontSize: '18px', fontWeight: '700',
          color: 'var(--color-primary)', letterSpacing: '-0.3px',
        }}>
          YS.Workout
        </span>

        {/* Mitte: Nav-Links */}
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
          <Link href="/help" className="land-nav-link" style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            textDecoration: 'none',
          }}>
            Help
          </Link>
          <Link href="/forum" className="land-nav-link" style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            textDecoration: 'none',
          }}>
            Forum
          </Link>
          <Link href="/kontakt" className="land-nav-link" style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            textDecoration: 'none',
          }}>
            Kontakt
          </Link>
        </div>

        {/* Rechts: Auth-Buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/login" className="land-btn-ghost" style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            textDecoration: 'none',
            background: 'transparent',
          }}>
            Login
          </Link>
          <Link href="/register" className="land-btn-primary" style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            Registrieren
          </Link>
        </div>
      </nav>

      <main style={{
        minHeight: 'calc(100dvh - 60px)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        overflowX: 'hidden',
      }}>

        {/* ── Hintergrund-Glow ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            animation: 'pulse-glow 6s ease-in-out infinite',
          }} />
        </div>

        {/* ── Hero ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          padding: '80px var(--spacing-lg) 64px',
          gap: 'var(--spacing-lg)',
        }}>
          <div className="land-fade-1" style={{
            display: 'inline-block',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(139,92,246,0.35)',
            background: 'rgba(139,92,246,0.1)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary)',
            fontWeight: '500',
            letterSpacing: '0.4px',
          }}>
            Dein persönlicher Workout-Tracker
          </div>

          <h1 className="land-fade-2" style={{
            fontSize: 'clamp(36px, 8vw, 64px)',
            fontWeight: '800',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            maxWidth: '700px',
          }}>
            Trainiere smarter.{' '}
            <span style={{ color: 'var(--color-primary)' }}>Werde stärker.</span>
          </h1>

          <p className="land-fade-3" style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            maxWidth: '460px',
            lineHeight: '1.6',
          }}>
            Tracke jedes Set, jeden Rep – direkt vom Handy. Behalte deinen Fortschritt im Blick und übertriff dich selbst.
          </p>

          <div className="land-fade-4" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register" className="land-btn-primary" style={{
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-md)',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              Jetzt starten →
            </Link>
            <Link href="/login" className="land-btn-ghost" style={{
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-md)',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              Login
            </Link>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="land-fade-5" style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--spacing-md)',
          padding: '0 var(--spacing-lg) 80px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {[
            {
              icon: '📋',
              title: 'Routinen & Sets',
              text: 'Erstelle Routinen, tracke Sets und Reps und sieh auf einen Blick, was du heute trainierst.',
            },
            {
              icon: '📈',
              title: 'Fortschritt sehen',
              text: 'Vergleiche Trainingseinheiten und erkenne, wie du dich Woche für Woche verbesserst.',
            },
            {
              icon: '📲',
              title: 'Immer dabei',
              text: 'Als PWA direkt auf deinen Homescreen – kein App Store nötig, funktioniert offline.',
            },
          ].map((f) => (
            <div key={f.title} className="land-feature-card glass" style={{
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}>
              <span style={{ fontSize: '28px' }}>{f.icon}</span>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: 'var(--color-text)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                {f.text}
              </p>
            </div>
          ))}
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          padding: '0 var(--spacing-lg) 80px',
        }}>
          <div style={{
            display: 'inline-block',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--radius-main)',
            border: '1px solid rgba(139,92,246,0.2)',
            background: 'rgba(139,92,246,0.06)',
            maxWidth: '480px',
          }}>
            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
              Bereit zu tracken?
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
              Meld dich an und fang noch heute an, dein Training zu dokumentieren.
            </p>
            <Link href="/register" className="land-btn-primary" style={{
              padding: '13px 28px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-base)',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              Account erstellen
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid rgba(139,92,246,0.1)',
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          © {new Date().getFullYear()} YS.Workout · Made by{' '}
          <a
            href="https://yannicksalm.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="land-footer-link"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            Yannick
          </a>
        </footer>

      </main>
    </>
  )
}