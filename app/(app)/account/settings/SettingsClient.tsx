'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CoachLang } from '@/types'

const COACH_LANG_COOKIE = 'ys_coach_lang'

export default function SettingsClient({
  userId,
  currentCoachLang,
  currentDisplayName,
}: {
  userId: string
  currentCoachLang: CoachLang
  currentDisplayName: string
}) {
  const router = useRouter()
  const [coachLang, setCoachLang] = useState<CoachLang>(currentCoachLang)
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSave() {
    const trimmed = displayName.trim()
    if (!trimmed) { setError('Name darf nicht leer sein'); return }
    if (trimmed.length > 40) { setError('Name darf max. 40 Zeichen haben'); return }

    setError('')
    setSaving(true)
    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ coach_lang: coachLang, display_name: trimmed })
      .eq('id', userId)

    if (dbErr) {
      setError(dbErr.message)
      setSaving(false)
      return
    }

    document.cookie = `${COACH_LANG_COOKIE}=${coachLang}; path=/; max-age=31536000; SameSite=Lax`
    setSaving(false)
    router.push('/account')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '40px' }}>

      {/* Header */}
      <div className="glass-nav" style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px var(--spacing-md)',
        zIndex: 100, borderTop: 'none',
        borderBottom: '1px solid rgba(151,125,255,0.15)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Settings</span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.12)',
            border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: 'var(--radius-main)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-danger)',
          }}>
            {error}
          </div>
        )}

        {/* Display Name */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>
            Display Name
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Your name shown in the app and to your trainer.
          </p>
          <div style={{ borderBottom: '1px solid rgba(151,125,255,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              style={{
                width: '100%',
                fontSize: 'var(--font-size-base)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text)',
              }}
            />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px', textAlign: 'right' }}>
            {displayName.trim().length}/40
          </p>
        </div>

        {/* Coach Language */}
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
          <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>
            Coach Language
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Language used in the Coach and Trainer area.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {(['en', 'de'] as CoachLang[]).map(lang => (
              <button
                key={lang}
                onClick={() => setCoachLang(lang)}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-main)',
                  border: coachLang === lang
                    ? '2px solid var(--color-primary)'
                    : '2px solid rgba(255,255,255,0.08)',
                  background: coachLang === lang
                    ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                    : 'var(--color-card)',
                  color: coachLang === lang ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: coachLang === lang ? '700' : '500',
                  fontSize: 'var(--font-size-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
