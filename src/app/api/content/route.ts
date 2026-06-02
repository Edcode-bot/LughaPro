import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { getBookOwnerId } from '@/lib/books'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, Profile } from '@/types'

function bookToContent(book: Book & { author?: Profile }): ContentItem {
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
    author_id: getBookOwnerId(book),
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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const type = params.get('type')
  const level = params.get('level')
  const price = params.get('price')
  const language = params.get('language')
  const authorId = params.get('author_id')
  const search = params.get('search')
  const limit = Math.min(Math.max(Number(params.get('limit') ?? '12'), 1), 50)
  const offset = Math.max(Number(params.get('offset') ?? '0'), 0)

  try {
    const items: ContentItem[] = []

    if (!type || type === 'all' || type === 'book' || type === 'lesson') {
      let booksQuery = supabaseAdmin
        .from('books')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (authorId) booksQuery = booksQuery.eq('tutor_id', authorId)
      if (type === 'book') booksQuery = booksQuery.neq('content_type', 'lesson')
      if (type === 'lesson') booksQuery = booksQuery.eq('content_type', 'lesson')
      if (level && level !== 'all') booksQuery = booksQuery.eq('level', level)
      if (price === 'free') booksQuery = booksQuery.eq('price', 0)
      if (price === 'paid') booksQuery = booksQuery.gt('price', 0)
      if (language && language !== 'all') booksQuery = booksQuery.ilike('language', `%${language}%`)
      if (search) booksQuery = booksQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

      const { data: books, error: booksError } = await booksQuery
      if (!booksError && books) {
        items.push(...(books as (Book & { author?: Profile })[]).map(bookToContent))
      }
    }

    if (!type || type === 'all' || type === 'post') {
      let postsQuery = supabaseAdmin
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (authorId) postsQuery = postsQuery.eq('author_id', authorId)
      if (price === 'free') postsQuery = postsQuery.eq('is_premium', false)
      if (price === 'paid') postsQuery = postsQuery.eq('is_premium', true)
      if (language && language !== 'all') postsQuery = postsQuery.ilike('language', `%${language}%`)
      if (search) postsQuery = postsQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)

      const { data: posts, error: postsError } = await postsQuery
      if (!postsError && posts) {
        items.push(...(posts as (Post & { author?: Profile })[]).map(postToContent))
      }
    }

    const authorIds = [...new Set(items.map((item) => item.author_id))]
    const { data: authors } = authorIds.length
      ? await supabaseAdmin.from('profiles').select('*').in('id', authorIds)
      : { data: [] as Profile[] }

    const authorMap = new Map((authors ?? []).map((author) => [author.id, author as Profile]))
    const enriched = items.map((item) => ({ ...item, author: authorMap.get(item.author_id) }))

    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const total = enriched.length
    const pageItems = enriched.slice(offset, offset + limit)

    return jsonOk({ items: pageItems, total, limit, offset }, 'Content loaded')
  } catch {
    return jsonOk({ items: [], total: 0, limit, offset }, 'Content loaded')
  }
}
