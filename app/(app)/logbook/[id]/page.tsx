import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogbookDetailClient from './LogbookDetailClient'

export default async function LogbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()  // ← maybeSingle statt single — kein Error wenn nicht gefunden

  if (!session || sessionError) redirect('/logbook')

  const { data: workoutExercises } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercises(id, external_id, name, source)
    `)
    .eq('workout_session_id', id)
    .order('position')

  const { data: sets } = await supabase
    .from('sets')
    .select('*')
    .eq('workout_session_id', id)
    .order('set_number')

  const { data: prs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('workout_session_id', id)

  return (
    <LogbookDetailClient
      session={session}
      workoutExercises={workoutExercises ?? []}
      sets={sets ?? []}
      prs={prs ?? []}
    />
  )
}