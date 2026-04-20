import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/ui/NavBar'
import ActiveWorkoutBanner from '@/components/ui/ActiveWorkoutBanner'
import ThemeProvider from '@/components/ThemeProvider'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let colorScheme = 'obsidian'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('color_scheme')
      .eq('id', user.id)
      .single()
    colorScheme = profile?.color_scheme ?? 'obsidian'
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
    }}>
      <ThemeProvider scheme={colorScheme} />
      {children}
      <ActiveWorkoutBanner />
      <NavBar />
    </div>
  )
}