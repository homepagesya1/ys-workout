// ─── InstallAppPage.tsx ──────────────────────────────────────────────────────
'use client'
 
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/LanguageContext'
import { meta } from './_meta'
 
function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {steps.map((step, i) => (
        <div key={i} className="glass" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
          <div style={{ width: '26px', height: '26px', flexShrink: 0, borderRadius: 'var(--radius-full)', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--color-primary)' }}>
            {i + 1}
          </div>
          <div>
            <p style={{ fontWeight: '600', fontSize: 'var(--font-size-base)', marginBottom: '3px' }}>{step.title}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
 
export default function InstallAppPage() {
  const router = useRouter()
  const { tr } = useLang()
  const ins = tr.install
 
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', paddingBottom: 'calc(var(--spacing-xl) + env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
 
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '4px', flexShrink: 0 }}>‹</button>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>{meta.icon} {ins.title}</h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{ins.description}</p>
          </div>
        </div>
 
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            {ins.ios.label}
          </p>
          <StepList steps={ins.ios.steps as { title: string; description: string }[]} />
        </div>
 
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            {ins.android.label}
          </p>
          <StepList steps={ins.android.steps as { title: string; description: string }[]} />
        </div>
 
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500', cursor: 'pointer' }}>
            {ins.back}
          </button>
        </div>
      </div>
    </main>
  )
}
 