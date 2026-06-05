import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { getBookOwnerId } from '@/lib/books'
import { supabaseAdmin } from '@/lib/supabase'
import { Book, ContentItem, ContentType, Post, Profile } from '@/types'

async function fetchAuthor(authorId: string): Promise<Profile | undefined> {
  const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', authorId).maybeSingle()
  return data as Profile | undefined
}

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

    // Book / lesson
    if (!type || type === 'book' || type === 'lesson') {
      const { data: book } = await supabaseAdmin.from('books').select('*').eq('id', id).maybeSingle()
      if (book) {
        const ownerId = getBookOwnerId(book as Book)
        const author = await fetchAuthor(ownerId)
        item = bookToContent({ ...(book as Book), author })
      }
    }

    // Post
    if (!item && (!type || type === 'post')) {
      const { data: post } = await supabaseAdmin.from('posts').select('*').eq('id', id).maybeSingle()
      if (post) {
        const author = await fetchAuthor((post as Post).author_id)
        item = postToContent({ ...(post as Post), author })
      }
    }

    // Video
    if (!item && (!type || type === 'video')) {
      try {
        const { data: video } = await supabaseAdmin.from('videos').select('*').eq('id', id).maybeSingle()
        if (video) {
          const v = video as { id: string; creator_id: string; title: string; description: string | null; video_url: string | null; thumbnail_url: string | null; price: number; category: string; level: string | null; tags: string[] | null; created_at: string }
          const author = await fetchAuthor(v.creator_id)
          item = {
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
            category: (v.category as ContentItem['category']) ?? 'video',
            author_id: v.creator_id,
            author,
            created_at: v.created_at,
            popularity: 0,
          }
        }
      } catch { /* videos table may not exist */ }
    }

    // Music
    if (!item && (!type || type === 'music')) {
      try {
        const { data: music } = await supabaseAdmin.from('music').select('*').eq('id', id).maybeSingle()
        if (music) {
          const m = music as { id: string; creator_id: string; title: string; description: string | null; audio_url: string | null; cover_image_url: string | null; price: number; tags: string[] | null; created_at: string }
          const author = await fetchAuthor(m.creator_id)
          item = {
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
            author,
            created_at: m.created_at,
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
