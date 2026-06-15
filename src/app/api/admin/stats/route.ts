import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_WALLETS = [
  '0xe38a456433fff7814e40998cf0cbbbd2c885b513',
]

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet || !ADMIN_WALLETS.includes(wallet.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = serviceClient()

  try {
    const [profilesRes, purchasesRes, postsRes, booksRes, videosRes, musicRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, wallet_address, role, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('purchases').select('id, user_wallet, content_type, amount, purchased_at, tx_hash').order('purchased_at', { ascending: false }).limit(100),
      supabase.from('posts').select('id, title, author_id, price, published, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('books').select('id, title, tutor_id, price, published, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('videos').select('id, title, creator_id, price, published, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('music').select('id, title, creator_id, price, published, created_at').order('created_at', { ascending: false }).limit(50),
    ])

    const profiles = profilesRes.data ?? []
    const purchases = purchasesRes.data ?? []

    // Build profile lookup
    const profileMap: Record<string, string> = {}
    for (const p of profiles) profileMap[p.id] = p.full_name ?? 'Unknown'

    // Combine content
    const allContent = [
      ...(postsRes.data ?? []).map((p) => ({ ...p, type: 'post', creator_name: profileMap[p.author_id] ?? 'Unknown' })),
      ...(booksRes.data ?? []).map((b) => ({ ...b, type: 'book', creator_name: profileMap[b.tutor_id] ?? 'Unknown' })),
      ...(videosRes.data ?? []).map((v) => ({ ...v, type: 'video', creator_name: profileMap[v.creator_id] ?? 'Unknown' })),
      ...(musicRes.data ?? []).map((m) => ({ ...m, type: 'music', creator_name: profileMap[m.creator_id] ?? 'Unknown' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

    return NextResponse.json({
      data: {
        stats: {
          total_users: profiles.length,
          total_content: allContent.length,
          total_purchases: purchases.length,
          total_revenue: totalRevenue,
        },
        users: profiles,
        content: allContent.slice(0, 100),
        purchases: purchases,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
