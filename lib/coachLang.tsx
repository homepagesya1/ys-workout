'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { CoachLang } from '@/types'

const COOKIE = 'ys_coach_lang'

type Messages = Record<string, string>

interface CoachLangContextValue {
  lang: CoachLang
  setLang: (l: CoachLang) => void
  t: (key: string) => string
}

const CoachLangContext = createContext<CoachLangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function CoachLangProvider({
  children,
  initialLang,
  messages,
}: {
  children: ReactNode
  initialLang: CoachLang
  messages: { en: Messages; de: Messages }
}) {
  const [lang, setLangState] = useState<CoachLang>(initialLang)

  function setLang(l: CoachLang) {
    setLangState(l)
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`
  }

  function t(key: string): string {
    return messages[lang]?.[key] ?? messages.en?.[key] ?? key
  }

  return (
    <CoachLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </CoachLangContext.Provider>
  )
}

export function useCoachLang() {
  return useContext(CoachLangContext)
}
