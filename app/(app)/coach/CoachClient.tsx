'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useCoachLang } from '@/lib/coachLang'
import { createClient } from '@/lib/supabase/client'
import type { TrainingPlan, TrainerPlanExercise } from '@/types'

interface Props {
  shares: any[]
  userId: string
}

export default function CoachClient({ shares, userId }: Props) {
  const { t } = useCoachLang()
  const [activePlanIds, setActivePlanIds] = useState<Set<string>>(new Set())

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
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>
        {t('plans_title')}
      </h1>

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
    </main>
  )
}
