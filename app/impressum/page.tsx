// app/[lang]/impressum/page.tsx  (or pages/impressum.tsx — adjust to your router)
'use client'

import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext' // adjust to your context path

export default function ImpressumPage() {
  const { tr, lang } = useLang()
  const i = tr.impressum

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg, #09090b)',
      color: 'var(--color-text, #f4f4f5)',
      padding: '4rem 1.25rem 5rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>

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
          {i.back}
        </Link>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          margin: '0 0 0.5rem',
          color: 'var(--color-text, #f4f4f5)',
          fontFamily: 'var(--font-display, system-ui, sans-serif)',
        }}>
          {i.title}
        </h1>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-muted, #71717a)',
          margin: '0 0 2.5rem',
          letterSpacing: '0.01em',
        }}>
          {i.legalNote}
        </p>

        {/* Content card */}
        <div style={{
          backgroundColor: 'var(--color-surface, #18181b)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          borderRadius: '1rem',
          padding: '1.75rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.125rem',
        }}>
          <Row label="Name" value={i.name} />
          <Divider />
          <Row label="Land / Country" value={i.country} />
          <Divider />
          <Row
            label={i.emailLabel}
            value={
              <a
                href={`mailto:${i.email}`}
                style={{
                  color: 'var(--color-accent, #e2e8f0)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                {i.email}
              </a>
            }
          />
          <Divider />
          <Row label={i.responsible} value={i.responsibleName} />
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr',
      gap: '0.5rem',
      alignItems: 'start',
    }}>
      <span style={{
        fontSize: '0.775rem',
        color: 'var(--color-text-muted, #71717a)',
        paddingTop: '0.05rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.875rem',
        color: 'var(--color-text, #f4f4f5)',
        fontWeight: 400,
      }}>
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--color-border, rgba(255,255,255,0.07))',
      margin: 0,
    }} />
  )
}