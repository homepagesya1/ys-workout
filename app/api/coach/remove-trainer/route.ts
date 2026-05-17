import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { trainerId } = await req.json()
  if (!trainerId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { error: tcError } = await admin
    .from('trainer_clients')
    .update({ status: 'disconnected' })
    .eq('client_id', user.id)
    .eq('trainer_id', trainerId)

  if (tcError) return NextResponse.json({ error: tcError.message }, { status: 500 })

  const { error: profileError } = await admin
    .from('profiles')
    .update({ has_coach: false })
    .eq('id', user.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
