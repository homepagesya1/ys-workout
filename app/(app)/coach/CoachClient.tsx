'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useCoachLang } from '@/lib/coachLang'
import { createClient } from '@/lib/supabase/client'
import type { TrainingPlan, TrainerPlanExercise } from '@/types'

interface Props {
  shares: any[]
  userId: string
  trainerId: string | null
}

export default function CoachClient({ shares, userId, trainerId }: Props) {
  const { t } = useCoachLang()
  const [activePlanIds, setActivePlanIds] = useState<Set<string>>(new Set())
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  const fetchActive = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_sessions')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('source', 'coach')
      .not('plan_id', 'is', null)
    setActivePlanIds(new Set((data ?? []).map((r: any) => r.plan_id)))
  }, [userId])

  useEffect(() => {
    fetchActive()
    const handler = () => fetchActive()
    window.addEventListener('coach-workout-finished', handler)
    return () => window.removeEventListener('coach-workout-finished', handler)
  }, [fetchActive])

  async function removeTrainer() {
    if (!trainerId) return
    setRemoving(true)
    await fetch('/api/coach/remove-trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId }),
    })
    setRemoving(false)
    window.location.reload()
  }

  // Group shares by folder
  const byFolder = new Map<string, { folderName: string; plans: TrainingPlan[] }>()
  for (const share of shares) {
    const plan = share.training_plans as TrainingPlan | undefined
    if (!plan) continue
    const folderId = (plan as any).client_folders?.id ?? 'none'
    const folderName = (plan as any).client_folders?.name ?? ''
    if (!byFolder.has(folderId)) {
      byFolder.set(folderId, { folderName, plans: [] })
    }
    byFolder.get(folderId)!.plans.push(plan)
  }

  return (
    <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
          {t('plans_title')}
        </h1>
        {trainerId && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setHeaderMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: '22px', lineHeight: 1 }}
            >
              ⋯
            </button>
            {headerMenuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setHeaderMenuOpen(false)} />
                <div className="glass" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, minWidth: '180px', borderRadius: 'var(--radius-main)', overflow: 'hidden', padding: '4px 0', border: '1px solid rgba(151,125,255,0.2)' }}>
                  <button
                    style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => { setHeaderMenuOpen(false); setShowRemoveConfirm(true) }}
                  >
                    {t('remove_trainer')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {shares.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
          {t('no_plans')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {Array.from(byFolder.entries()).map(([folderId, { folderName, plans }]) => (
            <div key={folderId}>
              {folderName && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: '600', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {folderName}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {plans.map(plan => {
                  const exercises: TrainerPlanExercise[] = (plan.exercises ?? []) as TrainerPlanExercise[]
                  return (
                    <Link
                      key={plan.id}
                      href={`/coach/${plan.id}/session`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                        {/* Plan name + start indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: exercises.length > 0 ? '10px' : 0 }}>
                          <div style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
                            {plan.name}
                          </div>
                          {activePlanIds.has(plan.id) ? (
                            <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600', padding: '3px 10px' }}>
                              ▶ {t('continue_session')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600', padding: '3px 10px' }}>
                              ▶ {t('start_session')}
                            </span>
                          )}
                        </div>

                        {/* Exercise preview */}
                        {exercises.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {exercises.slice(0, 4).map((ex, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, opacity: 0.6 }} />
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ex.name}
                                  {(ex.sets || ex.reps) && (
                                    <span style={{ opacity: 0.5 }}> · {ex.sets && `${ex.sets}×`}{ex.reps}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            {exercises.length > 4 && (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', opacity: 0.5, paddingLeft: '14px' }}>
                                +{exercises.length - 4} {t('exercises')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRemoveConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: 'var(--spacing-lg)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-main)' }}>
            <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>{t('confirm_remove_trainer_title')}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
              {t('confirm_remove_trainer_body')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                disabled={removing}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-main)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
              >
                {t('close')}
              </button>
              <button
                onClick={removeTrainer}
                disabled={removing}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-main)', background: 'color-mix(in srgb, var(--color-danger) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)', color: 'var(--color-danger)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
              >
                {removing ? '...' : t('remove_trainer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
