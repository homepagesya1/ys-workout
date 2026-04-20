import { getExerciseById } from './exercisedb'

export async function loadEDBDataForExercises<T extends {
  exercise_id?: string
  exercises?: { external_id?: string | null } | null
  edbData?: any
}>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async item => {
      if (item.edbData) return item
      const externalId = item.exercises?.external_id
      if (!externalId) return item
      try {
        const data = await getExerciseById(externalId)
        if (data) {
          return {
            ...item,
            edbData: {
              exerciseId: data.id,
              name: data.name,
              imageUrl: data.image_url,
              targetMuscles: data.primary_muscles,
              bodyParts: data.primary_muscles,
              equipments: data.equipment ? [data.equipment] : [],
              instructions: data.instructions,
            }
          }
        }
      } catch (err) {
        console.error('loadEDBDataForExercises error:', err)
      }
      return item
    })
  )
}