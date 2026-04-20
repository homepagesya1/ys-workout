'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PersonalRecord } from '@/types'

type StatView = 'max_weight' | 'volume' | '1rm' | 'max_reps' | 'max_duration' | 'max_distance'
type TimeRange = '1M' | '3M' | '6M' | 'All'

interface Props {
    exercise: any
    edbData: any
    prs: PersonalRecord[]
    sets: any[]
}

const STAT_BUTTONS: { key: StatView; label: string }[] = [
    { key: 'max_weight', label: 'Max Weight' },
    { key: 'volume', label: 'Volume' },
    { key: '1rm', label: '1RM Est.' },
    { key: 'max_reps', label: 'Best Reps' },
    { key: 'max_duration', label: 'Duration' },
    { key: 'max_distance', label: 'Distance' },
]

const TIME_RANGES: TimeRange[] = ['1M', '3M', '6M', 'All']

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    'All': Infinity,
}

const STAT_UNIT: Record<StatView, string> = {
    max_weight: ' kg',
    volume: ' kg',
    '1rm': ' kg',
    max_reps: ' reps',
    max_duration: 's',
    max_distance: ' km',
}

const PR_UNIT: Record<string, string> = {
    max_weight: ' kg',
    max_reps: ' reps',
    max_duration: 's',
    max_distance: ' km',
}

export default function ShowExerciseClient({ exercise, edbData, prs, sets }: Props) {
    const router = useRouter()
    const [statView, setStatView] = useState<StatView>('max_weight')
    const [timeRange, setTimeRange] = useState<TimeRange>('3M')

    const name = edbData?.name ?? exercise.name ?? 'Exercise'
    const videoUrl = edbData?.videoUrl ?? null
    const imageUrl = edbData?.imageUrl ?? exercise.image_url ?? null
    const targetMuscles: string[] = edbData?.targetMuscles ?? []
    const secondaryMuscles: string[] = edbData?.secondaryMuscles ?? []
    const instructions: string[] = edbData?.instructions ?? []
    const tips: string[] = edbData?.exerciseTips ?? []

    function getFilteredSets() {
        const days = TIME_RANGE_DAYS[timeRange]
        if (days === Infinity) return sets
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        return sets.filter(s => new Date(s.created_at) > cutoff)
    }

    function getStatValue(s: any): number {
        switch (statView) {
            case 'max_weight': return s.weight_kg ?? 0
            case 'volume': return (s.weight_kg ?? 0) * (s.reps ?? 0)
            case '1rm': return (s.weight_kg ?? 0) * (1 + (s.reps ?? 0) / 30)
            case 'max_reps': return s.reps ?? 0
            case 'max_duration': return s.duration_seconds ?? 0
            case 'max_distance': return s.distance_km ?? 0
        }
    }

    const filteredSets = getFilteredSets()
    const maxVal = Math.max(...filteredSets.map(getStatValue), 0)

    return (
        <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '100px' }}>

            {/* Header */}
            <div className="glass-nav" style={{
                position: 'sticky', top: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px var(--spacing-md)',
                zIndex: 100, borderTop: 'none',
                borderBottom: '1px solid rgba(151,125,255,0.15)',
            }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px' }}
                >
                    ←
                </button>
                <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>{name}</span>
                <div style={{ width: '32px' }} />
            </div>

            <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

                {/* Video oder Image */}
                {(videoUrl || imageUrl) && (
                    <div style={{
                        borderRadius: 'var(--radius-main)',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.05)',
                        width: '100%',
                    }}>
                        {videoUrl ? (
                            <video
                                src={videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        ) : (
                            <img
                                src={imageUrl}
                                alt={name}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        )}
                    </div>
                )}

                {/* Name + Muscles */}
                <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        {name}
                    </h1>
                    {targetMuscles.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Primary: </span>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: '500' }}>
                                {targetMuscles.join(', ')}
                            </span>
                        </div>
                    )}
                    {secondaryMuscles.length > 0 && (
                        <div>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Secondary: </span>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                {secondaryMuscles.join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                    <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>
                        Statistics
                    </h2>

                    {/* Stat Buttons */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
                        {STAT_BUTTONS.map(btn => (
                            <button
                                key={btn.key}
                                onClick={() => setStatView(btn.key)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    border: statView === btn.key
                                        ? '1px solid var(--color-primary)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    background: statView === btn.key ? 'rgba(151,125,255,0.2)' : 'transparent',
                                    color: statView === btn.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: statView === btn.key ? '600' : '400',
                                    cursor: 'pointer',
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        {TIME_RANGES.map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none',
                                    background: timeRange === range ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    color: timeRange === range ? 'white' : 'var(--color-text-secondary)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: timeRange === range ? '600' : '400',
                                    cursor: 'pointer',
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Bar Chart */}
                    {filteredSets.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: 'var(--spacing-xl)',
                            color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)',
                        }}>
                            No data yet for this period
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                                {filteredSets.slice(-20).map((s, i) => {
                                    const val = getStatValue(s)
                                    const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: `${Math.max(heightPct, 4)}%`,
                                                background: `rgba(151, 125, 255, ${0.4 + (heightPct / 100) * 0.6})`,
                                                borderRadius: '3px 3px 0 0',
                                                minWidth: '4px',
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            <div style={{
                                marginTop: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                textAlign: 'right',
                            }}>
                                Best: <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                                    {maxVal.toFixed(1)}{STAT_UNIT[statView]}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Personal Records */}
                {prs.length > 0 && (
                    <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                        <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>
                            Personal Records
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {prs.map(pr => (
                                <div key={pr.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 'var(--spacing-sm) 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <span>🥇</span>
                                        <span style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'capitalize',
                                        }}>
                                            {pr.pr_type.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                                        {pr.value}{PR_UNIT[pr.pr_type] ?? ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {instructions.length > 0 && (
                    <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                        <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>
                            Instructions
                        </h2>
                        <ol style={{ paddingLeft: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {instructions.map((step, i) => (
                                <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Tips */}
                {tips.length > 0 && (
                    <div className="glass" style={{ padding: 'var(--spacing-md)' }}>
                        <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>
                            Tips
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {tips.map((tip, i) => (
                                <div key={i} style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: '1.6',
                                    paddingLeft: 'var(--spacing-md)',
                                    borderLeft: '2px solid rgba(151,125,255,0.4)',
                                }}>
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}