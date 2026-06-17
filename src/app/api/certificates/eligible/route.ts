import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  const contentId = request.nextUrl.searchParams.get('content_id')
  if (!wallet || !contentId) return NextResponse.json({ eligible: false })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Must have purchased the content (purchases table uses user_wallet)
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .ilike('user_wallet', wallet)
    .eq('content_id', contentId)
    .maybeSingle()

  if (!purchase) return NextResponse.json({ eligible: false, already_minted: false, certificate: null })

  // Look up profile for user_id-based certificate check
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()

  const existing = profile
    ? (await supabase
        .from('certificates')
        .select('id, token_id, tx_hash, content_title, minted_at')
        .eq('user_id', profile.id)
        .eq('content_id', contentId)
        .maybeSingle()).data
    : null

  return NextResponse.json({
    eligible: !!purchase && !existing,
    already_minted: !!existing,
    certificate: existing ?? null,
  })
}
