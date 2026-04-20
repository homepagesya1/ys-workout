import { exerciseDb } from './supabase/exercises'

export interface Exercise {
  id: string
  name: string
  category: string | null
  equipment: string | null
  primary_muscles: string[]
  secondary_muscles: string[]
  instructions: string[]
  image_url: string | null
  image_url_2: string | null
  level: string | null
  force: string | null
  mechanic: string | null
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const { data, error } = await exerciseDb
    .from('exercises')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(50)

  if (error) console.error('searchExercises error:', error)
  return data ?? []
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const { data, error } = await exerciseDb
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (error) console.error('getExerciseById error:', error)
  return data ?? null
}

export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return []
  const { data, error } = await exerciseDb
    .from('exercises')
    .select('*')
    .in('id', ids)

  if (error) console.error('getExercisesByIds error:', error)
  return data ?? []
}

export async function getAllExercises(opts?: {
  bodyPart?: string
  equipment?: string
  limit?: number
  offset?: number
}): Promise<{ data: Exercise[]; count: number }> {
  let query = exerciseDb
    .from('exercises')
    .select('*', { count: 'exact' })
    .order('name')

  if (opts?.bodyPart) {
    query = query.contains('primary_muscles', [opts.bodyPart.toLowerCase()])
  }
  if (opts?.equipment) {
    query = query.ilike('equipment', opts.equipment)
  }

  const limit = opts?.limit ?? 50
  const offset = opts?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) console.error('getAllExercises error:', error)
  return { data: data ?? [], count: count ?? 0 }
}

export async function getBodyParts(): Promise<string[]> {
  const { data } = await exerciseDb
    .from('exercises')
    .select('primary_muscles')

  if (!data) return []
  const all = data.flatMap(e => e.primary_muscles ?? [])
  return [...new Set(all)].sort()
}

export async function getEquipmentList(): Promise<string[]> {
  const { data } = await exerciseDb
    .from('exercises')
    .select('equipment')

  if (!data) return []
  const all = data.map(e => e.equipment).filter(Boolean)
  return [...new Set(all)].sort() as string[]
}