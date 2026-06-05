import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { ContentItem, ContentType, Profile } from '@/types'

// Extract Profile from a Supabase joined row (handles array or object)
function extractProfile(raw: unknown): Profile | undefined {
  if (!raw) return undefined
  const p = Array.isArray(raw) ? raw[0] : raw
  if (!p || typeof p !== 'object') return undefined
  return p as Profile
}

function bookToContent(book: Record<string, unknown>): ContentItem {
  const type: ContentType = (book.content_type as string) === 'lesson' ? 'lesson' : 'book'
  const ownerId = (book.tutor_id ?? book.author_id ?? '') as string
  const author = extractProfile(book.profiles)
  return {
    id: book.id as string,
    type,
    title: book.title as string,
    description: book.description as string | null,
    level: book.level as string | null,
    price: Number(book.price ?? 0),
    cover_image_url: book.cover_image_url as string | null,
    file_url: book.file_url as string | null,
    tags: book.tags as string[] | null,
    language: book.language as string | null,
    category: (book.content_category as ContentItem['category']) ?? 'language',
    author_id: ownerId,
    author,
    created_at: book.created_at as string,
    popularity: 0,
  }
}

function postToContent(post: Record<string, unknown>): ContentItem {
  const author = extractProfile(post.profiles)
  return {
    id: post.id as string,
    type: 'post',
    title: post.title as string,
    description: (post.content as string | null)?.slice(0, 180) ?? null,
    content: post.content as string | null,
    level: null,
    price: post.is_premium ? Number(post.price ?? 0) : 0,
    cover_image_url: post.cover_image_url as string | null,
    file_url: null,
    tags: post.tags as string[] | null,
    language: post.language as string | null,
    category: (post.content_category as ContentItem['category']) ?? 'language',
    author_id: post.author_id as string,
    author,
    created_at: post.created_at as string,
    popularity: 0,
  }
}

type VideoRow = {
  id: string
  creator_id: string
  title: string
  description: string | null
  video_url: string | null
  thumbnail_url: string | null
  price: number
  category: string
  level: string | null
  tags: string[] | null
  created_at: string
}

type MusicRow = {
  id: string
  creator_id: string
  title: string
  description: string | null
  audio_url: string | null
  cover_image_url: string | null
  price: number
  tags: string[] | null
  created_at: string
}

function videoToContent(v: VideoRow): ContentItem {
  return {
    id: v.id,
    type: 'video',
    title: v.title,
    description: v.description,
    level: v.level,
    price: Number(v.price ?? 0),
    cover_image_url: v.thumbnail_url,
    file_url: null,
    video_url: v.video_url,
    tags: v.tags,
    language: null,
    category: v.category as ContentItem['category'] ?? 'video',
    author_id: v.creator_id,
    created_at: v.created_at,
    popularity: 0,
  }
}

function musicToContent(m: MusicRow): ContentItem {
  return {
    id: m.id,
    type: 'music',
    title: m.title,
    description: m.description,
    level: null,
    price: Number(m.price ?? 0),
    cover_image_url: m.cover_image_url,
    file_url: null,
    audio_url: m.audio_url,
    tags: m.tags,
    language: null,
    category: 'music',
    author_id: m.creator_id,
    created_at: m.created_at,
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
  const category = params.get('category')
  const limit = Math.min(Math.max(Number(params.get('limit') ?? '12'), 1), 50)
  const offset = Math.max(Number(params.get('offset') ?? '0'), 0)

  try {
    const items: ContentItem[] = []

    if (!type || type === 'all' || type === 'book' || type === 'lesson') {
      const PROFILE_SELECT = 'profiles(id, full_name, wallet_address, avatar_url)'
      let q = supabaseAdmin
        .from('books')
        .select(`*, ${PROFILE_SELECT}`)
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (authorId) q = q.eq('tutor_id', authorId)
      if (type === 'book') q = q.neq('content_type', 'lesson')
      if (type === 'lesson') q = q.eq('content_type', 'lesson')
      if (level && level !== 'all') q = q.eq('level', level)
      if (price === 'free') q = q.eq('price', 0)
      if (price === 'paid') q = q.gt('price', 0)
      if (language && language !== 'all') q = q.ilike('language', `%${language}%`)
      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      if (category) q = q.eq('content_category', category)
      const { data: books, error } = await q
      if (!error && books) items.push(...(books as Record<string, unknown>[]).map(bookToContent))
    }

    if (!type || type === 'all' || type === 'post') {
      const PROFILE_SELECT = 'profiles(id, full_name, wallet_address, avatar_url)'
      let q = supabaseAdmin
        .from('posts')
        .select(`*, ${PROFILE_SELECT}`)
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (authorId) q = q.eq('author_id', authorId)
      if (price === 'free') q = q.eq('is_premium', false)
      if (price === 'paid') q = q.eq('is_premium', true)
      if (language && language !== 'all') q = q.ilike('language', `%${language}%`)
      if (search) q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      if (category) q = q.eq('content_category', category)
      const { data: posts, error } = await q
      if (!error && posts) items.push(...(posts as Record<string, unknown>[]).map(postToContent))
    }

    // Videos — gracefully skip if table doesn't exist yet
    if (!type || type === 'all' || type === 'video') {
      try {
        let q = supabaseAdmin.from('videos').select('*').eq('published', true).order('created_at', { ascending: false })
        if (authorId) q = q.eq('creator_id', authorId)
        if (price === 'free') q = q.eq('is_free', true)
        if (price === 'paid') q = q.eq('is_free', false)
        if (search) q = q.ilike('title', `%${search}%`)
        if (category) q = q.eq('category', category)
        const { data: videos, error } = await q
        if (!error && videos) items.push(...(videos as VideoRow[]).map(videoToContent))
      } catch { /* videos table not yet created */ }
    }

    // Music — gracefully skip if table doesn't exist yet
    if (!type || type === 'all' || type === 'music') {
      try {
        let q = supabaseAdmin.from('music').select('*').eq('published', true).order('created_at', { ascending: false })
        if (authorId) q = q.eq('creator_id', authorId)
        if (price === 'free') q = q.eq('is_free', true)
        if (price === 'paid') q = q.eq('is_free', false)
        if (search) q = q.ilike('title', `%${search}%`)
        const { data: music, error } = await q
        if (!error && music) items.push(...(music as MusicRow[]).map(musicToContent))
      } catch { /* music table not yet created */ }
    }

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const total = items.length
    const pageItems = items.slice(offset, offset + limit)

    return jsonOk({ items: pageItems, total, limit, offset }, 'Content loaded')
  } catch {
    return jsonOk({ items: [], total: 0, limit, offset }, 'Content loaded')
  }
}

export const dynamic = 'force-dynamic'
