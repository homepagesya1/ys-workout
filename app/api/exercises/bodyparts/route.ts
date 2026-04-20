import { NextResponse } from 'next/server'
import { getBodyParts } from '@/lib/exercisedb'

export async function GET() {
  try {
    const data = await getBodyParts()
    return NextResponse.json(data)
  } catch (err) {
    console.error('bodyparts route error:', err)
    return NextResponse.json([], { status: 500 })
  }
}