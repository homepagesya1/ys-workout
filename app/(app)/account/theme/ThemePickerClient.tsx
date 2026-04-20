'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { THEMES, applyTheme, type ThemeId } from '@/lib/themes'

export default function ThemePickerClient({
  currentScheme,
  userId,
}: {
  currentScheme: string
  userId: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<ThemeId>(currentScheme as ThemeId)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function handleSelect(id: ThemeId) {
    setSelected(id)
    applyTheme(id) // Live Preview
  }

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ color_scheme: selected })
      .eq('id', userId)
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
          onClick={() => { applyTheme(currentScheme as ThemeId); router.back() }}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500' }}
        >
          Cancel
        </button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Color Scheme</span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-base)' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
          Tap a theme to preview it live. Press Save to apply permanently.
        </p>

        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            style={{
              width: '100%', padding: '0',
              background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            {/* Theme Preview Card */}
            <div style={{
              borderRadius: 'var(--radius-main)',
              border: selected === theme.id
                ? `2px solid ${theme.primary}`
                : '2px solid transparent',
              overflow: 'hidden',
              transition: 'border 0.2s',
            }}>
              {/* Preview Mini-UI */}
              <div style={{ background: theme.bg, padding: '16px' }}>

                {/* Header preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '700', color: theme.bg,
                    }}>YA</div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>yannicksalm07</div>
                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>yannicksalm07@gmail.com</div>
                    </div>
                  </div>
                  <div style={{ width: '20px', height: '3px', background: theme.textSecondary, borderRadius: '2px', opacity: 0.5 }} />
                </div>

                {/* Stats preview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {['2', '13', '1h 47m'].map((v, i) => (
                    <div key={i} style={{
                      background: theme.card, borderRadius: '8px',
                      padding: '8px', textAlign: 'center',
                      border: `1px solid ${theme.textSecondary}22`,
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: theme.primary }}>{v}</div>
                      <div style={{ fontSize: '9px', color: theme.textSecondary }}>
                        {['Workouts', 'PRs', 'Time'][i]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar chart preview */}
                <div style={{
                  background: theme.card, borderRadius: '8px',
                  padding: '10px',
                  border: `1px solid ${theme.textSecondary}22`,
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>Statistics</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
                    {[0, 0.3, 0, 0.8, 0.4, 0, 1].map((h, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: h > 0 ? `${h * 100}%` : '3px',
                        background: h > 0 ? theme.primary : `${theme.textSecondary}33`,
                        borderRadius: '2px 2px 0 0',
                        opacity: h > 0 ? (0.4 + h * 0.6) : 1,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Theme name + checkmark */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{theme.name}</span>
                  {selected === theme.id && (
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: theme.bg, fontWeight: '700',
                    }}>✓</div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}