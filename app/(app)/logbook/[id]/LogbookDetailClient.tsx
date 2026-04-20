'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadEDBDataForExercises } from '@/lib/exercises'

interface Props {
  session: any
  workoutExercises: any[]
  sets: any[]
  prs: any[]
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function LogbookDetailClient({ session, workoutExercises, sets, prs }: Props) {
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>(workoutExercises ?? [])

  useEffect(() => {
    if (!workoutExercises || workoutExercises.length === 0) return
    loadEDBDataForExercises(workoutExercises).then(setExercises)
  }, [workoutExercises?.length])

  if (!session) return null

  const sessionPRs = prs ?? []

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '100px' }}>

      {/* Header */}
      <div className="glass-nav" style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)',
        zIndex: 100, borderTop: 'none',
        borderBottom: '1px solid rgba(151,125,255,0.15)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px' }}
        >
          ←
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
          {session.title}
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        {/* Summary */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            {formatDate(session.finished_at ?? session.created_at)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
            {[
              { label: 'Duration', value: formatDuration(session.duration_seconds ?? 0) },
              { label: 'Volume', value: `${session.total_volume_kg ?? 0} kg` },
              { label: 'Sets', value: session.total_sets ?? 0 },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRs — nur Count */}
        {sessionPRs.length > 0 && (
          <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
                🥇 Personal Records
              </h2>
              <span style={{ fontWeight: '700', fontSize: 'var(--font-size-xl)', color: 'var(--color-primary)' }}>
                {sessionPRs.length}
              </span>
            </div>
          </div>
        )}

        {/* Exercises */}
        {exercises.map((ex: any) => {
          const exSets = (sets ?? []).filter((s: any) => s.workout_exercise_id === ex.id)
          const displayName = ex.edbData?.name ?? ex.exercises?.name ?? 'Exercise'
          const imageUrl = ex.edbData?.imageUrl ?? null

          return (
            <div key={ex.id}>
              {/* Exercise Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  background: 'rgba(151,125,255,0.2)',
                  flexShrink: 0,
                  border: '1px solid rgba(151,125,255,0.3)',
                }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💪</div>
                  )}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: 'var(--font-size-md)' }}>
                  {displayName}
                </div>
              </div>

              {/* Sets Table */}
              <div className="glass" style={{ overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 1fr',
                  padding: '8px var(--spacing-md)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {['Set', 'kg', 'Reps'].map(h => (
                    <span key={h} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '500' }}>{h}</span>
                  ))}
                </div>

                {exSets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    No sets recorded
                  </div>
                ) : exSets.map((s: any, i: number) => {
                  const weightPR = sessionPRs.some((pr: any) => pr.set_id === s.id && pr.pr_type === 'max_weight')
                  const repsPR = sessionPRs.some((pr: any) => pr.set_id === s.id && pr.pr_type === 'max_reps')
                  const durationPR = sessionPRs.some((pr: any) => pr.set_id === s.id && pr.pr_type === 'max_duration')
                  const distancePR = sessionPRs.some((pr: any) => pr.set_id === s.id && pr.pr_type === 'max_distance')

                  return (
                    <div key={s.id} style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr 1fr',
                      padding: '10px var(--spacing-md)',
                      background: i % 2 === 1 ? 'rgba(6,0,171,0.3)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center',
                    }}>
                      <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                        {s.set_number}
                      </span>
                      <span style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', fontWeight: '500' }}>
                        {s.weight_kg ?? s.duration_seconds ?? s.distance_km ?? '—'}
                        {(weightPR || durationPR || distancePR) ? ' 🥇' : ''}
                      </span>
                      <span style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', fontWeight: '500' }}>
                        {s.reps ?? '—'}
                        {repsPR ? ' 🥇' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}