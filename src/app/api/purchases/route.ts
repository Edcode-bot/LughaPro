import { NextRequest } from 'next/server'
import { jsonError, jsonOk, getWalletAddress } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, Profile, PurchaseWithContent } from '@/types'

async function loadContent(contentId: string, contentType: ContentType): Promise<ContentItem | null> {
  if (contentType === 'post') {
    const { data } = await supabaseAdmin
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('id', contentId)
      .maybeSingle()
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

  const { data } = await supabaseAdmin
    .from('books')
    .select('*, author:profiles(*)')
    .eq('id', contentId)
    .maybeSingle()
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
  const wallet = getWalletAddress(request) ?? request.nextUrl.searchParams.get('user')?.toLowerCase()
  if (!wallet) return jsonError('user wallet is required', 422)

  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_wallet', wallet)
      .order('purchased_at', { ascending: false })

    if (error) return jsonOk({ items: [] }, 'Purchases loaded')

    const items: PurchaseWithContent[] = []
    for (const purchase of purchases ?? []) {
      const content = await loadContent(purchase.content_id, purchase.content_type as ContentType)
      if (content) items.push({ ...purchase, content })
    }

    return jsonOk({ items }, 'Purchases loaded')
  } catch {
    return jsonOk({ items: [] }, 'Purchases loaded')
  }
}

export async function POST(request: Request) {
  const wallet = getWalletAddress(request)
  if (!wallet) return jsonError('wallet_address header is required', 401)

  try {
    const body = await request.json() as {
      content_id?: string
      content_type?: ContentType
      amount?: number
      progress_status?: 'not_started' | 'reading' | 'completed'
      progress_percent?: number
    }
    if (!body.content_id || !body.content_type) {
      return jsonError('content_id and content_type are required', 422)
    }

    const { data, error } = await supabaseAdmin
      .from('purchases')
      .upsert(
        {
          user_wallet: wallet,
          content_id: body.content_id,
          content_type: body.content_type,
          amount: Number(body.amount ?? 0),
          purchased_at: new Date().toISOString(),
          progress_status: body.progress_status ?? 'reading',
          progress_percent: body.progress_percent ?? 10,
        },
        { onConflict: 'user_wallet,content_id,content_type' },
      )
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Purchase recorded', 201)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to record purchase', 500)
  }
}
