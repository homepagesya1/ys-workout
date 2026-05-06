'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveActiveWorkout, deleteActiveWorkout } from '@/lib/indexeddb'
import type { WorkoutSession, WorkoutSet, PRType } from '@/types'
import { loadEDBDataForExercises } from '@/lib/exercises'
import { getPRCandidates, isNewPR } from '@/lib/pr'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import { pairSuperset, dissolveSuperset } from '@/lib/supabase/sessions'

interface ExerciseDB { id: string; external_id: string | null; name: string | null; source: string }
interface WorkoutExercise {
  id: string; workout_session_id: string; exercise_id: string
  position: number; superset_group: string | null; exercises?: ExerciseDB
  edbData?: { exerciseId: string; name: string; imageUrl: string; exerciseType: string; targetMuscles: string[] }
}
type PrevSet = { weight_kg: number | null; reps: number | null; set_number: number }

interface Props {
  session: WorkoutSession
  initialExercises: WorkoutExercise[]
  initialSets: WorkoutSet[]
  existingPRs: { exercise_id: string; pr_type: string; value: number }[]
  previousSets: Record<string, PrevSet[]>
  initialNotes: Record<string, string>
}

type RenderGroup =
  | { type: 'single'; ex: WorkoutExercise; index: number }
  | { type: 'superset'; exA: WorkoutExercise; exB: WorkoutExercise; indexA: number; indexB: number; groupId: string }

function buildRenderGroups(exercises: WorkoutExercise[]): RenderGroup[] {
  const groups: RenderGroup[] = []
  const seen = new Set<string>()
  exercises.forEach((ex, index) => {
    if (seen.has(ex.id)) return
    if (ex.superset_group) {
      const pi = exercises.findIndex(e => e.superset_group === ex.superset_group && e.id !== ex.id)
      if (pi !== -1) {
        const partner = exercises[pi]
        seen.add(ex.id); seen.add(partner.id)
        groups.push({ type: 'superset', exA: ex, exB: partner, indexA: index, indexB: pi, groupId: ex.superset_group })
        return
      }
    }
    seen.add(ex.id)
    groups.push({ type: 'single', ex, index })
  })
  return groups
}

// ─── Note Inline ──────────────────────────────────────────────────────────────
function NoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function NoteInline({ exerciseId, userId, initialNote }: {
  exerciseId: string; userId: string; initialNote: string
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(initialNote)
  const [saved, setSaved] = useState(false)
  const lastSaved = useRef(initialNote)

  async function save() {
    if (text === lastSaved.current) return
    lastSaved.current = text
    setSaved(true)
    await supabase.from('exercise_notes').upsert(
      { user_id: userId, exercise_id: exerciseId, note: text, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,exercise_id' }
    )
    setTimeout(() => setSaved(false), 1500)
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{ background: 'none', border: 'none', padding: '2px 0 8px', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px', opacity: text ? 0.8 : 0.45 }}
    >
      <NoteIcon />
      {text ? (text.length > 50 ? text.slice(0, 50) + '…' : text) : 'Add note'}
    </button>
  )

  return (
    <div style={{ paddingBottom: '8px' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Note for this exercise..."
        rows={2}
        style={{ width: '100%', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '13px', lineHeight: '1.4', padding: '8px 10px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
        <button
          onClick={() => { save(); setOpen(false) }}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
        >
          Save
        </button>
        {saved && <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>✓ Saved</span>}
      </div>
    </div>
  )
}

// ─── Swipeable Set Row ────────────────────────────────────────────────────────
function SwipeableSetRow({ s, i, isCompleted, hasPR, isHighlighted, prevValue, onComplete, onUpdate, onDelete }: {
  s: WorkoutSet; i: number; isCompleted: boolean; hasPR: boolean; isHighlighted: boolean
  prevValue: string; onComplete: () => void; onUpdate: (f: string, v: string) => void; onDelete: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const cbRef = useRef(onDelete)
  useEffect(() => { cbRef.current = onDelete }, [onDelete])

  useEffect(() => {
    const row = rowRef.current as HTMLDivElement; if (!row) return
    let sx = 0, sy = 0, dir: 'h' | 'v' | null = null, off = 0
    function apply(val: number, anim = false) { off = val; row.style.transition = anim ? 'transform 0.25s ease' : 'none'; row.style.transform = `translateX(${val}px)`; if (bgRef.current) bgRef.current.style.opacity = String(Math.min(1, Math.abs(val) / 60)) }
    function ts(e: TouchEvent) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dir = null }
    function tm(e: TouchEvent) { const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy; if (!dir) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v' }; if (dir === 'v') return; if (dx > 0) { apply(0, true); return }; e.preventDefault(); apply(Math.max(dx, -100)) }
    function te() { if (dir === 'h' && off < -60) { apply(-110, true); setTimeout(() => cbRef.current(), 220) } else apply(0, true) }
    row.addEventListener('touchstart', ts, { passive: true }); row.addEventListener('touchmove', tm, { passive: false }); row.addEventListener('touchend', te, { passive: true })
    return () => { row.removeEventListener('touchstart', ts); row.removeEventListener('touchmove', tm); row.removeEventListener('touchend', te) }
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, opacity: 0, background: 'rgba(255,90,90,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '20px', pointerEvents: 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5A5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
      </div>
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 36px', padding: '10px var(--spacing-md)', background: isHighlighted ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : isCompleted ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : i % 2 === 1 ? 'var(--color-set-row-alt)' : 'var(--color-set-row)', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', position: 'relative', zIndex: 1, willChange: 'transform', transition: 'background 0.3s ease', outline: isHighlighted ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)' : 'none' }}>
        <span style={{ textAlign: 'center', fontWeight: '600', fontSize: 'var(--font-size-sm)', color: isCompleted ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{hasPR ? '🥇' : s.set_number}</span>
        <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', opacity: prevValue === '—' ? 0.3 : 0.7 }}>{prevValue}</span>
        <input type="number" inputMode="decimal" placeholder="0" value={s.weight_kg ?? ''} onFocus={e => e.target.select()} onChange={e => onUpdate('weight_kg', e.target.value)} disabled={isCompleted} style={{ textAlign: 'center', width: '100%', fontSize: '16px', fontWeight: '500', opacity: isCompleted ? 0.5 : 1 }} />
        <input type="number" inputMode="numeric" placeholder="0" value={s.reps ?? ''} onFocus={e => e.target.select()} onChange={e => onUpdate('reps', e.target.value)} disabled={isCompleted} style={{ textAlign: 'center', width: '100%', fontSize: '16px', fontWeight: '500', opacity: isCompleted ? 0.5 : 1 }} />
        <button onClick={onComplete} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', border: isCompleted ? '2px solid var(--color-success)' : '2px solid rgba(255,255,255,0.2)', background: isCompleted ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'transparent', color: isCompleted ? 'var(--color-success)' : 'transparent', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}>{isCompleted ? '✓' : ''}</button>
      </div>
    </div>
  )
}

// ─── Exercise Menu ─────────────────────────────────────────────────────────────
function ExerciseMenu({ isInSuperset, canPair, onStartPairing, onDissolve, onRemove, onReplace, onClose }: {
  isInSuperset: boolean; canPair: boolean; onStartPairing: () => void; onDissolve: () => void; onRemove: () => void; onReplace: () => void; onClose: () => void
}) {
  const item = (danger = false, disabled = false): React.CSSProperties => ({ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px', textAlign: 'left', color: disabled ? 'rgba(255,255,255,0.2)' : danger ? '#FF5A5A' : 'var(--color-text-primary)' })
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={onClose} />
      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: '220px', background: 'var(--color-bg-elevated, #1a1a2e)', border: '1px solid rgba(151,125,255,0.2)', borderRadius: '14px', padding: '6px', zIndex: 99, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
        {isInSuperset
          ? <button onClick={() => { onDissolve(); onClose() }} style={{ ...item(), color: '#F5A623' }}><SSIcon /> Dissolve Superset</button>
          : <button onClick={() => { if (canPair) { onStartPairing(); onClose() } }} disabled={!canPair} style={item(false, !canPair)}><SSIcon /> Add to Superset</button>
        }
        <button onClick={() => { onReplace(); onClose() }} style={item()}><ReplaceIcon /> Replace Exercise</button>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />
        <button onClick={() => { onRemove(); onClose() }} style={item(true)}><TrashIcon /> Remove Exercise</button>
      </div>
    </>
  )
}
function SSIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h8M8 12h8M8 18h8M3 6h.01M3 12h.01M3 18h.01" /></svg> }
function TrashIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg> }
function ReplaceIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg> }

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function WorkoutClient({ session, initialExercises, initialSets, existingPRs, previousSets, initialNotes }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises)
  const [sets, setSets] = useState<WorkoutSet[]>(initialSets)
  const [elapsed, setElapsed] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [newPRs, setNewPRs] = useState<Record<string, PRType[]>>({})
  const [completedSets, setCompletedSets] = useState<Set<string>>(() => { try { const saved = localStorage.getItem(`completed_sets_${session.id}`); return saved ? new Set(JSON.parse(saved)) : new Set() } catch { return new Set() } })
  const [userEditedSets, setUserEditedSets] = useState<Set<string>>(new Set())
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [highlightSetId, setHighlightSetId] = useState<string | null>(null)
  const [supersetPickingFor, setSupersetPickingFor] = useState<string | null>(null)
  const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null)
  const [title, setTitle] = useState(session.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(session.title)
  const [dragState, setDragState] = useState<{ exerciseId: string; exerciseIndex: number; startY: number; currentY: number; targetIndex: number } | null>(null)

  const exerciseRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)
  const longPressStart = useRef({ y: 0 })
  const dragStateRef = useRef(dragState)
  const exercisesRef = useRef(exercises)
  const setsRef = useRef(sets)
  const completedRef = useRef(completedSets)
  const titleRef = useRef(title)
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { dragStateRef.current = dragState }, [dragState])
  useEffect(() => { exercisesRef.current = exercises }, [exercises])
  useEffect(() => { setsRef.current = sets }, [sets])
  useEffect(() => { completedRef.current = completedSets }, [completedSets])
  useEffect(() => { titleRef.current = title }, [title])

  useEffect(() => { localStorage.setItem(`completed_sets_${session.id}`, JSON.stringify([...completedSets])) }, [completedSets, session.id])

  useEffect(() => {
    function onHide() {
      if (document.visibilityState !== 'hidden') return
      saveActiveWorkout({ sessionId: session.id, title: titleRef.current, startedAt: session.started_at, exercises: exercisesRef.current.map(ex => ({ workoutExerciseId: ex.id, exerciseId: ex.exercise_id, source: 'exercisedb', position: ex.position, supersetGroup: ex.superset_group, sets: setsRef.current.filter(s => s.workout_exercise_id === ex.id), edbData: ex.edbData as any })) })
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [session.id, session.started_at])

  useEffect(() => { const s = new Date(session.started_at).getTime(); const t = () => setElapsed(Math.floor((Date.now() - s) / 1000)); t(); const i = setInterval(t, 1000); return () => clearInterval(i) }, [session.started_at])
  useEffect(() => { const a = () => setIsOnline(true), b = () => setIsOnline(false); window.addEventListener('online', a); window.addEventListener('offline', b); return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b) } }, [])
  useEffect(() => { const hide = () => { (document.querySelector('nav') as HTMLElement | null)?.style.setProperty('display', 'none'); (document.querySelector('[data-workout-banner]') as HTMLElement | null)?.style.setProperty('display', 'none') }; hide(); const t = setTimeout(hide, 500); return () => { clearTimeout(t); (document.querySelector('nav') as HTMLElement | null)?.style.setProperty('display', 'flex'); (document.querySelector('[data-workout-banner]') as HTMLElement | null)?.style.setProperty('display', 'flex') } }, [])
  useEffect(() => { if (initialExercises.length === 0) return; loadEDBDataForExercises(initialExercises).then(updated => { setExercises(prev => prev.map(ex => { const withData = updated.find((u: any) => u.id === ex.id); return withData ? { ...ex, edbData: (withData as any).edbData } : ex })) }) }, [initialExercises.length])

  const syncToCloud = useCallback(async () => { if (!isOnline) return; try { await supabase.from('workout_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session.id) } catch { } }, [isOnline, session.id])
  useEffect(() => { syncRef.current = setInterval(syncToCloud, 120000); return () => { if (syncRef.current) clearInterval(syncRef.current) } }, [syncToCloud])
  useEffect(() => { saveActiveWorkout({ sessionId: session.id, title: session.title, startedAt: session.started_at, exercises: exercises.map(ex => ({ workoutExerciseId: ex.id, exerciseId: ex.exercise_id, source: 'exercisedb', position: ex.position, supersetGroup: ex.superset_group, sets: sets.filter(s => s.workout_exercise_id === ex.id), edbData: ex.edbData as any })) }) }, [exercises, sets])

  useEffect(() => {
    if (!dragState) return
    function onMove(e: TouchEvent) { e.preventDefault(); const cy = e.touches[0].clientY; const ds = dragStateRef.current; if (!ds) return; const others = exercisesRef.current.filter(ex => ex.id !== ds.exerciseId); let ti = others.length; for (let i = 0; i < others.length; i++) { const el = exerciseRefs.current.get(others[i].id); if (!el) continue; const r = el.getBoundingClientRect(); if (cy < r.top + r.height / 2) { ti = i; break } }; setDragState(prev => prev ? { ...prev, currentY: cy, targetIndex: ti } : null) }
    async function onEnd() { const ds = dragStateRef.current; if (!ds) return; const exs = exercisesRef.current; if (ds.targetIndex !== ds.exerciseIndex) { const n = [...exs]; const [m] = n.splice(ds.exerciseIndex, 1); n.splice(ds.targetIndex, 0, m); const u = n.map((ex, i) => ({ ...ex, position: i })); setExercises(u); await Promise.all(u.map(ex => supabase.from('workout_exercises').update({ position: ex.position }).eq('id', ex.id))) }; setDragState(null) }
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd, { passive: true })
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [!!dragState])

  function formatTime(s: number) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`; return `${m}:${sec.toString().padStart(2, '0')}` }
  const totalVolume = sets.reduce((a, s) => s.weight_kg && s.reps ? a + s.weight_kg * s.reps : a, 0)
  const totalSets = sets.length

  async function addSet(weid: string) { const es = sets.filter(s => s.workout_exercise_id === weid).sort((a, b) => a.set_number - b.set_number); const ls = es[es.length - 1]; const { data: ns } = await supabase.from('sets').insert({ workout_session_id: session.id, workout_exercise_id: weid, set_number: es.length + 1, weight_kg: ls?.weight_kg ?? null, reps: ls?.reps ?? null }).select().single(); if (ns) setSets(p => [...p, ns]) }

  async function removeSet(sid: string, weid: string) {
    await supabase.from('sets').delete().eq('id', sid)
    setSets(prev => { const remaining = prev.filter(s => s.id !== sid); const exSets = remaining.filter(s => s.workout_exercise_id === weid).sort((a, b) => a.set_number - b.set_number); const renumbered = new Map(exSets.map((s, i) => [s.id, i + 1])); renumbered.forEach((newNum, id) => { supabase.from('sets').update({ set_number: newNum }).eq('id', id) }); return remaining.map(s => renumbered.has(s.id) ? { ...s, set_number: renumbered.get(s.id)! } : s) })
  }

  async function updateSet(sid: string, field: string, value: string) {
    const nv = value === '' ? null : parseFloat(value)
    setUserEditedSets(p => new Set(p).add(sid))
    const updatedSets = sets.map(s => s.id === sid ? { ...s, [field]: nv } : s)
    setSets(updatedSets)
    const u = updatedSets.find(s => s.id === sid)
    if (u) { const ex = exercises.find(e => e.id === u.workout_exercise_id); if (ex) { const c = getPRCandidates(u); const pt = c.filter(x => isNewPR(x.type, x.value, existingPRs.filter(p => p.exercise_id === ex.exercise_id))).map(x => x.type); setNewPRs(p => ({ ...p, [sid]: pt })) } }
    await supabase.from('sets').update({ [field]: nv, updated_at: new Date().toISOString() }).eq('id', sid)
    saveActiveWorkout({ sessionId: session.id, title: titleRef.current, startedAt: session.started_at, exercises: exercisesRef.current.map(ex => ({ workoutExerciseId: ex.id, exerciseId: ex.exercise_id, source: 'exercisedb', position: ex.position, supersetGroup: ex.superset_group, sets: updatedSets.filter(s => s.workout_exercise_id === ex.id), edbData: ex.edbData as any })) })
  }

  function handleSetComplete(setId: string, exerciseId: string) {
    const nowCompleted = !completedSets.has(setId)
    setCompletedSets(p => { const n = new Set(p); n.has(setId) ? n.delete(setId) : n.add(setId); return n })
    if (!nowCompleted) return
    const ex = exercisesRef.current.find(e => e.id === exerciseId); if (!ex?.superset_group) return
    const partner = exercisesRef.current.find(e => e.superset_group === ex.superset_group && e.id !== exerciseId); if (!partner) return
    const thisSet = setsRef.current.find(s => s.id === setId); if (!thisSet) return
    const nextSet = setsRef.current.filter(s => s.workout_exercise_id === partner.id).find(s => s.set_number === thisSet.set_number && !completedRef.current.has(s.id))
    if (nextSet) { setHighlightSetId(nextSet.id); exerciseRefs.current.get(partner.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); setTimeout(() => setHighlightSetId(null), 1800) }
  }

  async function addExercise(edbExercise: any) {
    let exerciseId: string | undefined
    if (edbExercise.source === 'custom') { exerciseId = edbExercise.exerciseId }
    else { const { data: e } = await supabase.from('exercises').select('id').eq('external_id', edbExercise.exerciseId).eq('source', 'exercisedb').maybeSingle(); exerciseId = e?.id; if (!exerciseId) { const { data: n } = await supabase.from('exercises').insert({ external_id: edbExercise.exerciseId, source: 'exercisedb', name: edbExercise.name }).select('id').single(); exerciseId = n?.id } }
    if (!exerciseId) return
    const { data: we } = await supabase.from('workout_exercises').insert({ workout_session_id: session.id, exercise_id: exerciseId, position: exercises.length }).select(`*,exercises(id,external_id,name,source)`).single()
    if (we) { setExercises(p => [...p, { ...we, edbData: edbExercise }]); setShowAddExercise(false) }
  }

  async function replaceExercise(edbExercise: any) {
    if (!replacingExerciseId) return
    const weid = replacingExerciseId
    let exerciseId: string | undefined
    if (edbExercise.source === 'custom') { exerciseId = edbExercise.exerciseId }
    else { const { data: e } = await supabase.from('exercises').select('id').eq('external_id', edbExercise.exerciseId).eq('source', 'exercisedb').maybeSingle(); exerciseId = e?.id; if (!exerciseId) { const { data: n } = await supabase.from('exercises').insert({ external_id: edbExercise.exerciseId, source: 'exercisedb', name: edbExercise.name }).select('id').single(); exerciseId = n?.id } }
    if (!exerciseId) return
    await supabase.from('workout_exercises').update({ exercise_id: exerciseId }).eq('id', weid)
    setExercises(prev => prev.map(ex => ex.id === weid ? { ...ex, exercise_id: exerciseId!, edbData: edbExercise, exercises: undefined } : ex))
    setReplacingExerciseId(null)
  }

  async function removeExercise(weid: string) { const ex = exercises.find(e => e.id === weid); if (ex?.superset_group) { await dissolveSuperset(ex.superset_group, 'workout_exercises'); setExercises(p => p.map(e => e.superset_group === ex.superset_group ? { ...e, superset_group: null } : e)) }; await supabase.from('workout_exercises').delete().eq('id', weid); setSets(p => p.filter(s => s.workout_exercise_id !== weid)); setExercises(p => p.filter(e => e.id !== weid)) }
  async function handleSupersetPair(targetId: string) { if (!supersetPickingFor) return; const groupId = await pairSuperset(supersetPickingFor, targetId, 'workout_exercises'); setExercises(p => p.map(ex => ex.id === supersetPickingFor || ex.id === targetId ? { ...ex, superset_group: groupId } : ex)); setSupersetPickingFor(null) }
  async function handleSupersetDissolve(groupId: string) { await dissolveSuperset(groupId, 'workout_exercises'); setExercises(p => p.map(ex => ex.superset_group === groupId ? { ...ex, superset_group: null } : ex)) }

  async function saveTitle() { const trimmed = titleDraft.trim(); setEditingTitle(false); if (!trimmed || trimmed === title) return; setTitle(trimmed); await supabase.from('workout_sessions').update({ title: trimmed }).eq('id', session.id) }
  function handleNameTouchStart(e: React.TouchEvent, exerciseId: string, index: number) { longPressFired.current = false; longPressStart.current = { y: e.touches[0].clientY }; longPressTimer.current = setTimeout(() => { longPressFired.current = true; navigator.vibrate?.(40); setDragState({ exerciseId, exerciseIndex: index, startY: longPressStart.current.y, currentY: longPressStart.current.y, targetIndex: index }) }, 500) }
  function handleNameTouchMove(e: React.TouchEvent) { if (longPressFired.current) return; if (Math.abs(e.touches[0].clientY - longPressStart.current.y) > 10) clearTimeout(longPressTimer.current!) }
  function handleNameTouchEnd() { if (!longPressFired.current) clearTimeout(longPressTimer.current!) }

  async function finishWorkout() {
    const pi: any[] = []
    for (const [sid, pt] of Object.entries(newPRs)) { if (!pt.length) continue; const s = sets.find(x => x.id === sid); if (!s) continue; const ex = exercises.find(e => e.id === s.workout_exercise_id); if (!ex) continue; for (const p of pt) { const v = p === 'max_weight' ? s.weight_kg : p === 'max_reps' ? s.reps : p === 'max_duration' ? s.duration_seconds : s.distance_km; if (v === null) continue; pi.push({ user_id: session.user_id, exercise_id: ex.exercise_id, workout_session_id: session.id, set_id: sid, pr_type: p, value: v }) } }
    if (pi.length > 0) await supabase.from('personal_records').insert(pi)
    await supabase.from('workout_sessions').update({ status: 'finished', finished_at: new Date().toISOString(), duration_seconds: elapsed, total_volume_kg: totalVolume, total_sets: totalSets }).eq('id', session.id)
    localStorage.removeItem(`completed_sets_${session.id}`)
    await deleteActiveWorkout(session.id); router.push('/logbook'); router.refresh()
  }

  async function deleteWorkout() { await supabase.from('workout_sessions').delete().eq('id', session.id); localStorage.removeItem(`completed_sets_${session.id}`); await deleteActiveWorkout(session.id); router.push('/routines'); router.refresh() }

  function renderExBlock(ex: WorkoutExercise, index: number) {
    const exSets = sets.filter(s => s.workout_exercise_id === ex.id)
    const name = ex.edbData?.name ?? ex.exercises?.name ?? 'Loading...'
    const isDragging = dragState?.exerciseId === ex.id
    const isMenuOpen = menuOpenId === ex.id
    const isInSS = !!ex.superset_group
    const isPairingTarget = !!supersetPickingFor && supersetPickingFor !== ex.id && !isInSS
    const canPair = !isInSS && exercises.filter(e => !e.superset_group && e.id !== ex.id).length > 0

    return (
      <div key={ex.id} ref={el => { if (el) exerciseRefs.current.set(ex.id, el); else exerciseRefs.current.delete(ex.id) }} style={{ opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
            <div onClick={() => isPairingTarget && handleSupersetPair(ex.id)} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', overflow: 'hidden', flexShrink: 0, background: isPairingTarget ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'color-mix(in srgb, var(--color-primary) 20%, transparent)', border: isPairingTarget ? '2px solid var(--color-primary)' : '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', cursor: isPairingTarget ? 'pointer' : 'default', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPairingTarget ? <span style={{ color: 'var(--color-primary)', fontSize: '18px', fontWeight: '700' }}>+</span> : ex.edbData?.imageUrl ? <img src={ex.edbData.imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '16px' }}>💪</span>}
            </div>
            <button onClick={() => isPairingTarget ? handleSupersetPair(ex.id) : router.push(`/exercise/${ex.exercise_id}`)} onTouchStart={e => !supersetPickingFor && handleNameTouchStart(e, ex.id, index)} onTouchMove={handleNameTouchMove} onTouchEnd={handleNameTouchEnd} onContextMenu={e => e.preventDefault()} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-md)', cursor: isPairingTarget ? 'pointer' : dragState ? 'grabbing' : 'grab', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' as any, opacity: supersetPickingFor && !isPairingTarget && supersetPickingFor !== ex.id ? 0.35 : 1, transition: 'opacity 0.2s' }}>
              {name}
              {isPairingTarget && <span style={{ fontSize: '11px', marginLeft: '6px', fontWeight: '400', color: 'var(--color-text-secondary)' }}>tap to pair</span>}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => !supersetPickingFor && setMenuOpenId(isMenuOpen ? null : ex.id)} style={{ background: isMenuOpen ? 'rgba(151,125,255,0.12)' : 'none', border: 'none', borderRadius: '8px', color: 'var(--color-text-secondary)', fontSize: '18px', padding: '4px 8px', cursor: 'pointer', opacity: supersetPickingFor && supersetPickingFor !== ex.id ? 0.3 : 1, transition: 'all 0.15s' }}>···</button>
            {isMenuOpen && <ExerciseMenu isInSuperset={isInSS} canPair={canPair} onStartPairing={() => setSupersetPickingFor(ex.id)} onDissolve={() => ex.superset_group && handleSupersetDissolve(ex.superset_group)} onRemove={() => removeExercise(ex.id)} onReplace={() => setReplacingExerciseId(ex.id)} onClose={() => setMenuOpenId(null)} />}
          </div>
        </div>

        {/* ── Note field, indented to align with exercise name ── */}
        <div style={{ paddingLeft: '44px' }}>
          <NoteInline exerciseId={ex.exercise_id} userId={session.user_id} initialNote={initialNotes[ex.exercise_id] ?? ''} />
        </div>

        <div className="glass" style={{ overflow: 'hidden', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 36px', padding: '8px var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Set', 'Prev', 'kg', 'Reps', ''].map(h => <span key={h} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '500' }}>{h}</span>)}
          </div>
          {exSets.map((s, si) => (
            <SwipeableSetRow key={s.id} s={s} i={si} isCompleted={completedSets.has(s.id)} hasPR={userEditedSets.has(s.id) && (newPRs[s.id]?.length ?? 0) > 0} isHighlighted={highlightSetId === s.id}
              prevValue={(() => { const prev = previousSets[ex.exercise_id]?.[si]; if (!prev) return '—'; if (prev.weight_kg != null && prev.reps != null) return `${prev.weight_kg}kg × ${prev.reps}`; if (prev.weight_kg != null) return `${prev.weight_kg}kg`; if (prev.reps != null) return `${prev.reps}`; return '—' })()}
              onComplete={() => handleSetComplete(s.id, ex.id)} onUpdate={(f, v) => updateSet(s.id, f, v)} onDelete={() => removeSet(s.id, ex.id)}
            />
          ))}
          <button onClick={() => addSet(ex.id)} style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>+ Add Set</button>
        </div>
      </div>
    )
  }

  const renderGroups = buildRenderGroups(exercises)
  function getInsertionLineIndex() { if (!dragState) return -1; const others = exercises.filter(ex => ex.id !== dragState.exerciseId); const target = others[dragState.targetIndex]; if (!target) return exercises.length; return exercises.findIndex(ex => ex.id === target.id) }
  const insertionLineAt = getInsertionLineIndex()

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      {!isOnline && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--color-danger)', padding: '8px', textAlign: 'center', fontSize: 'var(--font-size-sm)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span style={{ textDecoration: 'line-through' }}>☁️</span>Offline — changes saved locally</div>}

      {supersetPickingFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 150, background: 'var(--color-primary)', padding: '12px var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: '#0E0E10' }}>Choose an exercise for the superset</span>
          <button onClick={() => setSupersetPickingFor(null)} style={{ background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '8px', padding: '4px 12px', color: '#0E0E10', fontWeight: '600', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      <div className="glass-nav" style={{ position: 'sticky', top: supersetPickingFor ? '44px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--spacing-md)', zIndex: 100, borderTop: 'none', borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)', transition: 'top 0.2s' }}>
        <button onClick={() => router.push('/routines?minimized=' + session.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', padding: '4px' }}>↓</button>
        {editingTitle
          ? <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)} onBlur={saveTitle} onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleDraft(title); setEditingTitle(false) } }} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 60%, transparent)', color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '16px', textAlign: 'center', width: '160px', outline: 'none', padding: '2px 4px' }} />
          : <button onClick={() => { setTitleDraft(title); setEditingTitle(true) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', fontWeight: '600', fontSize: 'var(--font-size-md)', cursor: 'text', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {title}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
        }
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <button onClick={() => setShowDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: '500', padding: '4px 8px' }}>Delete</button>
          <button onClick={finishWorkout} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: '600', padding: '6px 16px' }}>Finish</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[{ label: 'Duration', value: formatTime(elapsed) }, { label: 'Volume', value: `${totalVolume.toFixed(0)} kg` }, { label: 'Sets', value: totalSets.toString() }].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}><div style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>{s.value}</div><div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.label}</div></div>
        ))}
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {exercises.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>No exercises yet. Add one below!</div>}
        {renderGroups.map((group) => {
          if (group.type === 'single') {
            const isDragging = dragState?.exerciseId === group.ex.id
            return (<div key={group.ex.id}>{dragState && !isDragging && insertionLineAt === group.index && <div style={{ height: '2px', borderRadius: '2px', margin: '0 0 8px', background: 'var(--color-primary)', boxShadow: '0 0 6px color-mix(in srgb, var(--color-primary) 60%, transparent)' }} />}{renderExBlock(group.ex, group.index)}</div>)
          }
          return (
            <div key={group.groupId} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '3px', borderRadius: '3px', background: 'linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 30%, transparent))', flexShrink: 0, marginTop: '6px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', minWidth: 0 }}>
                <div style={{ marginBottom: '-6px' }}><span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>SUPERSET</span></div>
                {renderExBlock(group.exA, group.indexA)}
                {renderExBlock(group.exB, group.indexB)}
              </div>
            </div>
          )
        })}
        {dragState && insertionLineAt === exercises.length && <div style={{ height: '2px', borderRadius: '2px', background: 'var(--color-primary)', boxShadow: '0 0 6px color-mix(in srgb, var(--color-primary) 60%, transparent)' }} />}
        <button onClick={() => setShowAddExercise(true)} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', borderRadius: 'var(--radius-main)', color: 'var(--color-primary)', fontSize: 'var(--font-size-md)', fontWeight: '600' }}>+ Add Exercise</button>
      </div>

      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--spacing-lg)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '320px', padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', textAlign: 'center' }}>
            <h2 style={{ fontWeight: '600' }}>Delete Workout?</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>This workout will be permanently deleted.</p>
            <button onClick={deleteWorkout} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--color-danger)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '600' }}>Delete Workout</button>
            <button onClick={() => setShowDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Cancel</button>
          </div>
        </div>
      )}

      {showAddExercise && <AddExerciseModal onAdd={addExercise} onClose={() => setShowAddExercise(false)} />}
      {replacingExerciseId && <AddExerciseModal onAdd={replaceExercise} onClose={() => setReplacingExerciseId(null)} />}
    </div>
  )
}