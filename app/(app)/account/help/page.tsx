'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Guide {
  id: string
  icon: string
  title: string
  content: React.ReactNode
}

const guides: Guide[] = [
  {
    id: 'ios',
    icon: '🍎',
    title: 'App auf iPhone installieren (iOS)',
    content: (
      <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <li>Öffne <strong>Safari</strong> auf deinem iPhone (funktioniert nur mit Safari, nicht Chrome)</li>
        <li>Öffne <strong>workout.yannicksalm.ch</strong> und gehe zu Account.</li>
        <li>Tippe auf das <strong>Teilen-Symbol ⬆</strong> in der unteren Leiste</li>
        <li>Scrolle runter und tippe auf <strong>„Zum Home-Bildschirm"</strong></li>
        <li>Bestätige mit <strong>„Hinzufügen"</strong> oben rechts</li>
        <li>Die App erscheint jetzt auf deinem Homescreen — kein App Store nötig ✅</li>
      </ol>
    ),
  },
  {
    id: 'android',
    icon: '🤖',
    title: 'App auf Android installieren',
    content: (
      <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <li>Öffne <strong>Chrome</strong> auf deinem Android-Gerät</li>
        <li>Öffne <strong>workout.yannicksalm.ch</strong> und gehe zu Account</li>
        <li>Tippe auf die <strong>drei Punkte ⋮</strong> oben rechts</li>
        <li>Tippe auf <strong>„Zum Startbildschirm hinzufügen"</strong></li>
        <li>Bestätige mit <strong>„Hinzufügen"</strong></li>
        <li>Die App erscheint auf deinem Homescreen ✅</li>
      </ol>
    ),
  },
]

function GuideCard({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="glass"
      style={{
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          gap: 'var(--spacing-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span style={{ fontSize: '22px' }}>{guide.icon}</span>
          <span style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: '600',
            color: 'var(--color-text)',
            textAlign: 'left',
          }}>
            {guide.title}
          </span>
        </div>
        <span style={{
          color: 'var(--color-primary)',
          fontSize: '18px',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}>
          ›
        </span>
      </button>

      {open && (
        <div style={{
          padding: 'var(--spacing-md) var(--spacing-lg) var(--spacing-lg)',
          borderTop: '1px solid rgba(151,125,255,0.15)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.7',
          animation: 'fadeIn 0.2s ease',
        }}>
          {guide.content}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}

export default function HelpPage() {
  const router = useRouter()

  return (
    <main style={{
      padding: 'var(--spacing-md)',
      paddingTop: 'var(--spacing-xl)',
      paddingBottom: 'calc(var(--spacing-xl) + env(safe-area-inset-bottom))',
      maxWidth: '600px',
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>Hilfe</h1>
      </div>

      {/* Intro */}
      <div className="glass" style={{
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-lg)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>💡</span>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', marginBottom: '6px' }}>
            App zum Homescreen hinzufügen
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            YS.Workout ist eine Web-App — du brauchst keinen App Store. Installiere sie direkt aus dem Browser für das beste Erlebnis.
          </p>
        </div>
      </div>

      {/* Guides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {guides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Weitere Anleitungen — Platzhalter für später */}
      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        border: '1px dashed rgba(151,125,255,0.25)',
        borderRadius: 'var(--radius-main)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
      }}>
        Weitere Anleitungen folgen demnächst...
      </div>

    </main>
  )
}