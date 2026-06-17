import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ data: [], creators: [] })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [books, posts, videos, music, creators] = await Promise.all([
    supabase.from('books').select('id, title, description, cover_image_url, price, is_free').ilike('title', `%${q}%`).eq('published', true).limit(5),
    supabase.from('posts').select('id, title, content, cover_image_url, price, is_premium').ilike('title', `%${q}%`).eq('published', true).limit(5),
    supabase.from('videos').select('id, title, description, thumbnail_url, price, is_free').ilike('title', `%${q}%`).eq('published', true).limit(5),
    supabase.from('music').select('id, title, description, cover_image_url, price, is_free').ilike('title', `%${q}%`).eq('published', true).limit(5),
    supabase.from('profiles').select('id, full_name, avatar_url, bio').ilike('full_name', `%${q}%`).limit(5),
  ])

  const results = [
    ...(books.data ?? []).map((b) => ({ ...b, type: 'book', image: b.cover_image_url })),
    ...(posts.data ?? []).map((p) => ({ ...p, type: 'post', image: p.cover_image_url })),
    ...(videos.data ?? []).map((v) => ({ ...v, type: 'video', image: v.thumbnail_url })),
    ...(music.data ?? []).map((m) => ({ ...m, type: 'music', image: m.cover_image_url })),
  ]

  const creatorResults = (creators.data ?? []).map((c) => ({ ...c, type: 'creator' }))

  return NextResponse.json({ data: results, creators: creatorResults })
}
