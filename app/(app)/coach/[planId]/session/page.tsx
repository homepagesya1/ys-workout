import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoachSessionClient from './CoachSessionClient'

export default async function CoachSessionPage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: share } = await supabase
    .from('plan_shares')
    .select('plan_id')
    .eq('plan_id', planId)
    .eq('client_id', user.id)
    .maybeSingle()

  if (!share) redirect('/coach')

  const { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (!plan) redirect('/coach')

  // Fetch internal→external exercise ID mapping for image loading
  const exerciseIds = (plan.exercises ?? []).map((e: any) => e.exerciseId).filter(Boolean)
  const { data: dbExercises } = exerciseIds.length > 0
    ? await supabase.from('exercises').select('id, external_id').in('id', exerciseIds)
    : { data: [] }

  const exerciseExternalIds: Record<string, string> = {}
  for (const e of (dbExercises ?? [])) {
    if (e.external_id) exerciseExternalIds[e.id] = e.external_id
  }

  const trainerId: string = (plan as any).trainer_id

  // Fetch coach exercise notes (trainer → client)
  const { data: notesData } = exerciseIds.length > 0
    ? await supabase
        .from('coach_exercise_notes')
        .select('exercise_id, note')
        .eq('trainer_id', trainerId)
        .eq('client_id', user.id)
        .in('exercise_id', exerciseIds)
    : { data: [] }

  const initialNotes: Record<string, string> = {}
  for (const n of (notesData ?? [])) {
    if (n.exercise_id) initialNotes[n.exercise_id] = n.note
  }

  // Fetch previous coach session sets for "Prev" column
  const { data: prevSession } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan_id', planId)
    .eq('status', 'finished')
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const previousSets: Record<string, { weight_kg: number | null; reps: number | null }[]> = {}

  if (prevSession) {
    const { data: prevExercises } = await supabase
      .from('workout_exercises')
      .select('id, exercise_id, position')
      .eq('workout_session_id', prevSession.id)
      .order('position')

    if ((prevExercises ?? []).length > 0) {
      const weIds = prevExercises!.map(e => e.id)
      const { data: prevSetData } = await supabase
        .from('sets')
        .select('workout_exercise_id, weight_kg, reps, set_number')
        .in('workout_exercise_id', weIds)
        .order('set_number')

      for (const we of prevExercises!) {
        previousSets[we.exercise_id] = (prevSetData ?? [])
          .filter(s => s.workout_exercise_id === we.id)
          .map(s => ({ weight_kg: s.weight_kg, reps: s.reps }))
      }
    }
  }

  return (
    <CoachSessionClient
      plan={plan}
      userId={user.id}
      trainerId={trainerId}
      exerciseExternalIds={exerciseExternalIds}
      previousSets={previousSets}
      initialNotes={initialNotes}
    />
  )
}
