import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ThemePickerClient from './ThemePickerClient'

export default async function ThemePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('color_scheme')
    .eq('id', user.id)
    .single()

  return (
    <ThemePickerClient
      currentScheme={profile?.color_scheme ?? 'obsidian'}
      userId={user.id}
    />
  )
}