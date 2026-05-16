import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoachClient from './CoachClient'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_coach')
    .eq('id', user.id)
    .single()

  if (!profile?.has_coach) {
    return (
      <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', textAlign: 'center' }}>
        <div style={{ marginTop: '80px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          You don&apos;t have a trainer connected yet.
        </div>
      </main>
    )
  }

  const { data: shares } = await supabase
    .from('plan_shares')
    .select(`
      id, plan_id, shared_at,
      training_plans (
        id, name, exercises,
        client_folders ( id, name )
      )
    `)
    .eq('client_id', user.id)
    .order('shared_at', { ascending: false })

  return <CoachClient shares={(shares ?? []) as any[]} userId={user.id} />
}
