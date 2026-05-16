import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlansClient from '../clients/[clientId]/plans/PlansClient'

export default async function TrainerTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer') redirect('/routines')

  // Templates: folders where client_id = trainer_id (self-owned)
  const { data: folders } = await supabase
    .from('client_folders')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('client_id', user.id)
    .order('created_at')

  const folderIds = (folders ?? []).map(f => f.id)

  const { data: plans } = folderIds.length > 0
    ? await supabase
        .from('training_plans')
        .select('*')
        .in('folder_id', folderIds)
        .order('created_at')
    : { data: [] }

  return (
    <PlansClient
      trainerId={user.id}
      clientId={user.id}
      clientName=""
      folders={folders ?? []}
      plans={(plans ?? []) as any[]}
      sharedPlanIds={[]}
      templates={[]}
      allClients={[]}
      isTemplates={true}
    />
  )
}
