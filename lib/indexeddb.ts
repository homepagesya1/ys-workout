import { openDB } from 'idb'
import type { ActiveWorkout } from '@/types'

const DB_NAME = 'ys-workout'
const DB_VERSION = 1

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('active-workout')) {
        db.createObjectStore('active-workout', { keyPath: 'sessionId' })
      }
      if (!db.objectStoreNames.contains('exercise-cache')) {
        db.createObjectStore('exercise-cache', { keyPath: 'exerciseId' })
      }
    },
  })
}

// Aktives Workout speichern
export async function saveActiveWorkout(workout: ActiveWorkout) {
  const db = await getDB()
  await db.put('active-workout', workout)
}

// Aktives Workout laden
export async function getActiveWorkout(sessionId: string): Promise<ActiveWorkout | undefined> {
  const db = await getDB()
  return db.get('active-workout', sessionId)
}

// Aktives Workout löschen
export async function deleteActiveWorkout(sessionId: string) {
  const db = await getDB()
  await db.delete('active-workout', sessionId)
}

// Alle aktiven Workouts (für Wiederherstellung)
export async function getAllActiveWorkouts(): Promise<ActiveWorkout[]> {
  const db = await getDB()
  return db.getAll('active-workout')
}

// Exercise cachen
export async function cacheExercise(exercise: { exerciseId: string;[key: string]: unknown }) {
  const db = await getDB()
  await db.put('exercise-cache', exercise)
}

// Exercise aus Cache holen
export async function getCachedExercise(exerciseId: string) {
  const db = await getDB()
  return db.get('exercise-cache', exerciseId)
}

// Mehrere Exercises cachen
export async function cacheExercises(exercises: { exerciseId: string;[key: string]: unknown }[]) {
  const db = await getDB()
  const tx = db.transaction('exercise-cache', 'readwrite')
  await Promise.all(exercises.map(ex => tx.store.put(ex)))
  await tx.done
}

// Exercise Cache leeren (nach Workout Ende)
export async function clearExerciseCache() {
  const db = await getDB()
  await db.clear('exercise-cache')
}