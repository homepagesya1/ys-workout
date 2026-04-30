import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import SessionRefresher from '@/components/SessionRefresher'
import { LanguageProvider } from '@/lib/LanguageContext'
import type { Lang } from '@/lib/translations'

export const metadata: Metadata = {
  title: 'YS.Workout',
  description: 'Track your workouts',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'YS.Workout',
  },
}

// async is required in Next.js 15 because cookies() returns a Promise
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('ys_lang')?.value
  const initialLang: Lang = rawLang === 'en' ? 'en' : 'de'

  return (
    <html lang={initialLang}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#09090F" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-dark-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-dark-512.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <ThemeProvider scheme="obsidian" />
        <SessionRefresher />
        <LanguageProvider initialLang={initialLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}