'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function RoutinesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function LogBookIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  )
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CoachIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6" />
      <rect x="14" y="11" width="7" height="9" rx="1" />
      <path d="M14 14h7M17 11V9a2 2 0 0 1 4 0v2" />
    </svg>
  )
}

function TrainerIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3" />
      <path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M3 10l2 2 4-4" />
    </svg>
  )
}

interface Tab {
  href: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

export default function NavBar({
  role = 'user',
  hasCoach = false,
}: {
  role?: string
  hasCoach?: boolean
}) {
  const pathname = usePathname()

  const tabs: Tab[] = [
    {
      href: '/routines',
      label: 'Routines',
      icon: (active) => <RoutinesIcon active={active} />,
    },
  ]

  if (role === 'trainer') {
    tabs.push({
      href: '/trainer',
      label: 'Trainer',
      icon: (active) => <TrainerIcon active={active} />,
    })
  } else if (hasCoach) {
    tabs.push({
      href: '/coach',
      label: 'Coach',
      icon: (active) => <CoachIcon active={active} />,
    })
  }

  tabs.push(
    {
      href: '/logbook',
      label: 'Log Book',
      icon: (active) => <LogBookIcon active={active} />,
    },
    {
      href: '/account',
      label: 'Account',
      icon: (active) => <AccountIcon active={active} />,
    },
  )

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
