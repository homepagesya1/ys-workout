import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('coach_lang, display_name')
    .eq('id', user.id)
    .single()

  return (
    <SettingsClient
      userId={user.id}
      currentCoachLang={(profile?.coach_lang as 'en' | 'de') ?? 'en'}
      currentDisplayName={profile?.display_name ?? ''}
    />
  )
}
