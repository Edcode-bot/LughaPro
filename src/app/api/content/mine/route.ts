import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ data: [] })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()

  if (!profile) return NextResponse.json({ data: [] })

  const [booksRes, postsRes, videosRes, musicRes] = await Promise.all([
    supabase
      .from('books')
      .select('id,title,price,published,created_at,cover_image_url')
      .eq('tutor_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id,title,price,is_premium,published,created_at,cover_image_url')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('videos')
      .select('id,title,price,published,created_at,thumbnail_url')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('music')
      .select('id,title,price,published,created_at,cover_image_url')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  const all = [
    ...(booksRes.data ?? []).map((b) => ({ ...b, type: 'book', is_free: Number(b.price ?? 0) === 0 })),
    ...(postsRes.data ?? []).map((p) => ({ ...p, type: 'post', is_free: !p.is_premium })),
    ...(videosRes.data ?? []).map((v) => ({ ...v, type: 'video', is_free: Number(v.price ?? 0) === 0 })),
    ...(musicRes.data ?? []).map((m) => ({ ...m, type: 'music', is_free: Number(m.price ?? 0) === 0 })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({ data: all })
}
