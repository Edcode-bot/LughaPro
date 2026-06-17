import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ data: [] })

  const supabase = client()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()
  if (!profile) return NextResponse.json({ data: [] })

  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', profile.id)
    .order('minted_at', { ascending: false })

  return NextResponse.json({ data: data ?? [] })
}
