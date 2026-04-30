// components/SessionRefresher.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionRefresher() {
  useEffect(() => {
    const supabase = createClient()

    // Beim Fokus / Sichtbarkeit → Session prüfen & refreshen
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await supabase.auth.getSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return null
}