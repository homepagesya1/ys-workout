import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrainerClient from './TrainerClient'

export default async function TrainerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer') {
    return (
      <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', textAlign: 'center' }}>
        <div style={{ marginTop: '80px', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
          Access denied. Trainer role required.
        </div>
      </main>
    )
  }

  // Fetch trainer_clients rows first (no cross-schema join — auth.users ≠ public.profiles)
  const { data: clientRows } = await supabase
    .from('trainer_clients')
    .select('id, trainer_id, client_id, status, created_at')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })

  // Then fetch matching profiles in public schema separately
  const clientIds = (clientRows ?? []).map(r => r.client_id)
  const { data: clientProfiles } = clientIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .in('id', clientIds)
    : { data: [] }

  const profileMap = new Map((clientProfiles ?? []).map(p => [p.id, p]))
  const clients = (clientRows ?? []).map(r => ({
    ...r,
    profiles: profileMap.get(r.client_id) ?? null,
  }))

  return <TrainerClient trainerId={user.id} clients={clients} />
}
