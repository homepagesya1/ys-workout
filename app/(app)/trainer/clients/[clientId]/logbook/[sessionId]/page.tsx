import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogbookDetailClient from '@/app/(app)/logbook/[id]/LogbookDetailClient'

export default async function TrainerSessionDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; sessionId: string }>
}) {
  const { clientId, sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: link } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .maybeSingle()

  if (!link) redirect('/trainer')

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', clientId)
    .maybeSingle()

  if (!session) redirect(`/trainer/clients/${clientId}/logbook`)

  const { data: workoutExercises } = await supabase
    .from('workout_exercises')
    .select('*, exercises(id, external_id, name, source)')
    .eq('workout_session_id', sessionId)
    .order('position')

  const { data: sets } = await supabase
    .from('sets')
    .select('*')
    .eq('workout_session_id', sessionId)
    .order('set_number')

  return (
    <LogbookDetailClient
      session={session}
      workoutExercises={workoutExercises ?? []}
      sets={sets ?? []}
      prs={[]}
      readOnly
    />
  )
}
