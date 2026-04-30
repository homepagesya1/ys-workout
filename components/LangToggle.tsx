// components/LangToggle.tsx
'use client'

import { useLang } from '@/lib/LanguageContext'

export function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(139,92,246,0.25)',
        background: 'rgba(139,92,246,0.07)',
        padding: '3px',
        gap: '0',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Sliding highlight pill */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          bottom: '3px',
          width: 'calc(50% - 3px)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)',
          transform: lang === 'en' ? 'translateX(calc(100% + 0px))' : 'translateX(0)',
          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* DE */}
      <button
        onClick={() => setLang('de')}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'none',
          border: 'none',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          cursor: 'pointer',
          color: lang === 'de' ? '#fff' : 'var(--color-text-secondary)',
          transition: 'color 0.22s ease',
          lineHeight: 1,
        }}
        aria-pressed={lang === 'de'}
        aria-label="Deutsch"
      >
        DE
      </button>

      {/* EN */}
      <button
        onClick={() => setLang('en')}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'none',
          border: 'none',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          cursor: 'pointer',
          color: lang === 'en' ? '#fff' : 'var(--color-text-secondary)',
          transition: 'color 0.22s ease',
          lineHeight: 1,
        }}
        aria-pressed={lang === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}