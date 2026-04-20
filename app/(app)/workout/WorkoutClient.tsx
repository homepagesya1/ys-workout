'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveActiveWorkout, deleteActiveWorkout } from '@/lib/indexeddb'
import type { WorkoutSession, WorkoutSet, PRType } from '@/types'
import { loadEDBDataForExercises } from '@/lib/exercises'
import { getPRCandidates, isNewPR } from '@/lib/pr'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'

interface ExerciseDB {
  id: string
  external_id: string | null
  name: string | null
  source: string
}

interface WorkoutExercise {
  id: string
  workout_session_id: string
  exercise_id: string
  position: number
  superset_group: string | null
  exercises?: ExerciseDB
  edbData?: {
    exerciseId: string
    name: string
    imageUrl: string
    exerciseType: string
    targetMuscles: string[]
  }
}

interface Props {
  session: WorkoutSession
  initialExercises: WorkoutExercise[]
  initialSets: WorkoutSet[]
  existingPRs: { exercise_id: string; pr_type: string; value: number }[]
}

export default function WorkoutClient({ session, initialExercises, initialSets, existingPRs }: Props) {
  const router = useRouter()
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises)
  const [sets, setSets] = useState<WorkoutSet[]>(initialSets)
  const [elapsed, setElapsed] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [newPRs, setNewPRs] = useState<Record<string, PRType[]>>({})
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())
  const [userEditedSets, setUserEditedSets] = useState<Set<string>>(new Set())
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const start = new Date(session.started_at).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [session.started_at])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const hideBanner = () => {
      const nav = document.querySelector('nav') as HTMLElement
      const banner = document.querySelector('[data-workout-banner]') as HTMLElement
      if (nav) nav.style.display = 'none'
      if (banner) banner.style.display = 'none'
    }
    hideBanner()
    const timeout = setTimeout(hideBanner, 500)
    return () => {
      clearTimeout(timeout)
      const nav = document.querySelector('nav') as HTMLElement
      const banner = document.querySelector('[data-workout-banner]') as HTMLElement
      if (nav) nav.style.display = 'flex'
      if (banner) banner.style.display = 'flex'
    }
  }, [])

  useEffect(() => {
    if (initialExercises.length === 0) return
    loadEDBDataForExercises(initialExercises).then(setExercises)
  }, [initialExercises.length])

  const syncToCloud = useCallback(async () => {
    if (!isOnline) return
    try {
      await supabase
        .from('workout_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', session.id)
    } catch {}
  }, [isOnline, session.id])

  useEffect(() => {
    syncRef.current = setInterval(syncToCloud, 120000)
    return () => { if (syncRef.current) clearInterval(syncRef.current) }
  }, [syncToCloud])

  useEffect(() => {
    saveActiveWorkout({
      sessionId: session.id,
      title: session.title,
      startedAt: session.started_at,
      exercises: exercises.map(ex => ({
        workoutExerciseId: ex.id,
        exerciseId: ex.exercise_id,
        source: 'exercisedb',
        position: ex.position,
        supersetGroup: ex.superset_group,
        sets: sets.filter(s => s.workout_exercise_id === ex.id),
        edbData: ex.edbData as any,
      })),
    })
  }, [exercises, sets])

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalVolume = sets.reduce((acc, s) => {
    if (s.weight_kg && s.reps) return acc + s.weight_kg * s.reps
    return acc
  }, 0)

  const totalSets = sets.length

  async function addSet(workoutExerciseId: string) {
    const exerciseSets = sets.filter(s => s.workout_exercise_id === workoutExerciseId)
    const setNumber = exerciseSets.length + 1
    const lastSet = exerciseSets[exerciseSets.length - 1]

    const { data: newSet } = await supabase
      .from('sets')
      .insert({
        workout_session_id: session.id,
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        weight_kg: lastSet?.weight_kg ?? null,
        reps: lastSet?.reps ?? null,
      })
      .select()
      .single()

    if (newSet) setSets(prev => [...prev, newSet])
  }

  async function updateSet(setId: string, field: string, value: string) {
    const numValue = value === '' ? null : parseFloat(value)
    setUserEditedSets(prev => new Set(prev).add(setId))

    const updatedSets = sets.map(s =>
      s.id === setId ? { ...s, [field]: numValue } : s
    )
    setSets(updatedSets)

    const updatedSet = updatedSets.find(s => s.id === setId)
    if (updatedSet) {
      const ex = exercises.find(e => e.id === updatedSet.workout_exercise_id)
      if (ex) {
        const exPRs = existingPRs.filter(pr => pr.exercise_id === ex.exercise_id)
        const candidates = getPRCandidates(updatedSet)
        const prTypes = candidates
          .filter(c => isNewPR(c.type, c.value, exPRs))
          .map(c => c.type)
        setNewPRs(prev => ({ ...prev, [setId]: prTypes }))
      }
    }

    await supabase
      .from('sets')
      .update({ [field]: numValue, updated_at: new Date().toISOString() })
      .eq('id', setId)
  }

  async function addExercise(edbExercise: any) {
    const { data: existing } = await supabase
      .from('exercises')
      .select('id')
      .eq('external_id', edbExercise.exerciseId)
      .eq('source', 'exercisedb')
      .maybeSingle()

    let exerciseId = existing?.id

    if (!exerciseId) {
      const { data: newEx } = await supabase
        .from('exercises')
        .insert({
          external_id: edbExercise.exerciseId,
          source: 'exercisedb',
          name: edbExercise.name,
        })
        .select('id')
        .single()
      exerciseId = newEx?.id
    }

    if (!exerciseId) return

    const { data: workoutEx } = await supabase
      .from('workout_exercises')
      .insert({
        workout_session_id: session.id,
        exercise_id: exerciseId,
        position: exercises.length,
      })
      .select(`*, exercises(id, external_id, name, source)`)
      .single()

    if (workoutEx) {
      setExercises(prev => [...prev, { ...workoutEx, edbData: edbExercise }])
      setShowAddExercise(false)
    }
  }

  async function removeExercise(workoutExerciseId: string) {
    await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId)
    setSets(prev => prev.filter(s => s.workout_exercise_id !== workoutExerciseId))
    setExercises(prev => prev.filter(ex => ex.id !== workoutExerciseId))
  }

  async function finishWorkout() {
    const prInserts: any[] = []

    for (const [setId, prTypes] of Object.entries(newPRs)) {
      if (prTypes.length === 0) continue
      const set = sets.find(s => s.id === setId)
      if (!set) continue
      const ex = exercises.find(e => e.id === set.workout_exercise_id)
      if (!ex) continue

      for (const prType of prTypes) {
        const value =
          prType === 'max_weight' ? set.weight_kg :
          prType === 'max_reps' ? set.reps :
          prType === 'max_duration' ? set.duration_seconds :
          prType === 'max_distance' ? set.distance_km : null

        if (value === null) continue

        prInserts.push({
          user_id: session.user_id,
          exercise_id: ex.exercise_id,
          workout_session_id: session.id,
          set_id: setId,
          pr_type: prType,
          value,
        })
      }
    }

    if (prInserts.length > 0) {
      await supabase.from('personal_records').insert(prInserts)
    }

    await supabase
      .from('workout_sessions')
      .update({
        status: 'finished',
        finished_at: new Date().toISOString(),
        duration_seconds: elapsed,
        total_volume_kg: totalVolume,
        total_sets: totalSets,
      })
      .eq('id', session.id)

    await deleteActiveWorkout(session.id)
    router.push('/logbook')
    router.refresh()
  }

  async function deleteWorkout() {
    await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', session.id)
    await deleteActiveWorkout(session.id)
    router.push('/routines')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>

      {/* Offline Banner */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'var(--color-danger)',
          padding: '8px', textAlign: 'center',
          fontSize: 'var(--font-size-sm)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ textDecoration: 'line-through' }}>☁️</span>
          Offline — changes saved locally
        </div>
      )}

      {/* Header */}
      <div className="glass-nav" style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)', zIndex: 100,
        borderTop: 'none', borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
      }}>
        <button
          onClick={() => router.push('/routines?minimized=' + session.id)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', padding: '4px' }}
        >
          ↓
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Log Workout</span>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <button
            onClick={() => setShowDelete(true)}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: '500', padding: '4px 8px' }}
          >
            Delete
          </button>
          <button
            onClick={finishWorkout}
            style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: '600', padding: '6px 16px' }}
          >
            Finish
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'Duration', value: formatTime(elapsed) },
          { label: 'Volume', value: `${totalVolume.toFixed(0)} kg` },
          { label: 'Sets', value: totalSets.toString() },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Exercises */}
      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {exercises.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
            No exercises yet. Add one below!
          </div>
        )}

        {exercises.map(ex => {
          const exSets = sets.filter(s => s.workout_exercise_id === ex.id)
          const displayName = ex.edbData?.name ?? ex.exercises?.name ?? 'Loading...'

          return (
            <div key={ex.id}>
              {/* Exercise Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                    flexShrink: 0,
                    border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                  }}>
                    {ex.edbData?.imageUrl ? (
                      <img src={ex.edbData.imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💪</div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/exercise/${ex.exercise_id}`)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-md)', padding: 0, textAlign: 'left' }}
                  >
                    {displayName}
                  </button>
                </div>
                <button
                  onClick={() => removeExercise(ex.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '18px', padding: '4px' }}
                >
                  ···
                </button>
              </div>

              {ex.superset_group && (
                <div style={{
                  display: 'inline-block',
                  background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 10px', fontSize: '11px', color: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)'
                }}>
                  Superset
                </div>
              )}

              {/* Sets Table */}
              <div className="glass" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 36px', padding: '8px var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Set', 'Previous', 'kg', 'Reps', ''].map(h => (
                    <span key={h} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '500' }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {exSets.map((s, i) => {
                  const isCompleted = completedSets.has(s.id)
                  return (
                    <div key={s.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 1fr 1fr 36px',
                      padding: '10px var(--spacing-md)',
                      background: isCompleted
                        ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                        : i % 2 === 1 ? 'var(--color-set-row-alt)' : 'var(--color-set-row)',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center',
                      transition: 'background 0.2s ease',
                    }}>
                      <span style={{
                        textAlign: 'center',
                        color: isCompleted ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                      }}>
                        {userEditedSets.has(s.id) && newPRs[s.id]?.length > 0 ? '🥇' : s.set_number}
                      </span>
                      <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>—</span>
                      <input
                        type="number" inputMode="decimal" placeholder="0"
                        value={s.weight_kg ?? ''}
                        onChange={e => updateSet(s.id, 'weight_kg', e.target.value)}
                        disabled={isCompleted}
                        style={{ textAlign: 'center', width: '100%', fontSize: 'var(--font-size-base)', fontWeight: '500', opacity: isCompleted ? 0.5 : 1 }}
                      />
                      <input
                        type="number" inputMode="numeric" placeholder="0"
                        value={s.reps ?? ''}
                        onChange={e => updateSet(s.id, 'reps', e.target.value)}
                        disabled={isCompleted}
                        style={{ textAlign: 'center', width: '100%', fontSize: 'var(--font-size-base)', fontWeight: '500', opacity: isCompleted ? 0.5 : 1 }}
                      />
                      <button
                        onClick={() => {
                          setCompletedSets(prev => {
                            const next = new Set(prev)
                            if (next.has(s.id)) next.delete(s.id)
                            else next.add(s.id)
                            return next
                          })
                        }}
                        style={{
                          width: '28px', height: '28px',
                          borderRadius: 'var(--radius-full)',
                          border: isCompleted
                            ? '2px solid var(--color-success)'
                            : '2px solid rgba(255,255,255,0.2)',
                          background: isCompleted
                            ? 'color-mix(in srgb, var(--color-success) 30%, transparent)'
                            : 'transparent',
                          color: isCompleted ? 'var(--color-success)' : 'var(--color-text-secondary)',
                          fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? '✓' : ''}
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={() => addSet(ex.id)}
                  style={{
                    width: '100%', padding: 'var(--spacing-sm)',
                    background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500'
                  }}
                >
                  + Add Set
                </button>
              </div>
            </div>
          )
        })}

        <button
          onClick={() => setShowAddExercise(true)}
          style={{
            width: '100%', padding: 'var(--spacing-md)',
            background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            borderRadius: 'var(--radius-main)', color: 'var(--color-primary)', fontSize: 'var(--font-size-md)', fontWeight: '600'
          }}
        >
          + Add Exercise
        </button>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--spacing-lg)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '320px', padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', textAlign: 'center' }}>
            <h2 style={{ fontWeight: '600' }}>Delete Workout?</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>This workout will be permanently deleted.</p>
            <button onClick={deleteWorkout} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--color-danger)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '600' }}>
              Delete Workout
            </button>
            <button onClick={() => setShowDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <AddExerciseModal
          onAdd={addExercise}
          onClose={() => setShowAddExercise(false)}
        />
      )}
    </div>
  )
}