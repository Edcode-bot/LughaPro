import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, Profile } from '@/types'

async function hydrate(contentId: string, contentType: ContentType): Promise<ContentItem | null> {
  if (contentType === 'post') {
    const { data } = await supabaseAdmin.from('posts').select('*, author:profiles(*)').eq('id', contentId).maybeSingle()
    if (!data) return null
    const post = data as Post & { author?: Profile }
    return {
      id: post.id,
      type: 'post',
      title: post.title,
      description: post.content.slice(0, 180),
      content: post.content,
      level: null,
      price: post.is_premium ? Number(post.price) : 0,
      cover_image_url: post.cover_image_url,
      file_url: null,
      tags: post.tags,
      language: post.language,
      author_id: post.author_id,
      author: post.author,
      created_at: post.created_at,
    }
  }

  const { data } = await supabaseAdmin.from('books').select('*, author:profiles(*)').eq('id', contentId).maybeSingle()
  if (!data) return null
  const book = data as Book & { author?: Profile }
  return {
    id: book.id,
    type: book.content_type === 'lesson' ? 'lesson' : 'book',
    title: book.title,
    description: book.description,
    level: book.level,
    price: Number(book.price),
    cover_image_url: book.cover_image_url,
    file_url: book.file_url,
    tags: book.tags,
    language: book.language,
    author_id: book.author_id,
    author: book.author,
    created_at: book.created_at,
  }
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('user')?.toLowerCase()
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') ?? '3'), 1), 10)
  if (!wallet) return jsonError('user is required', 422)

  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_wallet', wallet)
      .order('purchased_at', { ascending: false })
      .limit(limit)

    if (error) return jsonOk({ items: [] }, 'Recent purchases loaded')

    const items = []
    for (const purchase of purchases ?? []) {
      const content = await hydrate(purchase.content_id, purchase.content_type as ContentType)
      if (content) items.push({ ...purchase, content })
    }

    return jsonOk({ items }, 'Recent purchases loaded')
  } catch {
    return jsonOk({ items: [] }, 'Recent purchases loaded')
  }
}
