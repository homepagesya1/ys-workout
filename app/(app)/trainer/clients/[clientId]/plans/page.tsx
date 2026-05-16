import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlansClient from './PlansClient'
import type { ClientFolder } from '@/types'

export default async function TrainerClientPlansPage({
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
    .select('id, status')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .maybeSingle()

  if (!link) redirect('/trainer')

  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', clientId)
    .single()

  // Current client's folders + plans
  const { data: folders } = await supabase
    .from('client_folders')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .order('created_at')

  const folderIds = (folders ?? []).map(f => f.id)

  const { data: plans } = folderIds.length > 0
    ? await supabase
        .from('training_plans')
        .select('*')
        .in('folder_id', folderIds)
        .order('created_at')
    : { data: [] }

  const { data: shares } = await supabase
    .from('plan_shares')
    .select('plan_id')
    .eq('client_id', clientId)

  // Templates: folders/plans where client_id = trainer_id (self)
  const { data: templateFolders } = await supabase
    .from('client_folders')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', user.id)

  const templateFolderIds = (templateFolders ?? []).map(f => f.id)

  const { data: templates } = templateFolderIds.length > 0
    ? await supabase
        .from('training_plans')
        .select('*')
        .in('folder_id', templateFolderIds)
        .order('name')
    : { data: [] }

  // Other clients for copy-to-client feature
  const { data: otherClientRows } = await supabase
    .from('trainer_clients')
    .select('client_id')
    .eq('trainer_id', user.id)
    .neq('client_id', clientId)

  const otherClientIds = (otherClientRows ?? []).map(r => r.client_id)

  let allClients: { id: string; name: string; folders: ClientFolder[] }[] = []
  if (otherClientIds.length > 0) {
    const [{ data: otherProfiles }, { data: otherFolders }] = await Promise.all([
      supabase.from('profiles').select('id, display_name, email').in('id', otherClientIds),
      supabase.from('client_folders').select('*').eq('trainer_id', user.id).in('client_id', otherClientIds).order('created_at'),
    ])
    allClients = otherClientIds.map(id => {
      const profile = (otherProfiles ?? []).find((p: any) => p.id === id)
      const clientFolders = (otherFolders ?? []).filter((f: any) => f.client_id === id)
      return {
        id,
        name: (profile as any)?.display_name ?? (profile as any)?.email ?? 'Client',
        folders: clientFolders as ClientFolder[],
      }
    })
  }

  return (
    <PlansClient
      trainerId={user.id}
      clientId={clientId}
      clientName={clientProfile?.display_name ?? clientProfile?.email ?? 'Client'}
      folders={folders ?? []}
      plans={plans ?? []}
      sharedPlanIds={(shares ?? []).map(s => s.plan_id)}
      templates={(templates ?? []) as any[]}
      allClients={allClients}
    />
  )
}
