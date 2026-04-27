import { createClient } from '@/lib/supabase/client'

export interface Equipment { id: string; name: string }
export interface Muscle    { id: string; name: string }
export interface ExerciseType {
  id: string
  name: string
  fields: string[] // e.g. ["weight_kg","reps"]
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const supabase = createClient()
  const { data } = await supabase.from('equipment').select('id, name').order('name')
  return data ?? []
}

export async function fetchMuscles(): Promise<Muscle[]> {
  const supabase = createClient()
  const { data } = await supabase.from('muscles').select('id, name').order('name')
  return data ?? []
}

export async function fetchExerciseTypes(): Promise<ExerciseType[]> {
  const supabase = createClient()
  const { data } = await supabase.from('exercise_types').select('id, name, fields').order('name')
  return (data ?? []).map(d => ({
    ...d,
    fields: Array.isArray(d.fields) ? d.fields : [],
  }))
}

export interface CreateExercisePayload {
  name: string
  exercise_type_id: string
  primary_muscle_id: string | null
  secondary_muscle_ids: string[]
  equipment_id: string | null
  user_id: string
}

export async function createCustomExercise(payload: CreateExercisePayload) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name:                 payload.name.trim(),
      source:               'custom',
      user_id:              payload.user_id,
      exercise_type_id:     payload.exercise_type_id   || null,
      primary_muscle_id:    payload.primary_muscle_id  || null,
      secondary_muscle_ids: payload.secondary_muscle_ids.length
                              ? payload.secondary_muscle_ids
                              : null,
      equipment_id:         payload.equipment_id       || null,
    })
    .select('id, name, source, user_id, exercise_type_id, primary_muscle_id, secondary_muscle_ids, equipment_id')
    .single()

  if (error) {
    console.error('createCustomExercise failed:', error.message)
    return { data: null, error: error.message }
  }
  return { data, error: null }
}