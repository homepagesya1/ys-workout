import { createClient } from '@supabase/supabase-js'

export const exerciseDb = createClient(
  process.env.NEXT_PUBLIC_EXERCISE_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_EXERCISE_SUPABASE_ANON_KEY!
)