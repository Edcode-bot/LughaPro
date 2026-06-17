import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: NextRequest) {
  const creatorId = request.nextUrl.searchParams.get('creator_id')
  const wallet = request.headers.get('x-wallet-address')
  const supabase = client()

  const { count } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', creatorId)

  let isFollowing = false
  if (wallet) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('wallet_address', wallet)
      .maybeSingle()
    if (profile) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', profile.id)
        .eq('creator_id', creatorId)
        .maybeSingle()
      isFollowing = !!data
    }
  }

  return NextResponse.json({ follower_count: count ?? 0, is_following: isFollowing })
}

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = client()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json() as { creator_id?: string; action?: string }

  if (body.action === 'follow') {
    await supabase
      .from('follows')
      .upsert({ follower_id: profile.id, creator_id: body.creator_id }, { onConflict: 'follower_id,creator_id' })
  } else {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', profile.id)
      .eq('creator_id', body.creator_id)
  }

  return NextResponse.json({ success: true })
}
