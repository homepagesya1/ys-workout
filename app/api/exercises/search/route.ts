import { NextRequest, NextResponse } from 'next/server'
import { searchExercises } from '@/lib/exercisedb'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  if (!query) return NextResponse.json([])

  try {
    const data = await searchExercises(query)
    // Format anpassen damit bestehender Code funktioniert
    const formatted = data.map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      imageUrl: ex.image_url,
      imageUrl2: ex.image_url_2,   // ← diese Zeile hinzufügen
      targetMuscles: ex.primary_muscles,
      bodyParts: ex.primary_muscles,
      equipments: ex.equipment ? [ex.equipment] : [],
      instructions: ex.instructions,
    }))
    return NextResponse.json(formatted)
  } catch (err) {
    console.error('search route error:', err)
    return NextResponse.json([], { status: 500 })
  }
}