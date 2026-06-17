import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ referred_count: 0, earned: 0 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .ilike('referred_by', wallet)

  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('amount')
    .ilike('referrer_wallet', wallet)

  const earned = (rewards ?? []).reduce((sum, r) => sum + Number(r.amount ?? 0), 0)

  return NextResponse.json({ referred_count: count ?? 0, earned })
}
