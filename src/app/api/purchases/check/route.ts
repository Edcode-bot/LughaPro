import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-service-role'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get('content_id')
  const wallet = (
    request.headers.get('x-wallet-address') ??
    searchParams.get('wallet')
  )?.toLowerCase()

  if (!contentId || !wallet) {
    return NextResponse.json({ purchased: false })
  }

  try {
    const supabase = createServiceRoleClient()

    // Query directly by user_wallet — fastest path, no profile lookup needed
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id, tx_hash, payment_method, purchased_at')
      .eq('user_wallet', wallet)
      .eq('content_id', contentId)
      .maybeSingle()

    return NextResponse.json({
      purchased: !!purchase,
      tx_hash: purchase?.tx_hash ?? null,
      payment_method: purchase?.payment_method ?? null,
      purchased_at: purchase?.purchased_at ?? null,
    })
  } catch {
    return NextResponse.json({ purchased: false })
  }
}
