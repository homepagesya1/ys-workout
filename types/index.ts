export type ExerciseSource = 'exercisedb' | 'custom'
export type WorkoutStatus = 'active' | 'paused' | 'finished' | 'deleted'
export type PRType = 'max_weight' | 'max_reps' | 'max_duration' | 'max_distance'
export type CoachLang = 'en' | 'de'
export type UserRole = 'user' | 'trainer'
export type WorkoutSource = 'own' | 'coach'
export type ExerciseTypeName =
  | 'Weight & Reps'
  | 'Bodyweight Reps'
  | 'Weighted Bodyweight'
  | 'Assisted Bodyweight'
  | 'Duration'
  | 'Duration & Weight'
  | 'Distance & Duration'
  | 'Weight & Distance'

export interface EDBExercise {
  exerciseId: string
  name: string
  imageUrl: string
  videoUrl: string
  bodyParts: string[]
  targetMuscles: string[]
  secondaryMuscles: string[]
  equipments: string[]
  exerciseType: string
  overview: string
  instructions: string[]
  exerciseTips: string[]
  variations: string[]
  relatedExerciseIds: string[]
  keywords: string[]
  gender: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  is_approved: boolean
  role?: UserRole
  has_coach?: boolean
  coach_lang?: CoachLang
  created_at: string
  updated_at: string
}

export interface Routine {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  routine_id: string | null
  title: string
  status: WorkoutStatus
  started_at: string
  finished_at: string | null
  duration_seconds: number | null
  total_volume_kg: number | null
  total_sets: number | null
  source?: WorkoutSource
  plan_id?: string | null
  exercises_added?: string[]
  exercises_removed?: string[]
  created_at: string
  updated_at: string
}

export interface WorkoutSet {
  id: string
  workout_session_id: string
  workout_exercise_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
  distance_km: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  workout_session_id: string
  set_id: string
  pr_type: PRType
  value: number
  created_at: string
}

export interface ActiveExercise {
  workoutExerciseId: string
  exerciseId: string
  source: ExerciseSource
  position: number
  supersetGroup: string | null
  sets: WorkoutSet[]
  edbData?: EDBExercise
}

export interface ActiveWorkout {
  sessionId: string
  title: string
  startedAt: string
  exercises: ActiveExercise[]
}

// Notes per user per exercise — stored in main Supabase DB
export interface ExerciseNote {
  id: string
  user_id: string
  exercise_id: string
  note: string
  updated_at: string
}

// ─── Coach / Trainer ─────────────────────────────────────────────────────────

export interface TrainerClient {
  id: string
  trainer_id: string
  client_id: string
  status: 'pending' | 'active'
  created_at: string
  profiles?: { display_name: string; email: string; avatar_url: string | null }
}

export interface ClientFolder {
  id: string
  trainer_id: string
  client_id: string
  name: string
  created_at: string
}

export interface TrainerPlanExercise {
  id: string
  exerciseId: string
  name: string
  source: ExerciseSource
  sets: number
  reps: number
  weight: number | null
  notes: string
}

export interface TrainingPlan {
  id: string
  trainer_id: string
  folder_id: string
  name: string
  exercises: TrainerPlanExercise[]
  created_at: string
  updated_at: string
  client_folders?: ClientFolder
}

export interface PlanShare {
  id: string
  plan_id: string
  client_id: string
  shared_at: string
  training_plans?: TrainingPlan & { client_folders?: ClientFolder }
}