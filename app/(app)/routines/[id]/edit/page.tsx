import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoutineEditClient from './RoutineEditClient'

export default async function RoutineEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: routine } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!routine) redirect('/routines')

  const { data: routineExercises } = await supabase
    .from('routine_exercises')
    .select(`
      *,
      exercises(id, external_id, name, source),
      routine_sets(*)
    `)
    .eq('routine_id', id)
    .order('position')

  // ── Exercise notes (main DB, per user per exercise) ──────────────────────
  const exerciseIds = routineExercises?.map(re => re.exercise_id) ?? []
  const initialNotes: Record<string, string> = {}
  if (exerciseIds.length > 0) {
    const { data: notesData } = await supabase
      .from('exercise_notes')
      .select('exercise_id, note')
      .eq('user_id', user.id)
      .in('exercise_id', exerciseIds)
    notesData?.forEach(n => { initialNotes[n.exercise_id] = n.note })
  }

  return (
    <RoutineEditClient
      routine={routine}
      initialExercises={routineExercises ?? []}
      initialNotes={initialNotes}
    />
  )
}