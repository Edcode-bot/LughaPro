import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { ContentItem, ContentType, Profile } from '@/types'

// Extract a Profile from a Supabase joined row — handles both array and object shapes
function extractProfile(raw: unknown): Profile | undefined {
  if (!raw) return undefined
  const p = Array.isArray(raw) ? raw[0] : raw
  if (!p || typeof p !== 'object') return undefined
  return p as Profile
}

// Fallback: fetch profile by id with manual query (avoids FK name dependency)
async function fetchProfileById(id: string): Promise<Profile | undefined> {
  if (!id) return undefined
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at')
    .eq('id', id)
    .maybeSingle()
  return data as Profile | undefined
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const type = request.nextUrl.searchParams.get('type')

  // Determine search order — hint type goes first, then all others as fallback
  function tableOrder(): Array<'book' | 'post' | 'video' | 'music'> {
    if (type === 'post') return ['post', 'book', 'video', 'music']
    if (type === 'video') return ['video', 'book', 'post', 'music']
    if (type === 'music') return ['music', 'book', 'post', 'video']
    return ['book', 'post', 'video', 'music'] // default / lesson / no type
  }

  const PROFILE_COLS = 'profiles(id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at)'

  async function tryBook(): Promise<ContentItem | null> {
    const { data: book } = await supabaseAdmin
      .from('books')
      .select(`*, ${PROFILE_COLS}`)
      .eq('id', id)
      .maybeSingle()
    if (!book) return null
    const raw = book as Record<string, unknown>
    const ownerId = (raw.tutor_id ?? raw.author_id ?? '') as string
    let author = extractProfile(raw.profiles)
    if (!author?.wallet_address) author = await fetchProfileById(ownerId) ?? author
    const contentType: ContentType = (raw.content_type as string) === 'lesson' ? 'lesson' : 'book'
    return {
      id: raw.id as string,
      type: contentType,
      title: raw.title as string,
      description: raw.description as string | null,
      level: raw.level as string | null,
      price: Number(raw.price ?? 0),
      cover_image_url: raw.cover_image_url as string | null,
      file_url: raw.file_url as string | null,
      tags: raw.tags as string[] | null,
      language: raw.language as string | null,
      category: (raw.content_category as ContentItem['category']) ?? 'language',
      author_id: ownerId,
      author,
      created_at: raw.created_at as string,
      popularity: 0,
    }
  }

  async function tryPost(): Promise<ContentItem | null> {
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select(`*, ${PROFILE_COLS}`)
      .eq('id', id)
      .maybeSingle()
    if (!post) return null
    const raw = post as Record<string, unknown>
    const authorId = raw.author_id as string
    let author = extractProfile(raw.profiles)
    if (!author?.wallet_address) author = await fetchProfileById(authorId) ?? author
    return {
      id: raw.id as string,
      type: 'post',
      title: raw.title as string,
      description: (raw.content as string | null)?.slice(0, 180) ?? null,
      content: raw.content as string | null,
      level: null,
      price: raw.is_premium ? Number(raw.price ?? 0) : 0,
      cover_image_url: raw.cover_image_url as string | null,
      file_url: null,
      tags: raw.tags as string[] | null,
      language: raw.language as string | null,
      category: (raw.content_category as ContentItem['category']) ?? 'language',
      author_id: authorId,
      author,
      created_at: raw.created_at as string,
      popularity: 0,
    }
  }

  async function tryVideo(): Promise<ContentItem | null> {
    try {
      const { data: video } = await supabaseAdmin
        .from('videos')
        .select(`*, ${PROFILE_COLS}`)
        .eq('id', id)
        .maybeSingle()
      if (!video) return null
      const v = video as Record<string, unknown>
      const creatorId = v.creator_id as string
      let author = extractProfile(v.profiles)
      if (!author?.wallet_address) author = await fetchProfileById(creatorId) ?? author
      return {
        id: v.id as string,
        type: 'video',
        title: v.title as string,
        description: v.description as string | null,
        level: v.level as string | null,
        price: Number(v.price ?? 0),
        cover_image_url: v.thumbnail_url as string | null,
        file_url: null,
        video_url: v.video_url as string | null,
        tags: v.tags as string[] | null,
        language: null,
        category: (v.category as ContentItem['category']) ?? 'video',
        author_id: creatorId,
        author,
        created_at: v.created_at as string,
        popularity: 0,
      }
    } catch { return null }
  }

  async function tryMusic(): Promise<ContentItem | null> {
    try {
      const { data: music } = await supabaseAdmin
        .from('music')
        .select(`*, ${PROFILE_COLS}`)
        .eq('id', id)
        .maybeSingle()
      if (!music) return null
      const m = music as Record<string, unknown>
      const creatorId = m.creator_id as string
      let author = extractProfile(m.profiles)
      if (!author?.wallet_address) author = await fetchProfileById(creatorId) ?? author
      return {
        id: m.id as string,
        type: 'music',
        title: m.title as string,
        description: m.description as string | null,
        level: null,
        price: Number(m.price ?? 0),
        cover_image_url: m.cover_image_url as string | null,
        file_url: null,
        audio_url: m.audio_url as string | null,
        tags: m.tags as string[] | null,
        language: null,
        category: 'music',
        author_id: creatorId,
        author,
        created_at: m.created_at as string,
        popularity: 0,
      }
    } catch { return null }
  }

  try {
    // Try tables in type-hinted order; fall through on miss so a wrong ?type never 404s
    const handlers: Record<string, () => Promise<ContentItem | null>> = {
      book: tryBook,
      post: tryPost,
      video: tryVideo,
      music: tryMusic,
    }

    let item: ContentItem | null = null
    for (const table of tableOrder()) {
      item = await handlers[table]()
      if (item) break
    }

    if (!item) return jsonError('Content not found', 404)
    return jsonOk(item, 'Content loaded')
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load content', 500)
  }
}
