'use client'

import { useState } from 'react'
import Link from 'next/link'

const PRESETS = [2, 5, 10, 20]
const CURRENCIES = [
  { value: 'chf', label: 'CHF' },
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
]

export default function SpendenPage() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'chf' | 'eur' | 'usd'>('chf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDonate() {
    setError('')
    const value = parseFloat(amount)
    if (!amount || isNaN(value) || value < 1) {
      setError('Bitte gib einen Betrag von mindestens 1.00 ein.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(value * 100), // → Rappen/Cents
          currency,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen der Zahlung.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Netzwerkfehler. Bitte versuch es nochmal.')
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'var(--spacing-lg)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)',
          textDecoration: 'none', marginBottom: 'var(--spacing-xl)',
          transition: 'color 0.2s ease',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          ← Zurück
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>❤️</div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Spende
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
            Jeder Betrag hilft, YS.Workout weiterzuentwickeln und eines Tages als echte iOS & Android App herauszubringen.
          </p>
        </div>

        <div className="glass" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

          {/* Preset Buttons */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
              Schnellauswahl
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  style={{
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-main)',
                    border: amount === String(p)
                      ? '1px solid var(--color-primary)'
                      : '1px solid rgba(139,92,246,0.2)',
                    background: amount === String(p)
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: amount === String(p) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div style={{ borderBottom: '1px solid rgba(139,92,246,0.3)', paddingBottom: 'var(--spacing-sm)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Betrag (eigene Eingabe)
            </label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="z.B. 15"
              style={{
                background: 'transparent', color: 'var(--color-text)',
                border: 'none', outline: 'none',
                fontSize: 'var(--font-size-md)', width: '100%',
                fontWeight: '600',
              }}
            />
          </div>

          {/* Currency Selector */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
              Währung
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
              {CURRENCIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCurrency(c.value as typeof currency)}
                  style={{
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-main)',
                    border: currency === c.value
                      ? '1px solid var(--color-primary)'
                      : '1px solid rgba(139,92,246,0.2)',
                    background: currency === c.value
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: currency === c.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(255,68,68,0.15)',
              border: '1px solid rgba(255,68,68,0.3)',
              borderRadius: 'var(--radius-main)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-danger)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Summary + Button */}
          <button
            onClick={handleDonate}
            disabled={loading || !amount}
            style={{
              width: '100%', padding: 'var(--spacing-md)',
              background: loading || !amount ? 'rgba(139,92,246,0.4)' : 'var(--color-primary)',
              color: 'var(--color-text)', border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-md)', fontWeight: '700',
              cursor: loading || !amount ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading
              ? 'Weiterleitung...'
              : amount && !isNaN(parseFloat(amount))
                ? `${parseFloat(amount).toFixed(2)} ${currency.toUpperCase()} spenden ❤️`
                : 'Betrag wählen'
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Sichere Zahlung via Stripe · Keine Kontoerstellung nötig
          </p>

        </div>
      </div>
    </main>
  )
}