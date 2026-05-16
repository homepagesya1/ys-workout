import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LogBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'finished')
    .order('finished_at', { ascending: false })

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)' }}>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>
        Log Book
      </h1>

      {sessions?.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          padding: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-sm)',
        }}>
          No workouts yet. Start your first one!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {sessions?.map(session => (
          <Link
            key={session.id}
            href={`/logbook/${session.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="glass" style={{ padding: 'var(--spacing-md)', cursor: 'pointer', transition: 'opacity var(--transition)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', margin: 0 }}>
                      {session.title}
                    </h2>
                    {(session as any).source === 'coach' && (
                      <span style={{
                        fontSize: '10px', fontWeight: '600',
                        color: 'var(--color-primary)',
                        background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        lineHeight: '1.4',
                        flexShrink: 0,
                      }}>
                        Coach
                      </span>
                    )}
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
    </main>
  )
}
