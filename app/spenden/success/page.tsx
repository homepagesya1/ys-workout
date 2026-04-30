import Link from 'next/link'

export default function SpendenSuccessPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'var(--spacing-lg)',
    }}>
      <div className="glass" style={{
        width: '100%', maxWidth: '380px',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
      }}>
        <div style={{ fontSize: '56px' }}>🎉</div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', color: 'var(--color-primary)' }}>
          Danke!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
          Deine Spende ist angekommen. Sie hilft direkt dabei, YS.Workout weiterzuentwickeln. Das bedeutet mir sehr viel ❤️
        </p>
        <Link href="/" style={{
          padding: 'var(--spacing-md)',
          background: 'var(--color-primary)', color: 'var(--color-text)',
          borderRadius: 'var(--radius-full)', textDecoration: 'none',
          fontWeight: '700', fontSize: 'var(--font-size-base)',
        }}>
          Zurück zur App
        </Link>
      </div>
    </main>
  )
}