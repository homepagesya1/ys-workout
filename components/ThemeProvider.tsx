'use client'

import { useEffect } from 'react'
import { applyTheme, type ThemeId } from '@/lib/themes'

export default function ThemeProvider({ scheme }: { scheme: string }) {
  useEffect(() => {
    // Zuerst localStorage prüfen, dann DB-Wert
    const saved = localStorage.getItem('color_scheme') as ThemeId | null
    applyTheme(saved ?? (scheme as ThemeId) ?? 'obsidian')
  }, [scheme])

  return null
}