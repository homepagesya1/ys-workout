import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoutinesClient from './RoutinesClient'

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: routines } = await supabase
    .from('routines')
    .select(`*, routine_exercises(count)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { welcome } = await searchParams

  return <RoutinesClient routines={routines ?? []} showWelcome={welcome === '1'} />
}