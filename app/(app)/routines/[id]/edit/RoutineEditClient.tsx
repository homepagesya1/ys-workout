'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import { loadEDBDataForExercises } from '@/lib/exercises'

interface RoutineSet {
  id?: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  isNew?: boolean
  isDeleted?: boolean
}

interface RoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  position: number
  superset_group: string | null
  default_sets: number | null
  exercises?: { id: string; external_id: string | null; name: string | null; source: string }
  routine_sets?: RoutineSet[]
  edbData?: { name: string; imageUrl: string; targetMuscles: string[] }
}

export default function RoutineEditClient({
  routine,
  initialExercises,
}: {
  routine: Routine
  initialExercises: RoutineExercise[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState(routine.title)
  const [description, setDescription] = useState(routine.description ?? '')
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    initialExercises.map(ex => ({
      ...ex,
      routine_sets: ex.routine_sets?.length
        ? [...ex.routine_sets].sort((a, b) => a.set_number - b.set_number)
        : [{ set_number: 1, weight_kg: null, reps: null, isNew: true }],
    }))
  )
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (initialExercises.length === 0) return
    loadEDBDataForExercises(initialExercises).then(updated => {
      setExercises(prev => prev.map((ex, i) => ({
        ...ex,
        edbData: (updated[i] as any).edbData,
      })))
    })
  }, [initialExercises.length])

  // Set updaten (lokal)
  function updateSet(exerciseId: string, setIndex: number, field: 'weight_kg' | 'reps', value: string) {
    const numValue = value === '' ? null : parseFloat(value)
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      const sets = [...(ex.routine_sets ?? [])]
      sets[setIndex] = { ...sets[setIndex], [field]: numValue }
      return { ...ex, routine_sets: sets }
    }))
  }

  // Set hinzufügen (lokal)
  function addSet(exerciseId: string) {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      const sets = ex.routine_sets ?? []
      const lastSet = sets[sets.length - 1]
      return {
        ...ex,
        routine_sets: [...sets, {
          set_number: sets.length + 1,
          weight_kg: lastSet?.weight_kg ?? null,
          reps: lastSet?.reps ?? null,
          isNew: true,
        }]
      }
    }))
  }

  // Set löschen (lokal)
  function removeSet(exerciseId: string, setIndex: number) {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      const sets = ex.routine_sets?.filter((_, i) => i !== setIndex) ?? []
      // Set-Nummern neu vergeben
      const renumbered = sets.map((s, i) => ({ ...s, set_number: i + 1 }))
      return { ...ex, routine_sets: renumbered }
    }))
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

    const { data: re } = await supabase
      .from('routine_exercises')
      .insert({
        routine_id: routine.id,
        exercise_id: exerciseId,
        position: exercises.length,
        default_sets: 3,
      })
      .select(`*, exercises(id, external_id, name, source)`)
      .single()

    if (re) {
      setExercises(prev => [...prev, {
        ...re,
        routine_sets: [
          { set_number: 1, weight_kg: null, reps: null, isNew: true },
          { set_number: 2, weight_kg: null, reps: null, isNew: true },
          { set_number: 3, weight_kg: null, reps: null, isNew: true },
        ],
        edbData: {
          name: edbExercise.name,
          imageUrl: edbExercise.imageUrl,
          targetMuscles: edbExercise.targetMuscles,
        },
      }])
      setShowAddExercise(false)
    }
  }

  async function removeExercise(id: string) {
    await supabase.from('routine_exercises').delete().eq('id', id)
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  async function handleUpdate() {
    setSaving(true)

    // Routine updaten
    await supabase
      .from('routines')
      .update({ title: title.trim(), description: description.trim() || null })
      .eq('id', routine.id)

    // Sets für jede Exercise speichern
    for (const ex of exercises) {
      const sets = ex.routine_sets ?? []

      // Alle alten Sets löschen
      await supabase
        .from('routine_sets')
        .delete()
        .eq('routine_exercise_id', ex.id)

      // Neue Sets einfügen
      if (sets.length > 0) {
        await supabase.from('routine_sets').insert(
          sets.map(s => ({
            routine_exercise_id: ex.id,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
          }))
        )
      }
    }

    setSaving(false)
    router.push('/routines')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '40px' }}>

      {/* Header */}
      <div className="glass-nav" style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)',
        zIndex: 100, borderTop: 'none',
        borderBottom: '1px solid rgba(151,125,255,0.15)',
      }}>
        <button
          onClick={() => router.push('/routines')}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500' }}
        >
          Cancel
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Edit Routine</span>
        <button
          onClick={handleUpdate}
          disabled={saving || !title.trim()}
          style={{
            background: 'none', border: 'none',
            color: title.trim() ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: '600', fontSize: 'var(--font-size-base)',
          }}
        >
          {saving ? 'Saving...' : 'Update'}
        </button>
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        {/* Title & Description */}
        <div className="glass" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Routine title"
              style={{ fontSize: 'var(--font-size-md)', fontWeight: '600' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Description
            </label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Exercises */}
        {exercises.map(ex => (
          <div key={ex.id}>
            {/* Exercise Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  background: 'rgba(151,125,255,0.2)',
                  flexShrink: 0,
                  border: '1px solid rgba(151,125,255,0.3)',
                }}>
                  {ex.edbData?.imageUrl ? (
                    <img src={ex.edbData.imageUrl} alt={ex.edbData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💪</div>
                  )}
                </div>
                <span style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: 'var(--font-size-md)' }}>
                  {ex.edbData?.name ?? ex.exercises?.name ?? 'Loading...'}
                </span>
              </div>
              <button
                onClick={() => removeExercise(ex.id)}
                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}
              >
                Remove
              </button>
            </div>

            {/* Sets Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', padding: '8px var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Set', 'kg', 'Reps', ''].map(h => (
                  <span key={h} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: '500' }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {(ex.routine_sets ?? []).map((s, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px',
                  padding: '10px var(--spacing-md)',
                  background: i % 2 === 1 ? 'rgba(6,0,171,0.3)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  alignItems: 'center',
                }}>
                  <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                    {s.set_number}
                  </span>
                  <input
                    type="number" inputMode="decimal" placeholder="0"
                    value={s.weight_kg ?? ''}
                    onChange={e => updateSet(ex.id, i, 'weight_kg', e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: 'var(--font-size-base)', fontWeight: '500' }}
                  />
                  <input
                    type="number" inputMode="numeric" placeholder="0"
                    value={s.reps ?? ''}
                    onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: 'var(--font-size-base)', fontWeight: '500' }}
                  />
                  <button
                    onClick={() => removeSet(ex.id, i)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '16px', textAlign: 'center', padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add Set */}
              <button
                onClick={() => addSet(ex.id)}
                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'rgba(151,125,255,0.1)', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}

        {/* Add Exercise */}
        <button
          onClick={() => setShowAddExercise(true)}
          style={{
            width: '100%', padding: 'var(--spacing-md)',
            background: 'rgba(151,125,255,0.1)',
            border: '1px solid rgba(151,125,255,0.3)',
            borderRadius: 'var(--radius-main)',
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-md)', fontWeight: '600',
          }}
        >
          + Add Exercise
        </button>
      </div>

      {showAddExercise && (
        <AddExerciseModal
          onAdd={addExercise}
          onClose={() => setShowAddExercise(false)}
        />
      )}
    </div>
  )
}