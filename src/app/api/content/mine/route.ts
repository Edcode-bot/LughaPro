import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, TutorContentItem } from '@/types'

function mapBook(book: Book): TutorContentItem {
  return {
    id: book.id,
    type: book.content_type === 'lesson' ? 'lesson' : 'book',
    title: book.title,
    description: book.description,
    level: book.level,
    price: Number(book.price ?? 0),
    cover_image_url: book.cover_image_url,
    file_url: book.file_url,
    tags: book.tags,
    language: book.language,
    author_id: book.author_id,
    created_at: book.created_at,
    published: book.published ?? true,
    view_count: 0,
    purchase_count: 0,
    earnings: 0,
  }
}

function mapPost(post: Post): TutorContentItem {
  return {
    id: post.id,
    type: 'post',
    title: post.title,
    description: post.content.slice(0, 180),
    content: post.content,
    level: null,
    price: post.is_premium ? Number(post.price ?? 0) : 0,
    cover_image_url: post.cover_image_url,
    file_url: null,
    tags: post.tags,
    language: post.language,
    author_id: post.author_id,
    created_at: post.created_at,
    published: post.published ?? true,
    view_count: 0,
    purchase_count: 0,
    earnings: 0,
  }
}

export async function GET(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  if (auth.profile.role !== 'tutor' && auth.profile.role !== 'admin') {
    return jsonError('Only creators can access this endpoint', 403)
  }

  try {
    const [{ data: books }, { data: posts }] = await Promise.all([
      supabaseAdmin.from('books').select('*').eq('author_id', auth.profile.id).order('created_at', { ascending: false }),
      supabaseAdmin.from('posts').select('*').eq('author_id', auth.profile.id).order('created_at', { ascending: false }),
    ])

    const items: TutorContentItem[] = [
      ...((books ?? []) as Book[]).map(mapBook),
      ...((posts ?? []) as Post[]).map(mapPost),
    ]

    const enriched = await Promise.all(
      items.map(async (item) => {
        const { count, data } = await supabaseAdmin
          .from('purchases')
          .select('amount')
          .eq('content_id', item.id)
          .eq('content_type', item.type)

        const earnings = (data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0)
        return {
          ...item,
          purchase_count: count ?? 0,
          earnings: Number(earnings.toFixed(2)),
        }
      }),
    )

    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return jsonOk({ items: enriched }, 'Creator content loaded')
  } catch {
    return jsonOk({ items: [] }, 'Creator content loaded')
  }
}
