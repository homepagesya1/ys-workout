'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCoachLang } from '@/lib/coachLang'

interface Props {
  clientId: string
  clientName: string
  sessions: any[]
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function TrainerLogbookClient({ clientId, clientName, sessions }: Props) {
  const { t } = useCoachLang()
  const router = useRouter()

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '100px' }}>

      <div className="glass-nav" style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)',
        zIndex: 100, borderTop: 'none',
        borderBottom: '1px solid rgba(151,125,255,0.15)',
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>{clientName} — {t('logbook_title')}</span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)', marginTop: '40px' }}>
            {t('no_sessions')}
          </div>
        ) : sessions.map(session => (
          <Link
            key={session.id}
            href={`/trainer/clients/${clientId}/logbook/${session.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="glass" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', margin: 0 }}>
                      {session.title}
                    </h2>
                    <span style={{
                      fontSize: '10px', fontWeight: '600',
                      color: 'var(--color-primary)',
                      background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      borderRadius: '4px', padding: '2px 6px', flexShrink: 0,
                    }}>
                      Coach
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      ⏱ {formatDuration(session.duration_seconds ?? 0)}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      🏋️ {session.total_volume_kg ?? 0} kg
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      📋 {session.total_sets ?? 0} sets
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(session.finished_at ?? session.created_at)}
                  </span>
                  <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>›</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
