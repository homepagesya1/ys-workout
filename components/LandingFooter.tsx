// components/LandingFooter.tsx
'use client'

import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext'

export function LandingFooter() {
  const { tr, lang } = useLang()

  return (
    <footer style={{
      borderTop: '1px solid rgba(139,92,246,0.1)',
      padding: 'var(--spacing-lg)',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center',
    }}>
      <div>
        © {new Date().getFullYear()} YS.Workout · {tr.footer.madeBy}{' '}
        <a
          href="https://yannicksalm.ch"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)', textDecoration: 'none', transition: 'opacity 0.2s ease' }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          Yannick
        </a>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link
          href={`/impressum`}
          style={{
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            opacity: 0.6,
            transition: 'opacity 0.2s ease',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.6')}
        >
          {tr.footer.impressum}
        </Link>

        <span style={{ opacity: 0.2 }}>·</span>

        <Link
          href={`/datenschutz`}
          style={{
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            opacity: 0.6,
            transition: 'opacity 0.2s ease',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.6')}
        >
          {tr.footer.privacy}
        </Link>
      </div>
    </footer>
  )
}