import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { referrer_wallet?: string }
  const { referrer_wallet } = body
  if (!referrer_wallet || !referrer_wallet.startsWith('0x')) {
    return NextResponse.json({ error: 'Invalid referrer address' }, { status: 400 })
  }
  if (referrer_wallet.toLowerCase() === wallet.toLowerCase()) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, referred_by')
    .ilike('wallet_address', wallet)
    .maybeSingle()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.referred_by) return NextResponse.json({ error: 'Referral already applied' }, { status: 400 })

  await supabase
    .from('profiles')
    .update({ referred_by: referrer_wallet.toLowerCase() })
    .eq('id', profile.id)

  return NextResponse.json({ success: true })
}
