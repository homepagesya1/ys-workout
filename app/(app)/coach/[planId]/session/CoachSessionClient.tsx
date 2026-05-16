'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCoachLang } from '@/lib/coachLang'
import { getExerciseById } from '@/lib/exercisedb'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import type { TrainingPlan, TrainerPlanExercise } from '@/types'

interface CoachSet {
  localId: string
  dbId?: string
  setNumber: number
  weight_kg: string
  reps: string
}

interface CoachExercise {
  localId: string
  dbId?: string
  exerciseId: string
  source: 'exercisedb' | 'custom'
  name: string
  isAdded: boolean
  sets: CoachSet[]
  imageUrl?: string
}

interface Props {
  plan: TrainingPlan
  userId: string
  trainerId: string
  exerciseExternalIds: Record<string, string>
  previousSets: Record<string, { weight_kg: number | null; reps: number | null }[]>
  initialNotes: Record<string, string>
}

function makeSet(n: number, defaultWeight?: number | null, defaultReps?: number): CoachSet {
  return {
    localId: crypto.randomUUID(),
    setNumber: n,
    weight_kg: defaultWeight != null && defaultWeight > 0 ? String(defaultWeight) : '',
    reps: defaultReps ? String(defaultReps) : '',
  }
}

function planExerciseToCoach(ex: TrainerPlanExercise): CoachExercise {
  const sets: CoachSet[] = []
  for (let i = 0; i < (ex.sets || 3); i++) {
    sets.push(makeSet(i + 1, ex.weight, ex.reps))
  }
  return {
    localId: crypto.randomUUID(),
    exerciseId: ex.exerciseId,
    source: ex.source,
    name: ex.name,
    isAdded: false,
    sets,
  }
}

function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ── Note component ────────────────────────────────────────────────────────────
function CoachNoteInline({ trainerId, clientId, exerciseId, initialNote }: {
  trainerId: string; clientId: string; exerciseId: string; initialNote: string
}) {
  const { t } = useCoachLang()
  const supabase = createClient()
  const [note, setNote] = useState(initialNote)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialNote)

  async function save() {
    setNote(draft)
    setEditing(false)
    await supabase.from('coach_exercise_notes').upsert(
      { trainer_id: trainerId, client_id: clientId, exercise_id: exerciseId, note: draft, updated_at: new Date().toISOString() },
      { onConflict: 'trainer_id,client_id,exercise_id' }
    )
  }

  function cancel() {
    setDraft(note)
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={t('note_placeholder')}
          rows={2}
          style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(151,125,255,0.25)', borderRadius: 'var(--radius-main)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} style={{ padding: '4px 14px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            {t('save_note')}
          </button>
          <button onClick={cancel} style={{ padding: '4px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (note) {
    return (
      <div
        onClick={() => { setDraft(note); setEditing(true) }}
        style={{ marginTop: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', opacity: 0.7, cursor: 'pointer', paddingLeft: '2px', lineHeight: '1.4' }}
      >
        {note}
      </div>
    )
  }

  return (
    <button
      onClick={() => { setDraft(''); setEditing(true) }}
      style={{ marginTop: '6px', background: 'none', border: 'none', padding: 0, color: 'var(--color-text-secondary)', fontSize: '12px', opacity: 0.4, cursor: 'pointer', textAlign: 'left' }}
    >
      {t('add_note')}
    </button>
  )
}

// ── Swipeable set row ─────────────────────────────────────────────────────────
function SwipeableSetRow({ setNum, weight, reps, isCompleted, prevValue, onChange, onComplete, onDelete }: {
  setNum: number; weight: string; reps: string; isCompleted: boolean; prevValue: string
  onChange: (f: 'weight_kg' | 'reps', v: string) => void; onComplete: () => void; onDelete: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const cbRef = useRef(onDelete)
  useEffect(() => { cbRef.current = onDelete }, [onDelete])

  useEffect(() => {
    const row = rowRef.current; if (!row) return
    let sx = 0, sy = 0, dir: 'h' | 'v' | null = null, off = 0
    const apply = (val: number, anim = false) => { off = val; row.style.transition = anim ? 'transform 0.25s ease' : 'none'; row.style.transform = `translateX(${val}px)`; if (bgRef.current) bgRef.current.style.opacity = String(Math.min(1, Math.abs(val) / 60)) }
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dir = null }
    const tm = (e: TouchEvent) => { const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy; if (!dir) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v' }; if (dir === 'v') return; if (dx > 0) { apply(0, true); return }; e.preventDefault(); apply(Math.max(dx, -100)) }
    const te = () => { if (dir === 'h' && off < -60) { apply(-110, true); setTimeout(() => cbRef.current(), 220) } else apply(0, true) }
    row.addEventListener('touchstart', ts, { passive: true }); row.addEventListener('touchmove', tm, { passive: false }); row.addEventListener('touchend', te, { passive: true })
    return () => { row.removeEventListener('touchstart', ts); row.removeEventListener('touchmove', tm); row.removeEventListener('touchend', te) }
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, opacity: 0, background: 'rgba(255,90,90,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '20px', pointerEvents: 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5A5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
      </div>
      <div
        ref={rowRef}
        style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 32px', padding: '10px var(--spacing-md)', background: isCompleted ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', position: 'relative', zIndex: 1, willChange: 'transform', transition: 'background 0.3s ease' }}
      >
        <span style={{ textAlign: 'center', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: isCompleted ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{setNum}</span>
        <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '12px', opacity: prevValue === '—' ? 0.3 : 0.7 }}>{prevValue}</span>
        <input
          type="number" inputMode="decimal" placeholder="0" value={weight}
          onFocus={e => e.target.select()} onChange={e => onChange('weight_kg', e.target.value)}
          disabled={isCompleted}
          style={{ textAlign: 'center', width: '100%', fontSize: '16px', fontWeight: '500', background: 'none', border: 'none', color: 'var(--color-text)', padding: '4px', boxSizing: 'border-box', opacity: isCompleted ? 0.5 : 1 }}
        />
        <input
          type="number" inputMode="numeric" placeholder="0" value={reps}
          onFocus={e => e.target.select()} onChange={e => onChange('reps', e.target.value)}
          disabled={isCompleted}
          style={{ textAlign: 'center', width: '100%', fontSize: '16px', fontWeight: '500', background: 'none', border: 'none', color: 'var(--color-text)', padding: '4px', boxSizing: 'border-box', opacity: isCompleted ? 0.5 : 1 }}
        />
        <button
          onClick={onComplete}
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: isCompleted ? '2px solid var(--color-success)' : '2px solid rgba(255,255,255,0.2)', background: isCompleted ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'transparent', color: isCompleted ? 'var(--color-success)' : 'transparent', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
        >
          {isCompleted ? '✓' : ''}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CoachSessionClient({ plan, userId, trainerId, exerciseExternalIds, previousSets, initialNotes }: Props) {
  const { t } = useCoachLang()
  const router = useRouter()
  const supabase = createClient()

  const basePlanNames = (plan.exercises ?? []).map((e: TrainerPlanExercise) => e.name)

  const [exercises, setExercises] = useState<CoachExercise[]>(
    () => (plan.exercises ?? []).map(planExerciseToCoach)
  )
  const exercisesRef = useRef<CoachExercise[]>([])
  useEffect(() => { exercisesRef.current = exercises }, [exercises])

  const [completedSets, setCompletedSets] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`coach_completed_${plan.id}`)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionReady, setSessionReady] = useState(false)
  const startedAt = useRef(new Date().toISOString())
  const sessionIdRef = useRef<string | null>(null)
  const updateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Persist completed sets
  useEffect(() => {
    localStorage.setItem(`coach_completed_${plan.id}`, JSON.stringify([...completedSets]))
  }, [completedSets, plan.id])

  // Timer
  useEffect(() => {
    const iv = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  // ── Image loading ────────────────────────────────────────────────────────
  async function loadImages(exs: CoachExercise[]) {
    const updated = await Promise.all(
      exs.map(async ex => {
        if (ex.imageUrl) return ex
        const extId = exerciseExternalIds[ex.exerciseId]
        if (!extId || ex.source !== 'exercisedb') return ex
        try {
          const data = await getExerciseById(extId)
          if (data?.image_url) return { ...ex, imageUrl: data.image_url }
        } catch { /* keep emoji fallback */ }
        return ex
      })
    )
    setExercises(prev => prev.map(ex => {
      const loaded = updated.find(u => u.localId === ex.localId)
      return loaded?.imageUrl && !ex.imageUrl ? { ...ex, imageUrl: loaded.imageUrl } : ex
    }))
  }

  // ── Session init / restore ───────────────────────────────────────────────
  useEffect(() => {
    const initialExercises = (plan.exercises ?? []).map(planExerciseToCoach)

    async function initSession() {
      const stored = localStorage.getItem(`coach_session_${plan.id}_${userId}`)

      if (stored) {
        const { data: session } = await supabase
          .from('workout_sessions')
          .select('id, started_at')
          .eq('id', stored)
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (session) {
          const { data: wes } = await supabase
            .from('workout_exercises')
            .select('id, exercise_id, position, exercises(name, source, external_id)')
            .eq('workout_session_id', session.id)
            .order('position')

          if (wes && wes.length > 0) {
            const weIds = wes.map(w => w.id)
            const { data: setsData } = await supabase
              .from('sets')
              .select('id, workout_exercise_id, set_number, weight_kg, reps')
              .in('workout_exercise_id', weIds)
              .order('set_number')

            const planExMap: Record<string, TrainerPlanExercise> = Object.fromEntries(
              (plan.exercises ?? []).map((e: TrainerPlanExercise) => [e.exerciseId, e])
            )

            const restored: CoachExercise[] = wes.map(we => {
              const exData = (we as any).exercises
              const exSets: CoachSet[] = (setsData ?? [])
                .filter(s => s.workout_exercise_id === we.id)
                .map(s => ({
                  localId: crypto.randomUUID(),
                  dbId: s.id,
                  setNumber: s.set_number,
                  weight_kg: s.weight_kg != null ? String(s.weight_kg) : '',
                  reps: s.reps != null ? String(s.reps) : '',
                }))
              const planEx = planExMap[we.exercise_id]
              return {
                localId: crypto.randomUUID(),
                dbId: we.id,
                exerciseId: we.exercise_id,
                source: (exData?.source ?? 'exercisedb') as 'exercisedb' | 'custom',
                name: exData?.name ?? planEx?.name ?? 'Unknown',
                isAdded: !planEx,
                sets: exSets.length > 0 ? exSets : [makeSet(1)],
              }
            })

            setExercises(restored)
            sessionIdRef.current = session.id
            const startMs = new Date(session.started_at).getTime()
            setElapsed(Math.floor((Date.now() - startMs) / 1000))
            startedAt.current = session.started_at
            setSessionReady(true)
            loadImages(restored)
            return
          }
        }

        localStorage.removeItem(`coach_session_${plan.id}_${userId}`)
      }

      // Create new session
      const { data: session } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_id: null,
          title: plan.name,
          status: 'active',
          started_at: startedAt.current,
          source: 'coach',
          plan_id: plan.id,
        })
        .select('id')
        .single()

      if (!session) { setSessionReady(true); return }

      sessionIdRef.current = session.id
      localStorage.setItem(`coach_session_${plan.id}_${userId}`, session.id)

      // Insert initial exercises + sets and collect dbIds
      const exerciseUpdates: Array<{
        exLocalId: string; weId: string
        setUpdates: Array<{ setLocalId: string; setDbId: string }>
      }> = []

      for (let i = 0; i < initialExercises.length; i++) {
        const ex = initialExercises[i]
        const { data: we } = await supabase
          .from('workout_exercises')
          .insert({ workout_session_id: session.id, exercise_id: ex.exerciseId, position: i })
          .select('id')
          .single()
        if (!we) continue

        const setsToInsert = ex.sets.map(s => ({
          workout_session_id: session.id,
          workout_exercise_id: we.id,
          set_number: s.setNumber,
          weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
          reps: s.reps ? parseInt(s.reps) : null,
        }))

        const { data: insertedSets } = await supabase
          .from('sets')
          .insert(setsToInsert)
          .select('id')

        exerciseUpdates.push({
          exLocalId: ex.localId,
          weId: we.id,
          setUpdates: ex.sets.map((s, si) => ({
            setLocalId: s.localId,
            setDbId: insertedSets?.[si]?.id ?? '',
          })),
        })
      }

      // Batch update with dbIds
      setExercises(prev => prev.map(ex => {
        const u = exerciseUpdates.find(u => u.exLocalId === ex.localId)
        if (!u) return ex
        return {
          ...ex,
          dbId: u.weId,
          sets: ex.sets.map(s => {
            const su = u.setUpdates.find(su => su.setLocalId === s.localId)
            return su?.setDbId ? { ...s, dbId: su.setDbId } : s
          }),
        }
      }))

      setSessionReady(true)
      loadImages(initialExercises)
    }

    initSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Stats
  const totalVolume = exercises.reduce((total, ex) =>
    total + ex.sets.reduce((a, s) => {
      const w = parseFloat(s.weight_kg) || 0
      const r = parseInt(s.reps) || 0
      return a + w * r
    }, 0)
  , 0)
  const totalSets = exercises.reduce((total, ex) =>
    total + ex.sets.filter(s => s.reps || s.weight_kg).length
  , 0)

  // ── Set mutations ────────────────────────────────────────────────────────
  function updateSet(exLocalId: string, setLocalId: string, field: 'weight_kg' | 'reps', value: string) {
    setExercises(prev => prev.map(ex =>
      ex.localId !== exLocalId ? ex : {
        ...ex,
        sets: ex.sets.map(s => s.localId !== setLocalId ? s : { ...s, [field]: value }),
      }
    ))
    // Debounced DB sync (500ms)
    const key = `${setLocalId}_${field}`
    clearTimeout(updateTimers.current[key])
    updateTimers.current[key] = setTimeout(() => {
      const ex = exercisesRef.current.find(e => e.localId === exLocalId)
      const s = ex?.sets.find(s => s.localId === setLocalId)
      if (s?.dbId) {
        const dbValue = field === 'weight_kg'
          ? { weight_kg: value ? parseFloat(value) : null }
          : { reps: value ? parseInt(value) : null }
        supabase.from('sets').update(dbValue).eq('id', s.dbId).then(() => {})
      }
    }, 500)
  }

  async function addSet(exLocalId: string) {
    const ex = exercisesRef.current.find(e => e.localId === exLocalId)
    if (!ex) return
    const last = ex.sets[ex.sets.length - 1]
    const newSet = makeSet(
      ex.sets.length + 1,
      last?.weight_kg ? parseFloat(last.weight_kg) : null,
      last?.reps ? parseInt(last.reps) : undefined
    )

    // Optimistic UI update
    setExercises(prev => prev.map(e =>
      e.localId !== exLocalId ? e : { ...e, sets: [...e.sets, newSet] }
    ))

    // DB sync
    if (ex.dbId && sessionIdRef.current) {
      const { data: inserted } = await supabase
        .from('sets')
        .insert({
          workout_session_id: sessionIdRef.current,
          workout_exercise_id: ex.dbId,
          set_number: newSet.setNumber,
          weight_kg: null,
          reps: null,
        })
        .select('id')
        .single()
      if (inserted) {
        setExercises(prev => prev.map(e => {
          if (e.localId !== exLocalId) return e
          return { ...e, sets: e.sets.map(s => s.localId === newSet.localId ? { ...s, dbId: inserted.id } : s) }
        }))
      }
    }
  }

  async function removeSet(exLocalId: string, setLocalId: string) {
    const ex = exercisesRef.current.find(e => e.localId === exLocalId)
    const s = ex?.sets.find(s => s.localId === setLocalId)

    setCompletedSets(prev => { const n = new Set(prev); n.delete(setLocalId); return n })
    setExercises(prev => prev.map(ex => {
      if (ex.localId !== exLocalId) return ex
      const remaining = ex.sets.filter(s => s.localId !== setLocalId)
      return { ...ex, sets: remaining.map((s, i) => ({ ...s, setNumber: i + 1 })) }
    }))

    if (s?.dbId) {
      await supabase.from('sets').delete().eq('id', s.dbId)
    }
  }

  function toggleComplete(setLocalId: string) {
    setCompletedSets(prev => {
      const n = new Set(prev)
      n.has(setLocalId) ? n.delete(setLocalId) : n.add(setLocalId)
      return n
    })
  }

  // ── Exercise mutations ───────────────────────────────────────────────────
  async function removeExercise(exLocalId: string) {
    const ex = exercisesRef.current.find(e => e.localId === exLocalId)
    setExercises(prev => prev.filter(e => e.localId !== exLocalId))
    if (ex?.dbId) {
      await supabase.from('workout_exercises').delete().eq('id', ex.dbId)
    }
  }

  function moveUp(index: number) {
    if (index === 0) return
    setExercises(prev => {
      const next = [...prev]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next
    })
  }

  function moveDown(index: number) {
    setExercises(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next
    })
  }

  async function addExercise(edbExercise: any) {
    let exerciseId: string | undefined
    if (edbExercise.source === 'custom') {
      exerciseId = edbExercise.exerciseId
    } else {
      const { data: e } = await supabase.from('exercises').select('id').eq('external_id', edbExercise.exerciseId).eq('source', 'exercisedb').maybeSingle()
      exerciseId = e?.id
      if (!exerciseId) {
        const { data: n } = await supabase.from('exercises').insert({ external_id: edbExercise.exerciseId, source: 'exercisedb', name: edbExercise.name }).select('id').single()
        exerciseId = n?.id
      }
    }
    if (!exerciseId) return

    const newSet = makeSet(1)
    const newEx: CoachExercise = {
      localId: crypto.randomUUID(),
      exerciseId,
      source: edbExercise.source ?? 'exercisedb',
      name: edbExercise.name,
      isAdded: true,
      sets: [newSet],
      imageUrl: edbExercise.imageUrl,
    }

    // DB sync
    if (sessionIdRef.current) {
      const position = exercisesRef.current.length
      const { data: we } = await supabase
        .from('workout_exercises')
        .insert({ workout_session_id: sessionIdRef.current, exercise_id: exerciseId, position })
        .select('id')
        .single()
      if (we) {
        newEx.dbId = we.id
        const { data: insertedSet } = await supabase
          .from('sets')
          .insert({ workout_session_id: sessionIdRef.current, workout_exercise_id: we.id, set_number: 1, weight_kg: null, reps: null })
          .select('id')
          .single()
        if (insertedSet) newSet.dbId = insertedSet.id
      }
    }

    setExercises(prev => [...prev, newEx])
    setShowAddModal(false)
  }

  // ── Finish ───────────────────────────────────────────────────────────────
  async function finishWorkout() {
    if (finishing) return
    setFinishing(true)
    const finishedAt = new Date().toISOString()

    const currentExercises = exercisesRef.current
    const exercisesAdded = currentExercises.filter(ex => ex.isAdded).map(ex => ex.name)
    const currentNames = currentExercises.map(ex => ex.name)
    const exercisesRemoved = basePlanNames.filter(name => !currentNames.includes(name))

    let totalVol = 0, totalSetsCount = 0
    for (const ex of currentExercises) {
      for (const s of ex.sets) {
        const w = parseFloat(s.weight_kg) || 0; const r = parseInt(s.reps) || 0
        if (w > 0 && r > 0) totalVol += w * r
        if (s.reps || s.weight_kg) totalSetsCount++
      }
    }

    if (sessionIdRef.current) {
      await supabase.from('workout_sessions').update({
        status: 'finished',
        finished_at: finishedAt,
        duration_seconds: elapsed,
        total_volume_kg: Math.round(totalVol * 100) / 100,
        total_sets: totalSetsCount,
        exercises_added: exercisesAdded,
        exercises_removed: exercisesRemoved,
      }).eq('id', sessionIdRef.current)
    } else {
      // Fallback: create session from scratch
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId, routine_id: null, title: plan.name, status: 'finished',
          started_at: startedAt.current, finished_at: finishedAt,
          duration_seconds: elapsed,
          total_volume_kg: Math.round(totalVol * 100) / 100,
          total_sets: totalSetsCount,
          source: 'coach', plan_id: plan.id,
          exercises_added: exercisesAdded, exercises_removed: exercisesRemoved,
        })
        .select('id')
        .single()

      if (sessionError || !session) { console.error(sessionError); setFinishing(false); return }

      for (let i = 0; i < currentExercises.length; i++) {
        const ex = currentExercises[i]
        const { data: we } = await supabase
          .from('workout_exercises')
          .insert({ workout_session_id: session.id, exercise_id: ex.exerciseId, position: i })
          .select('id').single()
        if (!we) continue
        const setsToInsert = ex.sets
          .filter(s => s.reps || s.weight_kg)
          .map(s => ({
            workout_session_id: session.id, workout_exercise_id: we.id,
            set_number: s.setNumber,
            weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
            reps: s.reps ? parseInt(s.reps) : null,
          }))
        if (setsToInsert.length > 0) await supabase.from('sets').insert(setsToInsert)
      }
    }

    localStorage.removeItem(`coach_session_${plan.id}_${userId}`)
    localStorage.removeItem(`coach_completed_${plan.id}`)
    window.dispatchEvent(new Event('coach-workout-finished'))
    router.push('/logbook')
    router.refresh()
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function deleteWorkout() {
    if (sessionIdRef.current) {
      await supabase.from('workout_sessions').update({ status: 'deleted' }).eq('id', sessionIdRef.current)
    }
    localStorage.removeItem(`coach_session_${plan.id}_${userId}`)
    localStorage.removeItem(`coach_completed_${plan.id}`)
    window.dispatchEvent(new Event('coach-workout-finished'))
    router.back()
    router.refresh()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '40px' }}>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)', zIndex: 200 }}>
          <div className="glass" style={{ width: '100%', maxWidth: '320px', padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🗑️</div>
            <h2 style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>{t('delete_confirm_title')}</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{t('delete_confirm_body')}</p>
            <button onClick={deleteWorkout} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--color-danger)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}>
              {t('delete_confirm_yes')}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', padding: 'var(--spacing-sm)' }}>
              {t('delete_confirm_cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-nav" style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--spacing-md)', zIndex: 100, borderTop: 'none', borderBottom: '1px solid rgba(151,125,255,0.15)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>↓</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>{plan.name}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            {!sessionReady ? '…' : formatElapsed(elapsed)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={finishing}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: '500', fontSize: 'var(--font-size-sm)', cursor: 'pointer', padding: '4px 8px', opacity: finishing ? 0.4 : 1 }}
          >
            {t('delete_workout')}
          </button>
          <button
            onClick={finishWorkout} disabled={finishing || !sessionReady}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', cursor: (finishing || !sessionReady) ? 'not-allowed' : 'pointer', opacity: (finishing || !sessionReady) ? 0.5 : 1, padding: '4px 8px' }}
          >
            {finishing ? t('finishing') : t('finish_workout')}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'Duration', value: formatElapsed(elapsed) },
          { label: 'Volume', value: `${totalVolume.toFixed(0)} kg` },
          { label: 'Sets', value: String(totalSets) },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        {exercises.map((ex, index) => {
          const prevData = previousSets[ex.exerciseId] ?? []

          return (
            <div key={ex.localId}>
              {/* Exercise header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
                  {/* Thumbnail */}
                  <button
                    onClick={() => router.push(`/exercise/${ex.exerciseId}`)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: ex.isAdded ? 'color-mix(in srgb, var(--color-success) 20%, transparent)' : 'color-mix(in srgb, var(--color-primary) 20%, transparent)', border: ex.isAdded ? '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' : '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    {ex.imageUrl
                      ? <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '16px' }}>💪</span>
                    }
                  </button>
                  {/* Name + note */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => router.push(`/exercise/${ex.exerciseId}`)}
                        style={{ background: 'none', border: 'none', padding: 0, color: ex.isAdded ? 'var(--color-success)' : 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-md)', cursor: 'pointer', textAlign: 'left' }}
                      >
                        {ex.name}
                      </button>
                      {ex.isAdded && (
                        <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)', borderRadius: '4px', padding: '1px 5px' }}>
                          {t('exercise_added_label')}
                        </span>
                      )}
                    </div>
                    <CoachNoteInline
                      trainerId={trainerId}
                      clientId={userId}
                      exerciseId={ex.exerciseId}
                      initialNote={initialNotes[ex.exerciseId] ?? ''}
                    />
                  </div>
                </div>
                {/* Reorder + remove */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {index > 0 && <button onClick={() => moveUp(index)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>↑</button>}
                  {index < exercises.length - 1 && <button onClick={() => moveDown(index)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>↓</button>}
                  <button onClick={() => removeExercise(ex.localId)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>×</button>
                </div>
              </div>

              {/* Sets table */}
              <div className="glass" style={{ overflow: 'hidden', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 32px', padding: '8px var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Set', 'Prev', t('weight_kg'), t('reps'), ''].map((h, i) => (
                    <span key={i} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '500' }}>{h}</span>
                  ))}
                </div>

                {ex.sets.map((s, si) => {
                  const prev = prevData[si]
                  const prevValue = prev
                    ? (prev.weight_kg != null && prev.reps != null ? `${prev.weight_kg}×${prev.reps}` : prev.weight_kg != null ? `${prev.weight_kg}kg` : prev.reps != null ? `${prev.reps}` : '—')
                    : '—'

                  return (
                    <SwipeableSetRow
                      key={s.localId}
                      setNum={s.setNumber}
                      weight={s.weight_kg}
                      reps={s.reps}
                      isCompleted={completedSets.has(s.localId)}
                      prevValue={prevValue}
                      onChange={(f, v) => updateSet(ex.localId, s.localId, f, v)}
                      onComplete={() => toggleComplete(s.localId)}
                      onDelete={() => removeSet(ex.localId, s.localId)}
                    />
                  )
                })}

                <button
                  onClick={() => addSet(ex.localId)}
                  style={{ width: '100%', padding: '10px', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', cursor: 'pointer' }}
                >
                  {t('add_set')}
                </button>
              </div>
            </div>
          )
        })}

        {/* Add Exercise */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{ width: '100%', padding: 'var(--spacing-md)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', borderRadius: 'var(--radius-main)', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
        >
          + {t('add_exercise')}
        </button>

        {/* Finish button */}
        <button
          onClick={finishWorkout} disabled={finishing || !sessionReady}
          style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-main)', color: 'white', fontWeight: '700', fontSize: 'var(--font-size-md)', cursor: (finishing || !sessionReady) ? 'not-allowed' : 'pointer', opacity: (finishing || !sessionReady) ? 0.6 : 1, marginTop: 'var(--spacing-md)' }}
        >
          {finishing ? t('finishing') : t('finish_workout')}
        </button>
      </div>

      {showAddModal && <AddExerciseModal onAdd={addExercise} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
