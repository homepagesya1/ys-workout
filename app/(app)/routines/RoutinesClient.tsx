'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import ActiveWorkoutBanner from '@/components/ui/ActiveWorkoutBanner'

interface RoutineWithCount extends Routine {
    routine_exercises: { count: number }[]
}

function getTodayTitle() {
    return `Workout ${new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
}

export default function RoutinesClient({ routines }: { routines: RoutineWithCount[] }) {
    const router = useRouter()
    const [showNewModal, setShowNewModal] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [menuOpen, setMenuOpen] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function startEmptyWorkout() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: session } = await supabase
            .from('workout_sessions')
            .insert({ user_id: user.id, title: getTodayTitle(), status: 'active' })
            .select()
            .single()

        if (session) router.push(`/workout?session=${session.id}`)
    }

    async function startRoutine(routine: RoutineWithCount) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: routineExercises } = await supabase
            .from('routine_exercises')
            .select(`*, routine_sets(*)`)
            .eq('routine_id', routine.id)
            .order('position')

        const { data: session } = await supabase
            .from('workout_sessions')
            .insert({ user_id: user.id, routine_id: routine.id, title: routine.title, status: 'active' })
            .select()
            .single()

        if (!session) return

        if (routineExercises && routineExercises.length > 0) {
            for (const re of routineExercises) {
                const { data: workoutEx } = await supabase
                    .from('workout_exercises')
                    .insert({ workout_session_id: session.id, exercise_id: re.exercise_id, position: re.position, superset_group: re.superset_group })
                    .select()
                    .single()

                if (!workoutEx) continue

                const sets = re.routine_sets ?? []
                if (sets.length > 0) {
                    await supabase.from('sets').insert(
                        sets.sort((a: any, b: any) => a.set_number - b.set_number).map((s: any) => ({
                            workout_session_id: session.id,
                            workout_exercise_id: workoutEx.id,
                            set_number: s.set_number,
                            weight_kg: s.weight_kg,
                            reps: s.reps,
                        }))
                    )
                } else {
                    await supabase.from('sets').insert(
                        [1, 2, 3].map(n => ({
                            workout_session_id: session.id,
                            workout_exercise_id: workoutEx.id,
                            set_number: n,
                            weight_kg: null,
                            reps: null,
                        }))
                    )
                }
            }
        }

        router.push(`/workout?session=${session.id}`)
    }

    async function createRoutine() {
        if (!newTitle.trim()) return
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('routines').insert({
            user_id: user.id,
            title: newTitle.trim(),
            description: newDesc.trim() || null,
        })

        setNewTitle('')
        setNewDesc('')
        setShowNewModal(false)
        setLoading(false)
        router.refresh()
    }

    async function deleteRoutine(id: string) {
        const supabase = createClient()
        await supabase.from('routines').delete().eq('id', id)
        setMenuOpen(null)
        router.refresh()
    }

    return (
        <main style={{ padding: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>Routines</h1>
            </div>

            <button
                onClick={startEmptyWorkout}
                style={{ width: '100%', padding: 'var(--spacing-md)', background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)', borderRadius: 'var(--radius-main)', color: 'var(--color-primary)', fontSize: 'var(--font-size-md)', fontWeight: '600', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}
            >
                <span style={{ fontSize: '18px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" ><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></span>
                Start Empty Workout
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {routines.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
                        No routines yet. Create your first one!
                    </div>
                )}

                {routines.map(routine => (
                    <div key={routine.id} className="glass" style={{ padding: 'var(--spacing-md)', position: 'relative', cursor: 'pointer' }}>
                        <button
                            onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === routine.id ? null : routine.id) }}
                            style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '18px', padding: '4px', lineHeight: 1 }}
                        >···</button>

                        {menuOpen === routine.id && (
                            <div style={{ position: 'absolute', top: '40px', right: 'var(--spacing-md)', background: 'var(--color-card)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 'var(--radius-main)', overflow: 'hidden', zIndex: 10, minWidth: '160px', boxShadow: 'var(--shadow-card)' }}>
                                <button onClick={() => { router.push(`/routines/${routine.id}/edit`); setMenuOpen(null) }} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'none', border: 'none', color: 'var(--color-text)', textAlign: 'left', fontSize: 'var(--font-size-base)', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)' }}>Edit</button>
                                <button onClick={() => deleteRoutine(routine.id)} style={{ width: '100%', padding: 'var(--spacing-md)', background: 'none', border: 'none', color: 'var(--color-danger)', textAlign: 'left', fontSize: 'var(--font-size-base)' }}>Delete</button>
                            </div>
                        )}

                        <div onClick={() => startRoutine(routine)}>
                            <h2 style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-xs)', paddingRight: '32px' }}>{routine.title}</h2>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: routine.description ? 'var(--spacing-xs)' : 0 }}>
                                {routine.routine_exercises[0]?.count ?? 0} exercises
                            </p>
                            {routine.description && (
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', opacity: 0.8 }}>{routine.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowNewModal(true)}
                style={{ position: 'fixed', bottom: '88px', right: 'var(--spacing-lg)', width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary)', border: 'none', padding: '0', margin: '0', display: 'grid', placeItems: 'center', boxShadow: `0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent)`, zIndex: 50, cursor: 'pointer' }}
            ><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button>

            {showNewModal && (
                <div onClick={() => setShowNewModal(false)} style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-bg) 60%, transparent)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
                    <div onClick={e => e.stopPropagation()} className="glass" style={{ width: '100%', padding: 'var(--spacing-lg)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <h2 style={{ fontWeight: '600', fontSize: 'var(--font-size-lg)' }}>New Routine</h2>
                        <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', paddingBottom: 'var(--spacing-sm)' }}>
                            <input placeholder="Routine title" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus style={{ fontSize: 'var(--font-size-md)' }} />
                        </div>
                        <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', paddingBottom: 'var(--spacing-sm)' }}>
                            <input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: 'var(--spacing-md)', background: 'color-mix(in srgb, var(--color-text) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)', borderRadius: 'var(--radius-full)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Cancel</button>
                            <button onClick={createRoutine} disabled={loading || !newTitle.trim()} style={{ flex: 2, padding: 'var(--spacing-md)', background: newTitle.trim() ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 30%, transparent)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '600', cursor: newTitle.trim() ? 'pointer' : 'not-allowed' }}>
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ActiveWorkoutBanner />
        </main>
    )
}