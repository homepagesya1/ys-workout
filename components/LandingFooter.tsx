// components/LandingFooter.tsx
'use client'

import { useLang } from '@/lib/LanguageContext'

export function LandingFooter() {
  const { tr } = useLang()

  return (
    <footer style={{
      borderTop: '1px solid rgba(139,92,246,0.1)',
      padding: 'var(--spacing-lg)',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-secondary)',
    }}>
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
    </footer>
  )
}