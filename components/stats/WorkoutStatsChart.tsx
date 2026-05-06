'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type StatType = 'duration' | 'volume' | 'reps'
type TimeRange = '1W' | '3M' | '6M' | '1Y' | 'All'

const STAT_BUTTONS: { key: StatType; label: string }[] = [
    { key: 'duration', label: '⏱ Duration' },
    { key: 'volume', label: '🏋️ Volume' },
    { key: 'reps', label: '🔁 Reps' },
]

const TIME_BUTTONS: { key: TimeRange; label: string }[] = [
    { key: '1W', label: '1W' },
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
    { key: 'All', label: 'All' },
]

function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function formatMonday(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDay(date: Date): string {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
}

function getCutoffDate(range: TimeRange): Date | null {
    const now = new Date()
    switch (range) {
        case '1W': { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
        case '3M': { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d }
        case '6M': { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d }
        case '1Y': { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d }
        case 'All': return null
    }
}

// FIX: format minutes as "Xhr Ymin" instead of raw minutes
function formatMinutes(min: number): string {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h > 0 && m > 0) return `${h}hr ${m}min`
    if (h > 0) return `${h}hr`
    return `${m}min`
}

export default function WorkoutStatsChart({ userId }: { userId: string }) {
    const [statType, setStatType] = useState<StatType>('duration')
    const [timeRange, setTimeRange] = useState<TimeRange>('1W')
    const [loading, setLoading] = useState(true)
    const [labels, setLabels] = useState<string[]>([])
    const [values, setValues] = useState<number[]>([])
    const [cssVars, setCssVars] = useState({ primary: '#977DFF', bg: '#0A083C', textSecondary: '#BBB5FF' })
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const chartRef = useRef<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const root = document.documentElement
        const style = getComputedStyle(root)
        setCssVars({
            primary: style.getPropertyValue('--color-primary').trim() || '#977DFF',
            bg: style.getPropertyValue('--color-bg').trim() || '#0A083C',
            textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#BBB5FF',
        })
    }, [])

    useEffect(() => {
        loadData()
    }, [statType, timeRange])

    useEffect(() => {
        if (!loading) buildChart()
    }, [loading, labels, values, cssVars])

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
        script.async = true
        document.head.appendChild(script)
        return () => { document.head.removeChild(script) }
    }, [])

    async function loadData() {
        setLoading(true)

        const cutoff = getCutoffDate(timeRange)
        let query = supabase
            .from('workout_sessions')
            .select('id, finished_at, duration_seconds, total_volume_kg')
            .eq('user_id', userId)
            .eq('status', 'finished')
            .order('finished_at', { ascending: true })

        if (cutoff) query = query.gte('finished_at', cutoff.toISOString())
        const { data: sessions } = await query

        let repsMap: Record<string, number> = {}
        if (statType === 'reps' && sessions && sessions.length > 0) {
            const { data: setsData } = await supabase
                .from('sets')
                .select('workout_session_id, reps')
                .in('workout_session_id', sessions.map(s => s.id))
                .not('reps', 'is', null)
            setsData?.forEach(s => {
                repsMap[s.workout_session_id] = (repsMap[s.workout_session_id] ?? 0) + (s.reps ?? 0)
            })
        }

        function getValue(session: any): number {
            if (statType === 'duration') return Math.round((session.duration_seconds ?? 0) / 60)
            if (statType === 'volume') return Math.round(session.total_volume_kg ?? 0)
            if (statType === 'reps') return repsMap[session.id] ?? 0
            return 0
        }

        if (timeRange === '1W') {
            const pts: Record<string, number> = {}
            const keys: string[] = []
            const now = new Date()
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - i)
                const key = formatDay(d)
                pts[key] = 0
                keys.push(key)
            }
            sessions?.forEach(s => {
                const key = formatDay(new Date(s.finished_at))
                if (key in pts) pts[key] += getValue(s)
            })
            setLabels(keys)
            setValues(keys.map(k => pts[k]))
        } else {
            const pts: Record<string, number> = {}
            const keys: string[] = []

            const now = new Date()
            const cutoff = getCutoffDate(timeRange) ?? new Date(now.getFullYear() - 3, 0, 1)

            if (timeRange === '3M' || timeRange === '6M') {
                const start = getMonday(cutoff)
                const current = new Date(start)
                while (current <= now) {
                    const key = formatMonday(current)
                    pts[key] = 0
                    keys.push(key)
                    current.setDate(current.getDate() + 7)
                }
            } else {
                const start = new Date(cutoff.getFullYear(), cutoff.getMonth(), 1)
                const current = new Date(start)
                while (current <= now) {
                    const key = current.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
                    pts[key] = 0
                    keys.push(key)
                    current.setMonth(current.getMonth() + 1)
                }
                sessions?.forEach(s => {
                    const d = new Date(s.finished_at)
                    const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
                    if (key in pts) pts[key] += getValue(s)
                })
                setLabels(keys)
                setValues(keys.map(k => pts[k]))
                setLoading(false)
                return
            }

            sessions?.forEach(s => {
                const key = formatMonday(getMonday(new Date(s.finished_at)))
                if (key in pts) pts[key] += getValue(s)
            })

            setLabels(keys)
            setValues(keys.map(k => pts[k]))
        }

        setLoading(false)
    }

    function buildChart() {
        if (!canvasRef.current) return
        const Chart = (window as any).Chart
        if (!Chart) {
            setTimeout(buildChart, 200)
            return
        }

        if (chartRef.current) {
            chartRef.current.destroy()
            chartRef.current = null
        }

        const { primary, bg, textSecondary } = cssVars
        const max = Math.max(...values, 1)

        function hexAlpha(hex: string, alpha: number): string {
            const h = hex.replace('#', '')
            const r = parseInt(h.substring(0, 2), 16)
            const g = parseInt(h.substring(2, 4), 16)
            const b = parseInt(h.substring(4, 6), 16)
            return `rgba(${r},${g},${b},${alpha})`
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: values.map(v =>
                        v > 0
                            ? hexAlpha(primary, Math.round((0.4 + (v / max) * 0.5) * 100) / 100)
                            : hexAlpha(textSecondary, 0.05)
                    ),
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: hexAlpha(bg, 0.95),
                        titleColor: textSecondary,
                        bodyColor: primary,
                        borderColor: hexAlpha(primary, 0.3),
                        borderWidth: 1,
                        callbacks: {
                            // FIX: tooltip shows "1hr 32min" instead of "92 min"
                            label: (ctx: any) => {
                                if (statType === 'duration') return formatMinutes(ctx.parsed.y)
                                if (statType === 'volume') return `${ctx.parsed.y} kg`
                                return `${ctx.parsed.y} reps`
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: hexAlpha(textSecondary, 0.04) },
                        border: { color: hexAlpha(textSecondary, 0.1) },
                        ticks: {
                            color: hexAlpha(textSecondary, 0.5),
                            font: { size: 10 },
                            maxRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 8,
                        }
                    },
                    y: {
                        grid: { color: hexAlpha(textSecondary, 0.04) },
                        border: { color: hexAlpha(textSecondary, 0.1) },
                        beginAtZero: true,
                        ticks: {
                            color: hexAlpha(textSecondary, 0.5),
                            font: { size: 10 },
                            maxTicksLimit: 4,
                            // FIX: y-axis ticks show "1hr 30min" instead of "90m"
                            callback: (v: any) => {
                                if (statType === 'duration') return formatMinutes(v)
                                if (statType === 'volume' && v >= 1000) return `${(v / 1000).toFixed(1)}k`
                                return v
                            }
                        }
                    }
                }
            }
        })
    }

    return (
        <div className="glass" style={{ padding: 'var(--spacing-md)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Statistics</h2>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {TIME_BUTTONS.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setTimeRange(btn.key)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: timeRange === btn.key
                                    ? 'var(--color-primary)'
                                    : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                                color: timeRange === btn.key ? 'white' : 'var(--color-text-secondary)',
                                fontSize: '11px',
                                fontWeight: timeRange === btn.key ? '600' : '400',
                                cursor: 'pointer',
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '180px', marginBottom: '8px' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Loading...
                    </div>
                ) : labels.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        No workouts in this period
                    </div>
                ) : (
                    <canvas ref={canvasRef} role="img" aria-label="Workout statistics bar chart" />
                )}
            </div>

            <div style={{
                display: 'flex', gap: 'var(--spacing-sm)',
                borderTop: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)',
                paddingTop: 'var(--spacing-md)',
            }}>
                {STAT_BUTTONS.map(btn => (
                    <button
                        key={btn.key}
                        onClick={() => setStatType(btn.key)}
                        style={{
                            flex: 1, padding: '8px',
                            borderRadius: 'var(--radius-main)',
                            border: statType === btn.key
                                ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)'
                                : '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
                            background: statType === btn.key
                                ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                                : 'transparent',
                            color: statType === btn.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: statType === btn.key ? '600' : '400',
                            cursor: 'pointer',
                        }}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    )
}