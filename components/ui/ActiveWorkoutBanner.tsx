'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ActiveWorkoutBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSession, setActiveSession] = useState<{ id: string; title: string; started_at: string } | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    async function checkActive() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('workout_sessions')
        .select('id, title, started_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setActiveSession(data ?? null)
      if (data) {
        const start = new Date(data.started_at).getTime()
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }
    }
    checkActive()
  }, [pathname])

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  if (!activeSession) return null

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      data-workout-banner
      onClick={() => router.push(`/workout?session=${activeSession.id}`)}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        background: 'var(--color-primary)',
        borderRadius: 'var(--radius-main)',
        padding: '12px var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        zIndex: 90,
        boxShadow: '0 4px 24px color-mix(in srgb, var(--color-primary) 50%, transparent)',
      }}
    >
      <div>
        <div style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', color: 'white' }}>
          {activeSession.title}
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'color-mix(in srgb, white 75%, transparent)' }}>
          Tap to return · {formatTime(elapsed)}
        </div>
      </div>
      <div style={{ fontSize: '20px' }}>💪</div>
    </div>
  )
}