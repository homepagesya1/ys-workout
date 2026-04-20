import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/exercisedb'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await getExerciseById(id)
    if (!data) return NextResponse.json(null, { status: 404 })

    // Format anpassen
    const formatted = {
      exerciseId: data.id,
      name: data.name,
      imageUrl: data.image_url,
      videoUrl: null,
      targetMuscles: data.primary_muscles,
      secondaryMuscles: data.secondary_muscles,
      bodyParts: data.primary_muscles,
      equipments: data.equipment ? [data.equipment] : [],
      exerciseType: data.category,
      overview: null,
      instructions: data.instructions,
      exerciseTips: [],
      variations: [],
      relatedExerciseIds: [],
      keywords: [],
      gender: 'male',
    }
    return NextResponse.json(formatted)
  } catch (err) {
    console.error('exercise detail route error:', err)
    return NextResponse.json(null, { status: 500 })
  }
}