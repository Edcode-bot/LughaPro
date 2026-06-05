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

  try {
    let item: ContentItem | null = null

    // ── Book / lesson ──────────────────────────────────────────────────────
    if (!type || type === 'book' || type === 'lesson') {
      // Try FK join first; if profile is null fall back to manual lookup
      const { data: book } = await supabaseAdmin
        .from('books')
        .select('*, profiles(id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at)')
        .eq('id', id)
        .maybeSingle()

      if (book) {
        const rawBook = book as Record<string, unknown>
        const ownerId = (rawBook.tutor_id ?? rawBook.author_id ?? '') as string
        let author = extractProfile(rawBook.profiles)
        // Fallback if join returned nothing (FK name mismatch)
        if (!author?.wallet_address) {
          author = await fetchProfileById(ownerId) ?? author
        }
        const contentType: ContentType = (rawBook.content_type as string) === 'lesson' ? 'lesson' : 'book'
        item = {
          id: rawBook.id as string,
          type: contentType,
          title: rawBook.title as string,
          description: rawBook.description as string | null,
          level: rawBook.level as string | null,
          price: Number(rawBook.price ?? 0),
          cover_image_url: rawBook.cover_image_url as string | null,
          file_url: rawBook.file_url as string | null,
          tags: rawBook.tags as string[] | null,
          language: rawBook.language as string | null,
          category: (rawBook.content_category as ContentItem['category']) ?? 'language',
          author_id: ownerId,
          author,
          created_at: rawBook.created_at as string,
          popularity: 0,
        }
      }
    }

    // ── Post ───────────────────────────────────────────────────────────────
    if (!item && (!type || type === 'post')) {
      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('*, profiles(id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at)')
        .eq('id', id)
        .maybeSingle()

      if (post) {
        const rawPost = post as Record<string, unknown>
        const authorId = rawPost.author_id as string
        let author = extractProfile(rawPost.profiles)
        if (!author?.wallet_address) {
          author = await fetchProfileById(authorId) ?? author
        }
        item = {
          id: rawPost.id as string,
          type: 'post',
          title: rawPost.title as string,
          description: (rawPost.content as string | null)?.slice(0, 180) ?? null,
          content: rawPost.content as string | null,
          level: null,
          price: rawPost.is_premium ? Number(rawPost.price ?? 0) : 0,
          cover_image_url: rawPost.cover_image_url as string | null,
          file_url: null,
          tags: rawPost.tags as string[] | null,
          language: rawPost.language as string | null,
          category: (rawPost.content_category as ContentItem['category']) ?? 'language',
          author_id: authorId,
          author,
          created_at: rawPost.created_at as string,
          popularity: 0,
        }
      }
    }

    // ── Video ──────────────────────────────────────────────────────────────
    if (!item && (!type || type === 'video')) {
      try {
        const { data: video } = await supabaseAdmin
          .from('videos')
          .select('*, profiles(id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at)')
          .eq('id', id)
          .maybeSingle()

        if (video) {
          const v = video as Record<string, unknown>
          const creatorId = v.creator_id as string
          let author = extractProfile(v.profiles)
          if (!author?.wallet_address) {
            author = await fetchProfileById(creatorId) ?? author
          }
          item = {
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
        }
      } catch { /* videos table may not exist */ }
    }

    // ── Music ──────────────────────────────────────────────────────────────
    if (!item && (!type || type === 'music')) {
      try {
        const { data: music } = await supabaseAdmin
          .from('music')
          .select('*, profiles(id, full_name, wallet_address, avatar_url, bio, country, languages, role, referral_code, created_at)')
          .eq('id', id)
          .maybeSingle()

        if (music) {
          const m = music as Record<string, unknown>
          const creatorId = m.creator_id as string
          let author = extractProfile(m.profiles)
          if (!author?.wallet_address) {
            author = await fetchProfileById(creatorId) ?? author
          }
          item = {
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
        }
      } catch { /* music table may not exist */ }
    }

    if (!item) return jsonError('Content not found', 404)
    return jsonOk(item, 'Content loaded')
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load content', 500)
  }
}
