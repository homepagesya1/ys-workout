'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/routines',
    label: 'Routines',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 10h16M4 14h10"/>
        <circle cx="18" cy="17" r="3"/>
        <path d="m21 20-1.5-1.5"/>
      </svg>
    ),
  },
  {
    href: '/logbook',
    label: 'Log Book',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <path d="M9 7h6M9 11h4"/>
      </svg>
    ),
  },
  {
    href: '/account',
    label: 'Account',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
      paddingTop: '8px',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      <nav style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderRadius: '9999px',
        background: 'color-mix(in srgb, var(--color-bg) 55%, transparent)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
        boxShadow: `
          0 0 0 1px color-mix(in srgb, var(--color-text) 6%, transparent) inset,
          0 2px 32px color-mix(in srgb, var(--color-bg) 45%, transparent),
          0 1px 0 color-mix(in srgb, var(--color-text) 8%, transparent) inset
        `,
      }}>
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '8px 20px',
                borderRadius: '9999px',
                color: active ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text-secondary) 50%, transparent)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: active
                  ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                  : 'transparent',
                border: active
                  ? '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)'
                  : '1px solid transparent',
                boxShadow: active
                  ? `0 0 12px color-mix(in srgb, var(--color-primary) 15%, transparent)`
                  : 'none',
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: '10px',
                fontWeight: active ? '600' : '400',
                letterSpacing: '0.3px',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}