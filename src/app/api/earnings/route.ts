import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  if (auth.profile.role !== 'tutor' && auth.profile.role !== 'admin') {
    return jsonError('Only creators can access earnings', 403)
  }

  try {
    const [{ data: books }, { data: posts }] = await Promise.all([
      supabaseAdmin.from('books').select('id, title').eq('author_id', auth.profile.id),
      supabaseAdmin.from('posts').select('id, title').eq('author_id', auth.profile.id),
    ])

    const contentMap = new Map<string, { title: string; type: string }>()
    for (const book of books ?? []) contentMap.set(book.id, { title: book.title, type: 'book' })
    for (const post of posts ?? []) contentMap.set(post.id, { title: post.title, type: 'post' })

    const contentIds = [...contentMap.keys()]
    if (contentIds.length === 0) {
      return jsonOk({ total_earned: 0, monthly: [], recent: [] }, 'Earnings loaded')
    }

    const { data: purchases } = await supabaseAdmin
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
      buyer_wallet: row.user_wallet,
      content_title: contentMap.get(row.content_id)?.title ?? 'Content',
      amount: Number(row.amount ?? 0),
      purchased_at: row.purchased_at,
    }))

    return jsonOk({ total_earned: Number(totalEarned.toFixed(2)), monthly, recent }, 'Earnings loaded')
  } catch {
    return jsonOk({ total_earned: 0, monthly: [], recent: [] }, 'Earnings loaded')
  }
}
