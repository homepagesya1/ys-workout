// lib/LanguageContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { t, type Lang, type Translations } from './translations'

const COOKIE_NAME = 'ys_lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Translations
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  setLang: () => {},
  tr: t.de,
})

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  function setLang(l: Lang) {
    setLangState(l)
    // Persist for 1 year
    document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}