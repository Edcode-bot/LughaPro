import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { ContentType } from '@/types'

export async function GET(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  if (auth.profile.role !== 'tutor' && auth.profile.role !== 'admin') {
    return jsonError('Only creators can access students', 403)
  }

  try {
    const [{ data: books }, { data: posts }] = await Promise.all([
      supabaseAdmin.from('books').select('id, title').eq('tutor_id', auth.profile.id),
      supabaseAdmin.from('posts').select('id, title').eq('author_id', auth.profile.id),
    ])

    const titleMap = new Map<string, { title: string; type: ContentType }>()
    for (const book of books ?? []) titleMap.set(book.id, { title: book.title, type: 'book' })
    for (const post of posts ?? []) titleMap.set(post.id, { title: post.title, type: 'post' })

    const ids = [...titleMap.keys()]
    if (!ids.length) return jsonOk({ items: [], total: 0 }, 'Students loaded')

    const { data: purchases } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .in('content_id', ids)
      .order('purchased_at', { ascending: false })

    const items = (purchases ?? []).map((purchase) => {
      const meta = titleMap.get(purchase.content_id)
      return {
        wallet: purchase.user_wallet,
        content_title: meta?.title ?? 'Content',
        content_type: (meta?.type ?? purchase.content_type) as ContentType,
        amount: Number(purchase.amount ?? 0),
        purchased_at: purchase.purchased_at,
      }
    })

    const uniqueWallets = new Set(items.map((item) => item.wallet))
    return jsonOk({ items, total: uniqueWallets.size }, 'Students loaded')
  } catch {
    return jsonOk({ items: [], total: 0 }, 'Students loaded')
  }
}
