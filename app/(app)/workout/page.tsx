import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutClient from './WorkoutClient'

export default async function WorkoutPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { session: sessionId } = await searchParams
    if (!sessionId) redirect('/routines')

    const { data: session } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

    if (!session) redirect('/routines')

    const { data: workoutExercises } = await supabase
        .from('workout_exercises')
        .select(`*, exercises(id, external_id, name, source)`)
        .eq('workout_session_id', sessionId)
        .order('position')

    const { data: sets } = await supabase
        .from('sets')
        .select('*')
        .eq('workout_session_id', sessionId)
        .order('set_number')

    const exerciseIds = workoutExercises?.map(we => we.exercise_id) ?? []

    const { data: existingPRs } = exerciseIds.length > 0
        ? await supabase
            .from('personal_records')
            .select('exercise_id, pr_type, value')
            .eq('user_id', user.id)
            .in('exercise_id', exerciseIds)
            .neq('workout_session_id', sessionId)
        : { data: [] }

    // ── Vorherige Sets für "Zuvor"-Spalte ────────────────────────────────────
    // Für jede Übung: die Sets aus dem letzten abgeschlossenen Workout holen
    type PrevSet = { weight_kg: number | null; reps: number | null; set_number: number }
    const previousSets: Record<string, PrevSet[]> = {}

    if (exerciseIds.length > 0) {
        const { data: prevData } = await supabase
            .from('workout_exercises')
            .select(`
                exercise_id,
                sets(weight_kg, reps, set_number),
                workout_sessions!inner(finished_at, status, user_id)
            `)
            .eq('workout_sessions.user_id', user.id)
            .eq('workout_sessions.status', 'finished')
            .neq('workout_session_id', sessionId)
            .in('exercise_id', exerciseIds)
            .order('workout_sessions(finished_at)', { ascending: false })

        // Pro exercise_id nur den ersten (neusten) Eintrag nehmen
        if (prevData) {
            for (const we of prevData) {
                if (!previousSets[we.exercise_id] && (we.sets as any[])?.length > 0) {
                    previousSets[we.exercise_id] = (we.sets as any[])
                        .sort((a, b) => a.set_number - b.set_number)
                }
            }
        }
    }

    return (
        <WorkoutClient
            session={session}
            initialExercises={workoutExercises ?? []}
            initialSets={sets ?? []}
            existingPRs={existingPRs ?? []}
            previousSets={previousSets}
        />
    )
}