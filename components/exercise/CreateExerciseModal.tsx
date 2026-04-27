'use client'

import { useState, useEffect } from 'react'
import {
  fetchEquipment, fetchMuscles, fetchExerciseTypes,
  createCustomExercise,
  type Equipment, type Muscle, type ExerciseType,
} from '@/lib/supabase/exercises-db'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onCreated: (exercise: { id: string; name: string; source: string }) => void
  onClose:   () => void
}

export default function CreateExerciseModal({ onCreated, onClose }: Props) {
  const [name,              setName]            = useState('')
  const [exerciseTypeId,    setExerciseTypeId]  = useState('')
  const [primaryMuscleId,   setPrimaryMuscleId] = useState('')
  const [secondaryMuscleIds,setSecondaryIds]    = useState<string[]>([])
  const [equipmentId,       setEquipmentId]     = useState('')

  const [equipment,      setEquipment]      = useState<Equipment[]>([])
  const [muscles,        setMuscles]        = useState<Muscle[]>([])
  const [exerciseTypes,  setExerciseTypes]  = useState<ExerciseType[]>([])
  const [saving,         setSaving]         = useState(false)
  const [userId,         setUserId]         = useState<string | null>(null)

  useEffect(() => {
    fetchEquipment().then(setEquipment)
    fetchMuscles().then(setMuscles)
    fetchExerciseTypes().then(setExerciseTypes)

    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  function toggleSecondary(id: string) {
    setSecondaryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    if (!name.trim() || !userId || !exerciseTypeId) return
    setSaving(true)

    const { data, error } = await createCustomExercise({
      name, exercise_type_id: exerciseTypeId,
      primary_muscle_id: primaryMuscleId || null,
      secondary_muscle_ids: secondaryMuscleIds,
      equipment_id: equipmentId || null,
      user_id: userId,
    })

    setSaving(false)
    if (data) onCreated(data)
  }

  const selectedType = exerciseTypes.find(t => t.id === exerciseTypeId)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
    }}>

      {/* Header */}
      <div className="glass-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)',
        borderTop: 'none', borderBottom: '1px solid rgba(151,125,255,0.15)',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
          New Exercise
        </span>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !exerciseTypeId || saving}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: 'var(--font-size-base)',
            color: name.trim() && exerciseTypeId ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {saving ? 'Saving…' : 'Create'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        {/* Name */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Name *</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. Bulgarian Split Squat"
            style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', width: '100%' }}
          />
        </div>

        {/* Exercise Type */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Exercise Type *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {exerciseTypes.map(t => (
              <button
                key={t.id}
                onClick={() => setExerciseTypeId(t.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: exerciseTypeId === t.id
                    ? '1px solid rgba(151,125,255,0.6)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: exerciseTypeId === t.id
                    ? 'rgba(151,125,255,0.12)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  {t.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {t.fields.join(' · ')}
                </span>
              </button>
            ))}
          </div>
          {selectedType && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Felder beim Loggen: <strong style={{ color: 'var(--color-primary)' }}>{selectedType.fields.join(', ')}</strong>
            </p>
          )}
        </div>

        {/* Equipment */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Equipment</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {equipment.map(e => (
              <Chip
                key={e.id}
                label={e.name}
                selected={equipmentId === e.id}
                onClick={() => setEquipmentId(prev => prev === e.id ? '' : e.id)}
              />
            ))}
          </div>
        </div>

        {/* Primary Muscle */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Primary Muscle</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {muscles.map(m => (
              <Chip
                key={m.id}
                label={m.name}
                selected={primaryMuscleId === m.id}
                onClick={() => setPrimaryMuscleId(prev => prev === m.id ? '' : m.id)}
              />
            ))}
          </div>
        </div>

        {/* Secondary Muscles */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Secondary Muscles <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(mehrere möglich)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {muscles
              .filter(m => m.id !== primaryMuscleId) // primary nicht nochmal anzeigen
              .map(m => (
                <Chip
                  key={m.id}
                  label={m.name}
                  selected={secondaryMuscleIds.includes(m.id)}
                  onClick={() => toggleSecondary(m.id)}
                  multi
                />
              ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  fontWeight: '500',
  display: 'block',
}

function Chip({ label, selected, onClick, multi = false }: {
  label: string; selected: boolean; onClick: () => void; multi?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        border: selected
          ? '1px solid rgba(151,125,255,0.7)'
          : '1px solid rgba(255,255,255,0.1)',
        background: selected
          ? 'rgba(151,125,255,0.18)'
          : 'rgba(255,255,255,0.04)',
        color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: selected ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}
    >
      {multi && selected && <span style={{ fontSize: '11px' }}>✓</span>}
      {label}
    </button>
  )
}