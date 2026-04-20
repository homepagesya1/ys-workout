'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import WorkoutStatsChart from '@/components/stats/WorkoutStatsChart'

interface Props {
  profile: Profile | null
  userId: string
  stats: {
    totalWorkouts: number
    totalPRs: number
    totalTime: string
  }
}

export default function AccountClient({ profile, userId, stats }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : '?'

  return (
    <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>Account</h1>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', padding: '4px 8px' }}
          >
            ···
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '32px',
              background: 'var(--color-card)',
              border: '1px solid rgba(151, 125, 255, 0.2)',
              borderRadius: 'var(--radius-main)',
              overflow: 'hidden',
              minWidth: '140px',
              boxShadow: 'var(--shadow-card)',
              zIndex: 10,
            }}>
              <button
                onClick={() => { setMenuOpen(false); router.push('/account/theme') }}
                style={{
                  width: '100%', padding: 'var(--spacing-md)',
                  background: 'none', border: 'none',
                  color: 'var(--color-text)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '500',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                Color Scheme
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: 'var(--spacing-md)',
                  background: 'none', border: 'none',
                  color: 'var(--color-danger)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '500',
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="glass" style={{
        padding: 'var(--spacing-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '700',
          color: 'white', flexShrink: 0,
          overflow: 'hidden',
        }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <div>
          <h2 style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>
            {profile?.display_name || 'User'}
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {profile?.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        {[
          { label: 'Workouts', value: stats.totalWorkouts },
          { label: 'PRs', value: stats.totalPRs },
          { label: 'Time', value: stats.totalTime },
        ].map(stat => (
          <div key={stat.label} className="glass" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--color-primary)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Chart */}
      <WorkoutStatsChart userId={userId} />

    </main>
  )
}