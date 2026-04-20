'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface EDBExercise {
    exerciseId: string
    name: string
    imageUrl: string
    targetMuscles: string[]
    bodyParts: string[]
    equipments: string[]
}

interface Props {
    onAdd: (exercise: EDBExercise) => void
    onClose: () => void
}

export default function AddExerciseModal({ onAdd, onClose }: Props) {
    const [exercises, setExercises] = useState<EDBExercise[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<EDBExercise[]>([])
    const [searching, setSearching] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [bodyParts, setBodyParts] = useState<string[]>([])
    const [equipments, setEquipments] = useState<string[]>([])
    const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null)
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
    const [showBodyPartFilter, setShowBodyPartFilter] = useState(false)
    const [showEquipmentFilter, setShowEquipmentFilter] = useState(false)
    const listRef = useRef<HTMLDivElement>(null)
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        fetch('/api/exercises/filters')
            .then(r => r.json())
            .then(data => {
                const bpList = data.bodyParts.map((bp: any) =>
                    typeof bp === 'string' ? bp : bp.name ?? bp
                ).sort()
                const eqList = data.equipments.map((eq: any) =>
                    typeof eq === 'string' ? eq : eq.name ?? eq
                ).sort()
                setBodyParts(bpList)
                setEquipments(eqList)
            })
    }, [])

    const loadExercises = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true)
            setExercises([])
            setCursor(null)
        } else {
            setLoadingMore(true)
        }

        const params = new URLSearchParams()
        if (!reset && cursor) params.set('cursor', cursor)
        if (selectedBodyPart) params.set('bodyPart', selectedBodyPart)
        if (selectedEquipment) params.set('equipment', selectedEquipment)

        try {
            const res = await fetch(`/api/exercises/list?${params}`)
            const json = await res.json()
            setExercises(prev => reset ? json.data : [...prev, ...json.data])
            setHasMore(json.meta.hasNextPage)
            setCursor(json.meta.nextCursor ?? null)
        } catch { }

        setLoading(false)
        setLoadingMore(false)
    }, [cursor, selectedBodyPart, selectedEquipment])

    useEffect(() => {
        loadExercises(true)
    }, [selectedBodyPart, selectedEquipment])

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        if (!searchQuery.trim()) { setSearchResults([]); return }

        searchTimeout.current = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await res.json()
                setSearchResults(data.slice(0, 50))
            } catch { }
            setSearching(false)
        }, 400)
    }, [searchQuery])

    const handleScroll = useCallback(() => {
        if (!listRef.current || loadingMore || !hasMore || searchQuery) return
        const { scrollTop, scrollHeight, clientHeight } = listRef.current
        if (scrollHeight - scrollTop - clientHeight < 200) {
            loadExercises(false)
        }
    }, [loadingMore, hasMore, searchQuery, loadExercises])

    function groupByLetter(list: EDBExercise[]) {
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
        const groups: { letter: string; items: EDBExercise[] }[] = []
        let currentLetter = ''

        for (const ex of sorted) {
            const letter = ex.name[0].toUpperCase()
            if (letter !== currentLetter) {
                currentLetter = letter
                groups.push({ letter, items: [] })
            }
            groups[groups.length - 1].items.push(ex)
        }
        return groups
    }

    const displayList = searchQuery ? searchResults : exercises
    const groups = groupByLetter(displayList)

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
            display: 'flex', flexDirection: 'column',
            zIndex: 200,
        }}>
            <div style={{
                flex: 1, marginTop: '60px',
                background: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                borderRadius: 'var(--radius-main)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--spacing-md)',
                    borderBottom: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)',
                }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500', fontSize: 'var(--font-size-base)' }}>
                        Cancel
                    </button>
                    <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>Add Exercise</span>
                    <div style={{ width: '60px' }} />
                </div>

                {/* Search */}
                <div style={{ padding: 'var(--spacing-md)', paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)' }}>
                    <div style={{
                        display: 'flex',
                        background: 'color-mix(in srgb, var(--color-text) 7%, transparent)',
                        borderRadius: 'var(--radius-full)', padding: '10px var(--spacing-md)',
                        gap: 'var(--spacing-sm)', alignItems: 'center',
                        border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
                    }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>🔍</span>
                        <input
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                            style={{ fontSize: 'var(--font-size-base)', flex: 1 }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', padding: 0 }}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div style={{
                    display: 'flex', gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    borderBottom: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)',
                    position: 'relative',
                }}>
                    {/* Body Part Filter */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <button
                            onClick={() => { setShowBodyPartFilter(!showBodyPartFilter); setShowEquipmentFilter(false) }}
                            style={{
                                width: '100%', padding: '8px 12px',
                                background: selectedBodyPart
                                    ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)'
                                    : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                                border: selectedBodyPart
                                    ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)'
                                    : '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
                                borderRadius: 'var(--radius-full)',
                                color: selectedBodyPart ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-sm)', fontWeight: '500',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}
                        >
                            💪 {selectedBodyPart ?? 'Body Part'}
                            {selectedBodyPart && (
                                <span
                                    onClick={e => { e.stopPropagation(); setSelectedBodyPart(null) }}
                                    style={{ marginLeft: '4px', opacity: 0.7 }}
                                >✕</span>
                            )}
                        </button>

                        {showBodyPartFilter && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'color-mix(in srgb, var(--color-bg) 98%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                                borderRadius: 'var(--radius-main)',
                                maxHeight: '200px', overflowY: 'auto',
                                zIndex: 10, marginTop: '4px',
                                boxShadow: '0 8px 32px color-mix(in srgb, var(--color-bg) 40%, transparent)',
                            }}>
                                {bodyParts.map(bp => (
                                    <button
                                        key={bp}
                                        onClick={() => { setSelectedBodyPart(bp); setShowBodyPartFilter(false) }}
                                        style={{
                                            width: '100%', padding: '10px var(--spacing-md)',
                                            background: selectedBodyPart === bp
                                                ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                                                : 'none',
                                            border: 'none',
                                            borderBottom: '1px solid color-mix(in srgb, var(--color-text) 4%, transparent)',
                                            color: selectedBodyPart === bp ? 'var(--color-primary)' : 'var(--color-text)',
                                            textAlign: 'left', fontSize: 'var(--font-size-sm)',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {bp}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Equipment Filter */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <button
                            onClick={() => { setShowEquipmentFilter(!showEquipmentFilter); setShowBodyPartFilter(false) }}
                            style={{
                                width: '100%', padding: '8px 12px',
                                background: selectedEquipment
                                    ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)'
                                    : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                                border: selectedEquipment
                                    ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)'
                                    : '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
                                borderRadius: 'var(--radius-full)',
                                color: selectedEquipment ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-sm)', fontWeight: '500',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}
                        >
                            🏋️ {selectedEquipment ?? 'Equipment'}
                            {selectedEquipment && (
                                <span
                                    onClick={e => { e.stopPropagation(); setSelectedEquipment(null) }}
                                    style={{ marginLeft: '4px', opacity: 0.7 }}
                                >✕</span>
                            )}
                        </button>

                        {showEquipmentFilter && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'color-mix(in srgb, var(--color-bg) 98%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                                borderRadius: 'var(--radius-main)',
                                maxHeight: '200px', overflowY: 'auto',
                                zIndex: 10, marginTop: '4px',
                                boxShadow: '0 8px 32px color-mix(in srgb, var(--color-bg) 40%, transparent)',
                            }}>
                                {equipments.map(eq => (
                                    <button
                                        key={eq}
                                        onClick={() => { setSelectedEquipment(eq); setShowEquipmentFilter(false) }}
                                        style={{
                                            width: '100%', padding: '10px var(--spacing-md)',
                                            background: selectedEquipment === eq
                                                ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                                                : 'none',
                                            border: 'none',
                                            borderBottom: '1px solid color-mix(in srgb, var(--color-text) 4%, transparent)',
                                            color: selectedEquipment === eq ? 'var(--color-primary)' : 'var(--color-text)',
                                            textAlign: 'left', fontSize: 'var(--font-size-sm)',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {eq}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div
                    ref={listRef}
                    onScroll={handleScroll}
                    style={{ flex: 1, overflowY: 'auto' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                            Loading exercises...
                        </div>
                    ) : searching ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                            Searching...
                        </div>
                    ) : groups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                            No exercises found
                        </div>
                    ) : (
                        <>
                            {groups.map(group => (
                                <div key={group.letter}>
                                    {/* Buchstaben Header */}
                                    <div style={{
                                        padding: '6px var(--spacing-md)',
                                        background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                                        borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                        borderTop: '1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                        position: 'sticky', top: 0,
                                        zIndex: 2,
                                    }}>
                                        <span style={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: '700',
                                            color: 'var(--color-primary)',
                                        }}>
                                            {group.letter}
                                        </span>
                                    </div>

                                    {/* Exercises in dieser Gruppe */}
                                    {group.items.map(ex => (
                                        <button
                                            key={ex.exerciseId}
                                            onClick={() => onAdd(ex)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                gap: 'var(--spacing-md)', padding: 'var(--spacing-md)',
                                                background: 'none', border: 'none',
                                                borderBottom: '1px solid color-mix(in srgb, var(--color-text) 4%, transparent)',
                                                color: 'var(--color-text)', textAlign: 'left', cursor: 'pointer',
                                            }}
                                        >
                                            {ex.imageUrl ? (
                                                <img
                                                    src={ex.imageUrl}
                                                    alt={ex.name}
                                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '8px',
                                                    background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '20px', flexShrink: 0,
                                                }}>
                                                    💪
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '500', fontSize: 'var(--font-size-base)',
                                                    textTransform: 'capitalize',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {ex.name}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                                                    {ex.targetMuscles?.[0] ?? ex.bodyParts?.[0] ?? ''}
                                                    {ex.equipments?.[0] ? ` · ${ex.equipments[0]}` : ''}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {loadingMore && (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    Loading more...
                                </div>
                            )}
                            {!hasMore && !searchQuery && (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    All exercises loaded
                                </div>
                            )}

                            {!searchQuery && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'var(--spacing-md)',
                                    color: 'var(--color-text-secondary)',
                                    fontSize: 'var(--font-size-sm)',
                                    borderTop: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)',
                                }}>
                                    {exercises.length} exercises loaded
                                    {hasMore ? ' · scroll for more' : ' · all loaded'}
                                </div>
                            )}
                            {searchQuery && searchResults.length > 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'var(--spacing-md)',
                                    color: 'var(--color-text-secondary)',
                                    fontSize: 'var(--font-size-sm)',
                                    borderTop: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)',
                                }}>
                                    {searchResults.length} results
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}