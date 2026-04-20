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
        .select(`
      *,
      exercises(id, external_id, name, source)
    `)
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
            .neq('workout_session_id', sessionId) // ← aktuelle Session ausschliessen
        : { data: [] }

    return (
        <WorkoutClient
            session={session}
            initialExercises={workoutExercises ?? []}
            initialSets={sets ?? []}
            existingPRs={existingPRs ?? []}
        />
    )
}