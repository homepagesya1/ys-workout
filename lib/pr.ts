import type { PRType } from '@/types'

export interface SetValues {
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
  distance_km: number | null
}

// Berechne PR-Kandidaten für ein Set
export function getPRCandidates(set: SetValues): { type: PRType; value: number }[] {
  const candidates: { type: PRType; value: number }[] = []

  if (set.weight_kg && set.weight_kg > 0) {
    candidates.push({ type: 'max_weight', value: set.weight_kg })
  }
  if (set.reps && set.reps > 0) {
    candidates.push({ type: 'max_reps', value: set.reps })
  }
  if (set.duration_seconds && set.duration_seconds > 0) {
    candidates.push({ type: 'max_duration', value: set.duration_seconds })
  }
  if (set.distance_km && set.distance_km > 0) {
    candidates.push({ type: 'max_distance', value: set.distance_km })
  }

  return candidates
}

// Prüfe ob ein Wert ein neuer PR ist
// existingPRs = bisherige PRs aus der DB (aus vergangenen Workouts)
export function isNewPR(
  type: PRType,
  value: number,
  existingPRs: { pr_type: string; value: number }[]
): boolean {
  if (!existingPRs || existingPRs.length === 0) return false

  const existing = existingPRs.find(pr => pr.pr_type === type)
  if (!existing) return false

  // Nur PR wenn Wert STRIKT grösser als bisheriger Bestwert
  return value > existing.value
}