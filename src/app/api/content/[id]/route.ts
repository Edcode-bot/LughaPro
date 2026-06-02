import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { getBookOwnerId } from '@/lib/books'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, Profile } from '@/types'

function bookToContent(book: Book & { author?: Profile }): ContentItem {
  const ownerId = getBookOwnerId(book)
  const type: ContentType = book.content_type === 'lesson' ? 'lesson' : 'book'
  return {
    id: book.id,
    type,
    title: book.title,
    description: book.description,
    level: book.level,
    price: Number(book.price ?? 0),
    cover_image_url: book.cover_image_url,
    file_url: book.file_url,
    tags: book.tags,
    language: book.language,
    author_id: ownerId,
    author: book.author,
    created_at: book.created_at,
    popularity: 0,
  }
}

function postToContent(post: Post & { author?: Profile }): ContentItem {
  return {
    id: post.id,
    type: 'post',
    title: post.title,
    description: post.content?.slice(0, 180) ?? null,
    content: post.content,
    level: null,
    price: post.is_premium ? Number(post.price ?? 0) : 0,
    cover_image_url: post.cover_image_url,
    file_url: null,
    tags: post.tags,
    language: post.language,
    author_id: post.author_id,
    author: post.author,
    created_at: post.created_at,
    popularity: 0,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const type = request.nextUrl.searchParams.get('type')

  try {
    let item: ContentItem | null = null

    if (!type || type === 'book' || type === 'lesson') {
      const { data: book } = await supabaseAdmin.from('books').select('*').eq('id', id).maybeSingle()
      if (book) {
        const ownerId = getBookOwnerId(book as Book)
        const { data: author } = await supabaseAdmin.from('profiles').select('*').eq('id', ownerId).maybeSingle()
        item = bookToContent({ ...(book as Book), author: author as Profile | undefined })
      }
    }

    if (!item && (!type || type === 'post')) {
      const { data: post } = await supabaseAdmin.from('posts').select('*').eq('id', id).maybeSingle()
      if (post) {
        const { data: author } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', (post as Post).author_id)
          .maybeSingle()
        item = postToContent({ ...(post as Post), author: author as Profile | undefined })
      }
    }

    if (!item) return jsonError('Content not found', 404)
    return jsonOk(item, 'Content loaded')
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load content', 500)
  }
}
