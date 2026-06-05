import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-service-role'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    const counts: Record<string, number> = {
      language: 0,
      music: 0,
      arts: 0,
      literature: 0,
      video: 0,
      experience: 0,
    }

    // Books — use content_category column if available, otherwise count all as 'language'
    const [booksRes, postsRes, videosRes, musicRes] = await Promise.allSettled([
      supabase.from('books').select('content_category').eq('published', true),
      supabase.from('posts').select('content_category').eq('published', true),
      supabase.from('videos').select('category').eq('published', true),
      supabase.from('music').select('id').eq('published', true),
    ])

    if (booksRes.status === 'fulfilled' && booksRes.value.data) {
      for (const row of booksRes.value.data) {
        const cat = (row.content_category as string) ?? 'language'
        counts[cat] = (counts[cat] ?? 0) + 1
      }
    }

    if (postsRes.status === 'fulfilled' && postsRes.value.data) {
      for (const row of postsRes.value.data) {
        const cat = (row.content_category as string) ?? 'language'
        counts[cat] = (counts[cat] ?? 0) + 1
      }
    }

    if (videosRes.status === 'fulfilled' && videosRes.value.data) {
      for (const row of videosRes.value.data) {
        const cat = (row.category as string) ?? 'video'
        counts[cat] = (counts[cat] ?? 0) + 1
      }
    }

    if (musicRes.status === 'fulfilled' && musicRes.value.data) {
      counts.music = (counts.music ?? 0) + musicRes.value.data.length
    }

    return NextResponse.json({ data: counts, error: null })
  } catch {
    return NextResponse.json({
      data: { language: 0, music: 0, arts: 0, literature: 0, video: 0, experience: 0 },
      error: null,
    })
  }
}
