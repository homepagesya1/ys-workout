'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { useCoachLang } from '@/lib/coachLang'
import type { TrainerClient as TrainerClientType } from '@/types'

interface Props {
  trainerId: string
  clients: any[]
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%',
      background: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', fontWeight: '700', color: 'white', flexShrink: 0,
      overflow: 'hidden',
    }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  )
}

export default function TrainerClientPage({ trainerId, clients: initialClients }: Props) {
  const { t } = useCoachLang()
  const router = useRouter()
  const supabase = createClient()

  const [clients, setClients] = useState<any[]>(initialClients)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { setClients(initialClients) }, [initialClients])
  const [email, setEmail] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'already_linked'>('idle')

  async function handleAddClient() {
    if (!email.trim()) return
    setAddStatus('loading')

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar_url')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (!targetProfile) {
      setAddStatus('not_found')
      return
    }

    const existing = clients.find(c => c.client_id === targetProfile.id)
    if (existing) {
      setAddStatus('already_linked')
      return
    }

    const { data: newClient } = await supabase
      .from('trainer_clients')
      .insert({ trainer_id: trainerId, client_id: targetProfile.id, status: 'active' })
      .select('id, client_id, status, created_at')
      .single()

    if (newClient) {
      // Mark the client profile with has_coach = true
      await supabase
        .from('profiles')
        .update({ has_coach: true })
        .eq('id', targetProfile.id)

      setClients(prev => [...prev, {
        ...newClient,
        profiles: {
          display_name: targetProfile.display_name,
          email: targetProfile.email,
          avatar_url: targetProfile.avatar_url,
        },
      }])
      setAddStatus('success')
      setEmail('')
      router.refresh()
      setTimeout(() => { setShowAdd(false); setAddStatus('idle') }, 1500)
    }
  }

  return (
    <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
          {t('clients_title')}
        </h1>
        <button
          onClick={() => setShowAdd(o => !o)}
          style={{
            background: 'var(--color-primary)', border: 'none',
            borderRadius: 'var(--radius-full)',
            color: 'white', fontWeight: '600',
            fontSize: 'var(--font-size-sm)',
            padding: '6px 16px', cursor: 'pointer',
          }}
        >
          + {t('add_client')}
        </button>
      </div>

      {/* Add client form */}
      {showAdd && (
        <div className="glass" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <input
            type="email"
            placeholder={t('client_email_placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddClient()}
            style={{
              padding: '10px 12px', borderRadius: 'var(--radius-main)',
              border: '1px solid rgba(151,125,255,0.3)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--color-text)', fontSize: 'var(--font-size-base)',
              width: '100%', boxSizing: 'border-box',
            }}
          />
          {addStatus === 'not_found' && (
            <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t('client_not_found')}</p>
          )}
          {addStatus === 'already_linked' && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t('already_linked')}</p>
          )}
          {addStatus === 'success' && (
            <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t('linked')}</p>
          )}
          <button
            onClick={handleAddClient}
            disabled={addStatus === 'loading'}
            style={{
              padding: '10px', borderRadius: 'var(--radius-main)',
              background: 'var(--color-primary)', border: 'none',
              color: 'white', fontWeight: '600',
              fontSize: 'var(--font-size-base)', cursor: 'pointer',
            }}
          >
            {addStatus === 'loading' ? t('saving') : t('send_invite')}
          </button>
        </div>
      )}

      {/* Templates shortcut */}
      <Link
        href="/trainer/templates"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
          borderRadius: 'var(--radius-main)',
          textDecoration: 'none', marginBottom: 'var(--spacing-lg)',
        }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
          📋
        </div>
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: 'var(--font-size-base)' }}>{t('templates')}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Reusable plan templates</div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)', fontSize: '18px' }}>›</span>
      </Link>

      {/* Client list */}
      {clients.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
          {t('no_clients')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {clients.map(client => {
            const profile = client.profiles
            const name = profile?.display_name ?? profile?.email ?? 'Unknown'
            return (
              <div key={client.id} className="glass" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <Avatar name={name} url={profile?.avatar_url ?? null} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {profile?.email}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 8px',
                    borderRadius: '4px',
                    color: client.status === 'active' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    background: client.status === 'active'
                      ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${client.status === 'active' ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    {client.status === 'active' ? t('status_active') : t('status_pending')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <Link
                    href={`/trainer/clients/${client.client_id}/plans`}
                    style={{
                      flex: 1, textAlign: 'center', padding: '8px',
                      background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                      borderRadius: 'var(--radius-main)',
                      color: 'var(--color-primary)', fontWeight: '600',
                      fontSize: 'var(--font-size-sm)', textDecoration: 'none',
                    }}
                  >
                    {t('plans')}
                  </Link>
                  <Link
                    href={`/trainer/clients/${client.client_id}/logbook`}
                    style={{
                      flex: 1, textAlign: 'center', padding: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'var(--radius-main)',
                      color: 'var(--color-text)', fontWeight: '600',
                      fontSize: 'var(--font-size-sm)', textDecoration: 'none',
                    }}
                  >
                    {t('logbook')}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
