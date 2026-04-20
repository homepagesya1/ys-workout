'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        const supabase = createClient()

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
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
                <div className="glass" style={{
                    width: '100%',
                    maxWidth: '380px',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                }}>
                    <div style={{ fontSize: '48px' }}>⏳</div>
                    <h2 style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                        Registration received
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Your account is pending approval. You will be able to login once approved.
                    </p>
                    <Link href="/login" style={{
                        color: 'var(--color-primary)',
                        fontSize: 'var(--font-size-sm)',
                        textDecoration: 'none',
                    }}>
                        Back to Login
                    </Link>
                </div>
            </main>
        )
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
                    }}>Create your account</p>
                </div>

                <form onSubmit={handleRegister} className="glass" style={{
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                }}>

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
                            placeholder="min. 8 characters"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div style={{
                        borderBottom: '1px solid rgba(151, 125, 255, 0.3)',
                        paddingBottom: 'var(--spacing-sm)',
                    }}>
                        <label style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            display: 'block',
                            marginBottom: '4px',
                        }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

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
                        }}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <p style={{
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                    }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}>
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    )
}