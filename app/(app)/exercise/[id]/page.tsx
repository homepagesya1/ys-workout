import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getExerciseById } from '@/lib/exercisedb'
import ShowExerciseClient from './ShowExerciseClient'

export default async function ShowExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Hole Exercise aus DB um external_id zu kriegen
  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (!exercise) redirect('/routines')

  // Hole EDB Daten
  const edbData = exercise.external_id
    ? await getExerciseById(exercise.external_id)
    : null

  // Hole PRs für diese Exercise
  const { data: prs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('exercise_id', id)
    .order('created_at', { ascending: false })

  // Hole Sets History für Stats
  const { data: sets } = await supabase
    .from('sets')
    .select(`
      *,
      workout_sessions!inner(finished_at, status)
    `)
    .eq('workout_sessions.user_id', user.id)
    .eq('workout_exercise_id', exercise.id)
    .eq('workout_sessions.status', 'finished')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <ShowExerciseClient
      exercise={exercise}
      edbData={edbData}
      prs={prs ?? []}
      sets={sets ?? []}
    />
  )
}