// app/help/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { useLang } from '@/lib/LanguageContext'
import { registry } from './_registry'

export default function HelpPage() {
  const router = useRouter()
  const { tr } = useLang()

  return (
    <>
      <LandingHeader />

      <main style={{
        minHeight: 'calc(100dvh - 60px)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        paddingBottom: 'calc(var(--spacing-xl) + env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* Back + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>
              ‹
            </button>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>{tr.help.title}</h1>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{tr.help.subtitle}</p>
            </div>
          </div>

          {/* Guide cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            {registry.map(guide => (
              <Link key={guide.href} href={guide.href} style={{ textDecoration: 'none' }}>
                <div className="glass" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{guide.icon}</span>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>{guide.title}</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.5' }}>{guide.description}</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-primary)', fontSize: '20px', flexShrink: 0 }}>›</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', cursor: 'pointer' }}>
              {tr.help.back}
            </button>
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  )
}