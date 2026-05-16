import { cookies } from 'next/headers'
import { CoachLangProvider } from '@/lib/coachLang'
import type { CoachLang } from '@/types'
import enMessages from './messages/en.json'
import deMessages from './messages/de.json'

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('ys_coach_lang')?.value ?? 'en') as CoachLang

  return (
    <CoachLangProvider initialLang={lang} messages={{ en: enMessages, de: deMessages }}>
      {children}
    </CoachLangProvider>
  )
}
