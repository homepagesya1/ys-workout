import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { clientRowId, clientId } = await req.json()
  if (!clientRowId || !clientId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { error: tcError } = await admin
    .from('trainer_clients')
    .update({ status: 'active' })
    .eq('id', clientRowId)
    .eq('trainer_id', user.id)

  if (tcError) return NextResponse.json({ error: tcError.message }, { status: 500 })

  const { error: profileError } = await admin
    .from('profiles')
    .update({ has_coach: true })
    .eq('id', clientId)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
