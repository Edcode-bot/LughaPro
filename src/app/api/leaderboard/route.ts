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
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, wallet_address')
        .limit(100)

      if (!profiles) return NextResponse.json({ data: [] })

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
      const { data: purchases } = await supabase
        .from('purchases')
        .select('user_wallet')

      if (!purchases) return NextResponse.json({ data: [] })

      // Normalise wallet addresses to lowercase for counting
      const walletCounts: Record<string, number> = {}
      for (const p of purchases) {
        if (p.user_wallet) {
          const key = p.user_wallet.toLowerCase()
          walletCounts[key] = (walletCounts[key] ?? 0) + 1
        }
      }

      const topWallets = Object.entries(walletCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)

      const results = await Promise.all(
        topWallets.map(async ([wallet, count]) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, wallet_address')
            .ilike('wallet_address', wallet)
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
      // Aggregate earnings per creator from purchases, joining through content tables
      const { data: purchases } = await supabase
        .from('purchases')
        .select('content_id, content_type, amount')

      if (!purchases || purchases.length === 0) return NextResponse.json({ data: [] })

      // Map content_id → creator_id by content_type
      const bookIds = purchases.filter(p => p.content_type === 'book').map(p => p.content_id)
      const postIds = purchases.filter(p => p.content_type === 'post').map(p => p.content_id)
      const videoIds = purchases.filter(p => p.content_type === 'video').map(p => p.content_id)
      const musicIds = purchases.filter(p => p.content_type === 'music').map(p => p.content_id)

      const [books, posts, videos, music] = await Promise.all([
        bookIds.length ? supabase.from('books').select('id, tutor_id').in('id', bookIds) : Promise.resolve({ data: [] }),
        postIds.length ? supabase.from('posts').select('id, author_id').in('id', postIds) : Promise.resolve({ data: [] }),
        videoIds.length ? supabase.from('videos').select('id, creator_id').in('id', videoIds) : Promise.resolve({ data: [] }),
        musicIds.length ? supabase.from('music').select('id, creator_id').in('id', musicIds) : Promise.resolve({ data: [] }),
      ])

      // Build content_id → creator_id map
      const creatorMap: Record<string, string> = {}
      for (const b of (books.data ?? [])) if (b.tutor_id) creatorMap[b.id] = b.tutor_id
      for (const p of (posts.data ?? [])) if (p.author_id) creatorMap[p.id] = p.author_id
      for (const v of (videos.data ?? [])) if (v.creator_id) creatorMap[v.id] = v.creator_id
      for (const m of (music.data ?? [])) if (m.creator_id) creatorMap[m.id] = m.creator_id

      // Sum amounts per creator
      const earnerTotals: Record<string, number> = {}
      for (const p of purchases) {
        const creatorId = creatorMap[p.content_id]
        if (creatorId) {
          earnerTotals[creatorId] = (earnerTotals[creatorId] ?? 0) + Number(p.amount ?? 0)
        }
      }

      const topEarners = Object.entries(earnerTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)

      if (topEarners.length === 0) return NextResponse.json({ data: [] })

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, wallet_address')
        .in('id', topEarners.map(([id]) => id))

      const profileMap: Record<string, typeof profiles extends (infer T)[] | null ? T : never> = {}
      for (const p of (profiles ?? [])) profileMap[p.id] = p

      const results = topEarners.map(([creatorId, total]) => {
        const profile = profileMap[creatorId]
        return {
          id: creatorId,
          full_name: profile?.full_name ?? 'Anonymous',
          avatar_url: profile?.avatar_url ?? null,
          wallet_address: profile?.wallet_address ?? null,
          stat: parseFloat(total.toFixed(2)),
          stat_label: 'cUSD earned',
        }
      })

      return NextResponse.json({ data: results })
    }

    return NextResponse.json({ data: [] })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
