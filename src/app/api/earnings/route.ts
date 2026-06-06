import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) {
    return NextResponse.json({ data: { total_earned: 0, monthly: [], recent: [] }, error: null })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Get profile by wallet
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', wallet.toLowerCase())
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ data: { total_earned: 0, monthly: [], recent: [] }, error: null })
  }

  // Get this creator's content IDs
  const { data: myBooks } = await supabase
    .from('books')
    .select('id, title')
    .eq('tutor_id', profile.id)

  const { data: myPosts } = await supabase
    .from('posts')
    .select('id, title')
    .eq('author_id', profile.id)

  const contentMap = new Map<string, { title: string; type: string }>()
  for (const book of myBooks ?? []) contentMap.set(book.id, { title: book.title, type: 'book' })
  for (const post of myPosts ?? []) contentMap.set(post.id, { title: post.title, type: 'post' })

  const contentIds = [...contentMap.keys()]
  if (contentIds.length === 0) {
    return NextResponse.json({ data: { total_earned: 0, monthly: [], recent: [] }, error: null })
  }

  // Get all purchases of this creator's content
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .in('content_id', contentIds)
    .order('purchased_at', { ascending: false })

  const rows = purchases ?? []
  const totalEarned = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0)

  const monthlyMap = new Map<string, { content_sold: number; amount_earned: number }>()
  for (const row of rows) {
    const month = new Date(row.purchased_at).toLocaleString('en', { month: 'short', year: 'numeric' })
    const current = monthlyMap.get(month) ?? { content_sold: 0, amount_earned: 0 }
    current.content_sold += 1
    current.amount_earned += Number(row.amount ?? 0)
    monthlyMap.set(month, current)
  }

  const monthly = [...monthlyMap.entries()].map(([month, stats]) => ({
    month,
    content_sold: stats.content_sold,
    amount_earned: Number(stats.amount_earned.toFixed(2)),
  }))

  const recent = rows.slice(0, 10).map((row) => ({
    buyer_wallet: row.user_wallet ?? '',
    content_title: contentMap.get(row.content_id)?.title ?? 'Content',
    amount: Number(row.amount ?? 0),
    purchased_at: row.purchased_at,
  }))

  return NextResponse.json({
    data: {
      total_earned: Number(totalEarned.toFixed(2)),
      monthly,
      recent,
    },
    error: null,
  })
}
