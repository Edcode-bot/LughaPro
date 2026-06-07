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

    // Run all queries in parallel — use Promise.allSettled so one failure doesn't break the rest
    const [booksRes, postsRes, videosRes, musicRes] = await Promise.allSettled([
      // Books have no category column — count all published books as 'literature'
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('published', true),
      // Posts have no category column — count all published posts as 'language'
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
      // Videos DO have a category column
      supabase.from('videos').select('category').eq('published', true),
      // Music has no category — count all as 'music'
      supabase.from('music').select('id', { count: 'exact', head: true }).eq('published', true),
    ])

    if (booksRes.status === 'fulfilled' && booksRes.value.count != null) {
      counts.literature += booksRes.value.count
    }

    if (postsRes.status === 'fulfilled' && postsRes.value.count != null) {
      counts.language += postsRes.value.count
    }

    if (videosRes.status === 'fulfilled' && videosRes.value.data) {
      for (const row of videosRes.value.data) {
        const cat = (row.category as string | null) ?? 'video'
        if (cat in counts) {
          counts[cat] += 1
        } else {
          counts.video += 1
        }
      }
    }

    if (musicRes.status === 'fulfilled' && musicRes.value.count != null) {
      counts.music += musicRes.value.count
    }

    return NextResponse.json({ data: counts, error: null })
  } catch {
    return NextResponse.json({
      data: { language: 0, music: 0, arts: 0, literature: 0, video: 0, experience: 0 },
      error: null,
    })
  }
}
