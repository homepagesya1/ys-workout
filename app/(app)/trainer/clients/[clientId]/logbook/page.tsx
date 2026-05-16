import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrainerLogbookClient from './TrainerLogbookClient'

export default async function TrainerClientLogbookPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (trainerProfile?.role !== 'trainer') redirect('/routines')

  const { data: link } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .maybeSingle()

  if (!link) redirect('/trainer')

  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', clientId)
    .single()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, title, status, source, plan_id, finished_at, created_at, duration_seconds, total_volume_kg, total_sets')
    .eq('user_id', clientId)
    .eq('status', 'finished')
    .eq('source', 'coach')
    .order('finished_at', { ascending: false })

  return (
    <TrainerLogbookClient
      clientId={clientId}
      clientName={clientProfile?.display_name ?? clientProfile?.email ?? 'Client'}
      sessions={sessions ?? []}
    />
  )
}
