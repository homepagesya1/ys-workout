// app/[lang]/datenschutz/page.tsx  (or pages/datenschutz.tsx — adjust to your router)
'use client'

import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext' // adjust to your context path

export default function DatenschutzPage() {
  const { tr, lang } = useLang()
  const p = tr.privacy

  const sections = [
    p.sections.general,
    p.sections.hosting,
    p.sections.account,
    p.sections.localCache,
    p.sections.cookies,
    p.sections.analytics,
    p.sections.contact,
    p.sections.rights,
  ]

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg, #09090b)',
      color: 'var(--color-text, #f4f4f5)',
      padding: '4rem 1.25rem 6rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>

        {/* Back */}
        <Link
          href={`/${lang}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.825rem',
            color: 'var(--color-text-muted, #a1a1aa)',
            textDecoration: 'none',
            marginBottom: '2.5rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text, #f4f4f5)')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-muted, #a1a1aa)')}
        >
          {p.back}
        </Link>

        {/* Header */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          margin: '0 0 0.5rem',
          fontFamily: 'var(--font-display, system-ui, sans-serif)',
        }}>
          {p.title}
        </h1>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-muted, #71717a)',
          margin: '0 0 3rem',
        }}>
          {p.lastUpdated}
        </p>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sections.map((section, i) => (
            <Section
              key={i}
              index={i + 1}
              title={section.title}
              body={section.body}
              isLast={i === sections.length - 1}
            />
          ))}
        </div>

        {/* Contact nudge */}
        <div style={{
          marginTop: '3rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface, #18181b)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          borderRadius: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text, #f4f4f5)' }}>
            {lang === 'de' ? 'Fragen zum Datenschutz?' : 'Questions about privacy?'}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
            <a
              href="mailto:yannicksalm07@gmail.com"
              style={{
                color: 'var(--color-accent, #e2e8f0)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              yannicksalm07@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

function Section({
  index,
  title,
  body,
  isLast,
}: {
  index: number
  title: string
  body: string
  isLast: boolean
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2.5rem 1fr',
      gap: '0 1.25rem',
      paddingBottom: isLast ? 0 : '2.25rem',
      position: 'relative',
    }}>
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute',
          left: '1.125rem',
          top: '2rem',
          bottom: 0,
          width: '1px',
          backgroundColor: 'var(--color-border, rgba(255,255,255,0.08))',
        }} />
      )}

      {/* Index bubble */}
      <div style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface, #18181b)',
        border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--color-text-muted, #71717a)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(index).padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div style={{ paddingTop: '0.25rem' }}>
        <h2 style={{
          margin: '0 0 0.625rem',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--color-text, #f4f4f5)',
        }}>
          {title}
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          lineHeight: 1.7,
          color: 'var(--color-text-muted, #a1a1aa)',
        }}>
          {body}
        </p>
      </div>
    </div>
  )
}