import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('duration_seconds, total_sets')
    .eq('user_id', user.id)
    .eq('status', 'finished')

  const { data: prs } = await supabase
    .from('personal_records')
    .select('id')
    .eq('user_id', user.id)

  const totalWorkouts = sessions?.length ?? 0
  const totalPRs = prs?.length ?? 0
  const totalSeconds = sessions?.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) ?? 0

  function formatTotalTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <AccountClient
      profile={profile}
      userId={user.id}
      stats={{
        totalWorkouts,
        totalPRs,
        totalTime: formatTotalTime(totalSeconds),
      }}
    />
  )
}