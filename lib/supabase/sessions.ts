import { createClient } from '@/lib/supabase/client'

export async function deleteWorkoutSession(sessionId: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.rpc('delete_workout_session', { p_session_id: sessionId })
  if (error) { console.error('deleteWorkoutSession failed:', error.message); return { error: error.message } }
  return { error: null }
}

export async function pairSuperset(idA: string, idB: string, table: 'workout_exercises' | 'routine_exercises'): Promise<string> {
  const supabase = createClient()
  const groupId = crypto.randomUUID()
  await supabase.from(table).update({ superset_group: groupId }).in('id', [idA, idB])
  return groupId
}

export async function dissolveSuperset(groupId: string, table: 'workout_exercises' | 'routine_exercises'): Promise<void> {
  const supabase = createClient()
  await supabase.from(table).update({ superset_group: null }).eq('superset_group', groupId)
}

// ── Als Routine speichern ─────────────────────────────────────────────────────

export async function saveAsRoutine(sessionId: string): Promise<{ routineId: string | null; error: string | null }> {
  const supabase = createClient()

  // 1. User + Session holen
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { routineId: null, error: 'Not authenticated' }

  const { data: session, error: sessionErr } = await supabase
    .from('workout_sessions')
    .select('title')
    .eq('id', sessionId)
    .single()
  if (sessionErr || !session) return { routineId: null, error: 'Session not found' }

  // 2. Routine erstellen
  const { data: routine, error: routineErr } = await supabase
    .from('routines')
    .insert({ user_id: user.id, title: session.title })
    .select('id')
    .single()
  if (routineErr || !routine) return { routineId: null, error: routineErr?.message ?? 'Failed to create routine' }

  // 3. Workout Exercises holen
  const { data: workoutExercises } = await supabase
    .from('workout_exercises')
    .select('id, exercise_id, position, superset_group')
    .eq('workout_session_id', sessionId)
    .order('position')

  if (!workoutExercises?.length) return { routineId: routine.id, error: null }

  // 4. Routine Exercises erstellen
  const { data: routineExercises } = await supabase
    .from('routine_exercises')
    .insert(workoutExercises.map(we => ({
      routine_id:      routine.id,
      exercise_id:     we.exercise_id,
      position:        we.position,
      superset_group:  we.superset_group,
      default_sets:    null,
    })))
    .select('id, exercise_id')

  if (!routineExercises?.length) return { routineId: routine.id, error: null }

  // 5. Sets übernehmen — geordnet nach workout_exercise
  const weIdToReId = new Map<string, string>(
    workoutExercises
      .map((we, i) => ({ weId: we.id, reId: routineExercises[i]?.id }))
      .filter((x): x is { weId: string; reId: string } => !!x.reId)
      .map(x => [x.weId, x.reId])
  )

  const { data: sets } = await supabase
    .from('sets')
    .select('workout_exercise_id, set_number, weight_kg, reps')
    .eq('workout_session_id', sessionId)
    .order('set_number')

  if (sets?.length) {
    const routineSets = sets
      .map(s => ({ routine_exercise_id: weIdToReId.get(s.workout_exercise_id), set_number: s.set_number, weight_kg: s.weight_kg, reps: s.reps }))
      .filter(s => s.routine_exercise_id)

    if (routineSets.length) await supabase.from('routine_sets').insert(routineSets)
  }

  return { routineId: routine.id, error: null }
}

// ── Workout wiederholen ───────────────────────────────────────────────────────

export async function startWorkoutFromSession(sourceSessionId: string): Promise<{ newSessionId: string | null; error: string | null }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { newSessionId: null, error: 'Not authenticated' }

  const { data: source } = await supabase
    .from('workout_sessions')
    .select('title')
    .eq('id', sourceSessionId)
    .single()
  if (!source) return { newSessionId: null, error: 'Session not found' }

  // Neue Session
  const { data: newSession, error: sessionErr } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id, title: source.title, status: 'active', started_at: new Date().toISOString() })
    .select('id')
    .single()
  if (sessionErr || !newSession) return { newSessionId: null, error: sessionErr?.message ?? 'Failed' }

  // Exercises + Sets kopieren
  const { data: sourceExercises } = await supabase
    .from('workout_exercises')
    .select('id, exercise_id, position, superset_group')
    .eq('workout_session_id', sourceSessionId)
    .order('position')

  if (sourceExercises?.length) {
    for (const se of sourceExercises) {
      const { data: newEx } = await supabase
        .from('workout_exercises')
        .insert({ workout_session_id: newSession.id, exercise_id: se.exercise_id, position: se.position, superset_group: se.superset_group })
        .select('id')
        .single()

      if (!newEx) continue

      // Sets mit Gewicht & Wdh. übernehmen
      const { data: sourceSets } = await supabase
        .from('sets')
        .select('set_number, weight_kg, reps')
        .eq('workout_exercise_id', se.id)
        .order('set_number')

      if (sourceSets?.length) {
        await supabase.from('sets').insert(
          sourceSets.map(s => ({
            workout_session_id: newSession.id,
            workout_exercise_id: newEx.id,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
          }))
        )
      }
    }
  }

  return { newSessionId: newSession.id, error: null }
}