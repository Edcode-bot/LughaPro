import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchProfile(supabase: ReturnType<typeof serviceClient>, profileId: string) {
  if (!profileId) return null
  const { data } = await supabase
    .from('profiles')
    .select('full_name, wallet_address, avatar_url')
    .eq('id', profileId)
    .maybeSingle()
  return data
}

async function tryPost(supabase: ReturnType<typeof serviceClient>, id: string) {
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, cover_image_url, price, is_premium, tags, created_at, published, author_id')
    .eq('id', id)
    .maybeSingle()

  if (!post) return null

  const profile = await fetchProfile(supabase, post.author_id)

  return {
    id: post.id,
    title: post.title,
    description: post.content?.slice(0, 150) ?? '',
    content: post.content ?? '',
    cover_image_url: post.cover_image_url ?? null,
    file_url: null,
    price: Number(post.price ?? 0),
    is_free: !post.is_premium,
    type: 'post' as const,
    category: 'language',
    level: 'All',
    creator_name: profile?.full_name ?? 'Unknown',
    creator_wallet_address: profile?.wallet_address ?? null,
    creator_id: post.author_id ?? '',
    created_at: post.created_at,
  }
}

async function tryBook(supabase: ReturnType<typeof serviceClient>, id: string) {
  const { data: book } = await supabase
    .from('books')
    .select('id, title, description, cover_image_url, file_url, price, is_free, level, tags, created_at, published, tutor_id')
    .eq('id', id)
    .maybeSingle()

  if (!book) return null

  const profile = await fetchProfile(supabase, book.tutor_id)

  return {
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    content: '',
    cover_image_url: book.cover_image_url ?? null,
    file_url: book.file_url ?? null,
    price: Number(book.price ?? 0),
    is_free: book.is_free ?? true,
    type: 'book' as const,
    category: 'language',
    level: book.level ?? 'All',
    creator_name: profile?.full_name ?? 'Unknown',
    creator_wallet_address: profile?.wallet_address ?? null,
    creator_id: book.tutor_id ?? '',
    created_at: book.created_at,
  }
}

async function tryVideo(supabase: ReturnType<typeof serviceClient>, id: string) {
  const { data: video } = await supabase
    .from('videos')
    .select('id, title, description, thumbnail_url, video_url, price, is_free, category, level, tags, created_at, published, creator_id')
    .eq('id', id)
    .maybeSingle()

  if (!video) return null

  const profile = await fetchProfile(supabase, video.creator_id)

  return {
    id: video.id,
    title: video.title,
    description: video.description ?? '',
    content: '',
    cover_image_url: video.thumbnail_url ?? null,
    file_url: video.video_url ?? null,
    price: Number(video.price ?? 0),
    is_free: video.is_free ?? true,
    type: 'video' as const,
    category: video.category ?? 'language',
    level: video.level ?? 'N/A',
    creator_name: profile?.full_name ?? 'Unknown',
    creator_wallet_address: profile?.wallet_address ?? null,
    creator_id: video.creator_id ?? '',
    created_at: video.created_at,
  }
}

async function tryMusic(supabase: ReturnType<typeof serviceClient>, id: string) {
  const { data: music } = await supabase
    .from('music')
    .select('id, title, description, cover_image_url, audio_url, price, is_free, genre, tags, created_at, published, creator_id')
    .eq('id', id)
    .maybeSingle()

  if (!music) return null

  const profile = await fetchProfile(supabase, music.creator_id)

  return {
    id: music.id,
    title: music.title,
    description: music.description ?? '',
    content: '',
    cover_image_url: music.cover_image_url ?? null,
    file_url: music.audio_url ?? null,
    price: Number(music.price ?? 0),
    is_free: music.is_free ?? true,
    type: 'music' as const,
    category: 'music',
    level: 'N/A',
    creator_name: profile?.full_name ?? 'Unknown',
    creator_wallet_address: profile?.wallet_address ?? null,
    creator_id: music.creator_id ?? '',
    created_at: music.created_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const type = request.nextUrl.searchParams.get('type')
  const supabase = serviceClient()

  const tryFunctions = {
    post: tryPost,
    book: tryBook,
    video: tryVideo,
    music: tryMusic,
  }

  // Build search order: hinted type first, then rest
  const order = type && type in tryFunctions
    ? [type, ...Object.keys(tryFunctions).filter(t => t !== type)]
    : Object.keys(tryFunctions)

  for (const t of order) {
    const fn = tryFunctions[t as keyof typeof tryFunctions]
    const result = await fn(supabase, id)
    if (result) {
      return NextResponse.json({ data: result, error: null })
    }
  }

  return NextResponse.json({ data: null, error: 'Content not found' }, { status: 404 })
}
