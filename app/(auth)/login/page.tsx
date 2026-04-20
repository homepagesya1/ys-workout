'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError('Invalid email or password')
            setLoading(false)
            return
        }

        // Check if approved
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_approved')
            .eq('id', data.user.id)
            .single()

        if (!profile?.is_approved) {
            await supabase.auth.signOut()
            setError('Your account is pending approval.')
            setLoading(false)
            return
        }

        router.push('/routines')
        router.refresh()
    }

    return (
        <main style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-bg)',
        }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        letterSpacing: '-0.5px',
                    }}>YS.Workout</h1>
                    <p style={{
                        color: 'var(--color-text-secondary)',
                        marginTop: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-sm)',
                    }}>Login to Record your Workout</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="glass" style={{
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                }}>

                    {/* Pending notice */}
                    {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('pending') && (
                        <div style={{
                            background: 'rgba(151, 125, 255, 0.15)',
                            border: '1px solid rgba(151, 125, 255, 0.3)',
                            borderRadius: 'var(--radius-main)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            textAlign: 'center',
                        }}>
                            Your account is pending approval.
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(255, 68, 68, 0.15)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-main)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-danger)',
                            textAlign: 'center',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div style={{
                        borderBottom: '1px solid rgba(151, 125, 255, 0.3)',
                        paddingBottom: 'var(--spacing-sm)',
                    }}>
                        <label style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: '4px',
                        }}>E-Mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div style={{
                        borderBottom: '1px solid rgba(151, 125, 255, 0.3)',
                        paddingBottom: 'var(--spacing-sm)',
                    }}>
                        <label style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: '4px',
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            background: loading ? 'rgba(151, 125, 255, 0.4)' : 'var(--color-primary)',
                            color: 'var(--color-text)',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-md)',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity var(--transition)',
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Register link */}
                    <p style={{
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                    }}>
                        No account?{' '}
                        <Link href="/register" style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}>
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    )
}