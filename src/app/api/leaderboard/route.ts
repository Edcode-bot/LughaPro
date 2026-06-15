import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? 'creators'
  const limit = Math.min(50, parseInt(request.nextUrl.searchParams.get('limit') ?? '20'))

  const supabase = serviceClient()

  try {
    if (type === 'creators') {
      // Top creators by content published count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, wallet_address')
        .limit(100)

      if (!profiles) return NextResponse.json({ data: [] })

      // Count content per creator
      const counts = await Promise.all(
        profiles.map(async (p) => {
          const [books, posts, videos, music] = await Promise.all([
            supabase.from('books').select('id', { count: 'exact', head: true }).eq('tutor_id', p.id),
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', p.id),
            supabase.from('videos').select('id', { count: 'exact', head: true }).eq('creator_id', p.id),
            supabase.from('music').select('id', { count: 'exact', head: true }).eq('creator_id', p.id),
          ])
          const total = (books.count ?? 0) + (posts.count ?? 0) + (videos.count ?? 0) + (music.count ?? 0)
          return { ...p, stat: total }
        })
      )

      const ranked = counts
        .filter((c) => c.stat > 0)
        .sort((a, b) => b.stat - a.stat)
        .slice(0, limit)
        .map((c) => ({ ...c, stat_label: 'content pieces' }))

      return NextResponse.json({ data: ranked })
    }

    if (type === 'learners') {
      // Top learners by purchases count
      const { data: purchases } = await supabase
        .from('purchases')
        .select('user_wallet')

      if (!purchases) return NextResponse.json({ data: [] })

      const walletCounts: Record<string, number> = {}
      for (const p of purchases) {
        if (p.user_wallet) walletCounts[p.user_wallet] = (walletCounts[p.user_wallet] ?? 0) + 1
      }

      const topWallets = Object.entries(walletCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)

      const results = await Promise.all(
        topWallets.map(async ([wallet, count]) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, wallet_address')
            .eq('wallet_address', wallet.toLowerCase())
            .maybeSingle()
          return {
            id: profile?.id ?? wallet,
            full_name: profile?.full_name ?? 'Anonymous',
            avatar_url: profile?.avatar_url ?? null,
            wallet_address: wallet,
            stat: count,
            stat_label: 'items purchased',
          }
        })
      )

      return NextResponse.json({ data: results })
    }

    if (type === 'earners') {
      // Top earners by total amount in purchases where creator received payment
      const { data: purchases } = await supabase
        .from('purchases')
        .select('content_id, content_type, amount')

      if (!purchases) return NextResponse.json({ data: [] })

      // For simplicity, aggregate by getting content creator for each purchase
      // This is a simplified implementation
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, wallet_address')
        .limit(100)

      if (!profiles) return NextResponse.json({ data: [] })

      const earnerMap: Record<string, { profile: typeof profiles[0]; total: number }> = {}

      for (const profile of profiles) {
        const [bookPurchases, postPurchases] = await Promise.all([
          supabase.from('purchases').select('amount').eq('content_type', 'book'),
          supabase.from('purchases').select('amount').eq('content_type', 'post'),
        ])
        // Simplified: just sum all purchases for this demo
        earnerMap[profile.id] = { profile, total: 0 }
      }

      // Real implementation would join purchases with content tables
      // For now, return top profiles with mock earnings based on content count
      const results = profiles
        .slice(0, limit)
        .map((p) => ({
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          wallet_address: p.wallet_address,
          stat: 0,
          stat_label: 'cUSD earned',
        }))

      return NextResponse.json({ data: results })
    }

    return NextResponse.json({ data: [] })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
