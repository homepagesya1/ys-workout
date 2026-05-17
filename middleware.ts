import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LANG_COOKIE = 'ys_lang'
const DE_COUNTRIES = new Set(['DE', 'AT', 'CH'])

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // ── Geo-detection: set language cookie on first visit ──────────────────
  // Cloudflare automatically injects CF-IPCountry on Pages/Workers.
  // Falls back to 'en' on local dev where the header is absent.
  if (!request.cookies.has(LANG_COOKIE)) {
    const country = request.headers.get('CF-IPCountry') ?? ''
    const lang = DE_COUNTRIES.has(country) ? 'de' : 'en'
    supabaseResponse.cookies.set(LANG_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }

  // ── Supabase auth ──────────────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          // Re-apply the lang cookie after supabaseResponse is recreated
          if (!request.cookies.has(LANG_COOKIE)) {
            const country = request.headers.get('CF-IPCountry') ?? ''
            const lang = DE_COUNTRIES.has(country) ? 'de' : 'en'
            supabaseResponse.cookies.set(LANG_COOKIE, lang, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
              sameSite: 'lax',
            })
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/kontakt') ||
    pathname.startsWith('/forum') ||
    pathname.startsWith('/spenden') ||
    pathname.startsWith('/impressum') ||   
    pathname.startsWith('/datenschutz') ||
    pathname.startsWith('/personal-trainer') || 
    pathname.startsWith('/app-tour')

  // Not logged in → only public pages allowed
  if (!user && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in → approval check for protected pages
  if (user && !isPublicPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved')
      .eq('id', user.id)
      .single()

    if (profile?.is_approved === false) {
      return NextResponse.redirect(new URL('/login?pending=true', request.url))
    }
  }

  // Logged in + on login/register → redirect to app
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/routines', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|screenshots|pt-feature).*)'],
}