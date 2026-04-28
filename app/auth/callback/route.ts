import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_seen_welcome')
          .eq('id', user.id)
          .single()

        // Erster Login → welcome=1 mitgeben, Flag setzen
        if (!profile?.has_seen_welcome) {
          await supabase
            .from('profiles')
            .update({ has_seen_welcome: true })
            .eq('id', user.id)

          return NextResponse.redirect(`${origin}/routines?welcome=1`)
        }
      }

      return NextResponse.redirect(`${origin}/routines`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}