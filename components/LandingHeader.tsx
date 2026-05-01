// components/LandingHeader.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext'
import { LangToggle } from '@/components/LangToggle'

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { tr } = useLang()

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-ghost:hover   { background: rgba(139,92,246,0.12) !important; }
        .land-nav-link:hover    { color: var(--color-text) !important; }
        .land-btn-primary       { transition: opacity 0.2s ease, transform 0.2s ease; }
        .land-btn-ghost         { transition: background 0.2s ease; }
        .land-nav-link          { transition: color 0.2s ease; }
        .burger-menu            { animation: slideDown 0.2s ease both; }
        .burger-nav-link:hover  { background: rgba(139,92,246,0.08) !important; color: var(--color-text) !important; }
        .burger-nav-link        { transition: background 0.15s ease, color 0.15s ease; }
        .header-nav-center      { display: flex; }
        .header-burger-btn      { display: none; }
        @media (max-width: 650px) {
          .header-nav-center  { display: none !important; }
          .header-burger-btn  { display: flex !important; }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--spacing-lg)', height: '60px',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(9,9,15,0.85)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
      }}>
        {/* Logo → links to homepage */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.3px', cursor: 'pointer' }}>
            YS.Workout
          </span>
        </Link>

        {/* Center links — desktop */}
        <div className="header-nav-center" style={{ gap: 'var(--spacing-lg)', alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {[
            { label: tr.nav.home, href: '/' },
            { label: tr.nav.help, href: '/help' },
            { label: tr.nav.forum, href: 'https://www.reddit.com/r/ys_workout/', external: true },
            { label: tr.nav.contact, href: '/kontakt' },
          ].map(l => (
            <Link key={l.href} href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener noreferrer' : undefined} className="land-nav-link" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right: Lang + Auth + Burger */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <Link href="/login" className="land-btn-ghost" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', textDecoration: 'none', background: 'transparent' }}>
            {tr.nav.login}
          </Link>
          <Link href="/register" className="land-btn-primary" style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', fontWeight: '600', textDecoration: 'none' }}>
            {tr.nav.register}
          </Link>
          <LangToggle />

          {/* Burger — mobile only */}
          <button
            className="header-burger-btn"
            onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Menü öffnen"
          >
            <span style={{ display: 'block', width: '20px', height: '2px', background: menuOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderRadius: '2px', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none', transition: 'transform 0.2s ease, background 0.2s ease' }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: menuOpen ? 'transparent' : 'var(--color-text-secondary)', borderRadius: '2px', transition: 'background 0.2s ease' }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: menuOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderRadius: '2px', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none', transition: 'transform 0.2s ease, background 0.2s ease' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="burger-menu" style={{ position: 'sticky', top: '60px', zIndex: 99, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', backgroundColor: 'rgba(9,9,15,0.95)', borderBottom: '1px solid rgba(139,92,246,0.12)', padding: 'var(--spacing-sm) 0' }}>
          {[
            { label: `🏠 ${tr.nav.home}`, href: '/', external: false },
            { label: `📖 ${tr.nav.help}`, href: '/help', external: false },
            { label: `💬 ${tr.nav.forum}`, href: 'https://www.reddit.com/r/ys_workout/', external: true },
            { label: `✉️ ${tr.nav.contact}`, href: '/kontakt', external: false },
          ].map(l => (
            <Link key={l.href} href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener noreferrer' : undefined} className="burger-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', fontWeight: '500', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
          <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
            <LangToggle />
          </div>
        </div>
      )}
    </>
  )
}