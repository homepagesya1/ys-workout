'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { deleteWorkoutSession, saveAsRoutine, startWorkoutFromSession } from '@/lib/supabase/sessions'
import { loadEDBDataForExercises } from '@/lib/exercises'

interface Props {
  session: any
  workoutExercises: any[]
  sets: any[]
  prs: any[]
  readOnly?: boolean
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

// ─── Three-dot menu ───────────────────────────────────────────────────────────

function WorkoutOptionsMenu({ sessionId, currentTitle, isCoachSession, onRenamed }: {
  sessionId: string
  currentTitle: string
  isCoachSession: boolean
  onRenamed: (newTitle: string) => void
}) {
  const [open,       setOpen]      = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]   = useState(false)
  const [renaming,   setRenaming]  = useState(false)
  const [newTitle,   setNewTitle]  = useState(currentTitle)
  const [savedRoutine, setSavedRoutine] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSaveAsRoutine() {
    setLoading(true)
    const { error } = await saveAsRoutine(sessionId)
    setLoading(false)
    if (!error) { setSavedRoutine(true); setTimeout(() => { setSavedRoutine(false); setOpen(false) }, 1500) }
  }

  async function handleStartWorkout() {
    setLoading(true)
    const { newSessionId } = await startWorkoutFromSession(sessionId)
    setLoading(false)
    if (newSessionId) router.push(`/workout?session=${newSessionId}`)
  }

  async function handleRename() {
    if (!newTitle.trim() || newTitle.trim() === currentTitle) {
      setRenaming(false)
      return
    }
    setLoading(true)
    await supabase
      .from('workout_sessions')
      .update({ title: newTitle.trim() })
      .eq('id', sessionId)
    onRenamed(newTitle.trim())
    setLoading(false)
    setRenaming(false)
    setOpen(false)
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setLoading(true)
    const { error } = await deleteWorkoutSession(sessionId)

    if (error) {
      setLoading(false)
      setConfirming(false)
      return
    }

    router.back()
    router.refresh()
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* ⋯ Button */}
      <button
        onClick={() => { setOpen(o => !o); setConfirming(false) }}
        style={{
          background: open ? 'rgba(151,125,255,0.12)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          transition: 'background 0.15s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4"  r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="10" cy="16" r="1.6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '210px',
          background: 'var(--color-bg-elevated, #1a1a2e)',
          border: '1px solid rgba(151,125,255,0.2)',
          borderRadius: '14px',
          padding: '6px',
          zIndex: 200,
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        }}>

          {renaming ? (
            <div style={{ padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false) }}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  border: '1px solid rgba(151,125,255,0.4)',
                  background: 'rgba(151,125,255,0.08)',
                  color: 'var(--color-text-primary)', fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setRenaming(false)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
                  Abbrechen
                </button>
                <button onClick={handleRename} disabled={loading} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: 'rgba(151,125,255,0.2)', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? '…' : 'Speichern'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setNewTitle(currentTitle); setRenaming(true) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-primary)', textAlign: 'left' }}
              >
                <PencilIcon />
                Umbenennen
              </button>

              {!isCoachSession && (
                <button onClick={handleSaveAsRoutine} disabled={loading || savedRoutine} style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'8px', border:'none', background:savedRoutine?'rgba(46,213,115,0.1)':'transparent', cursor:'pointer', fontSize:'14px', color:savedRoutine?'#2ED573':'var(--color-text-primary)', textAlign:'left' }}>
                  <BookmarkIcon />
                  {savedRoutine ? 'Routine gespeichert ✓' : 'Als Routine speichern'}
                </button>
              )}
              <button onClick={handleStartWorkout} disabled={loading} style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'8px', border:'none', background:'transparent', cursor:'pointer', fontSize:'14px', color:'var(--color-text-primary)', textAlign:'left' }}>
                <PlayIcon />
                Workout starten
              </button>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />

              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '8px', border: 'none',
                  background: confirming ? 'rgba(255,90,90,0.12)' : 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px', color: '#FF5A5A', textAlign: 'left', transition: 'background 0.15s',
                }}
              >
                <TrashIcon />
                {loading ? 'Wird gelöscht…' : confirming ? 'Wirklich löschen?' : 'Workout löschen'}
              </button>
            </>
          )}

        </div>
      )}
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function MenuItem({ icon, label, disabled }: { icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 10px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'var(--color-text-primary)',
        textAlign: 'left',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LogbookDetailClient({ session, workoutExercises, sets, prs, readOnly }: Props) {
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>(workoutExercises ?? [])
  const [title, setTitle] = useState(session?.title ?? '')
  const isCoachSession = session?.source === 'coach'

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
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer' }}
        >
          ←
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
            {title}
          </span>
          {isCoachSession && (
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: 'var(--color-primary)',
              background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
              borderRadius: '4px',
              padding: '2px 6px',
            }}>
              Coach
            </span>
          )}
        </div>
        {readOnly
          ? <div style={{ width: '32px' }} />
          : <WorkoutOptionsMenu
              sessionId={session.id}
              currentTitle={title}
              isCoachSession={isCoachSession}
              onRenamed={setTitle}
            />
        }
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

        {/* PRs */}
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