import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: NextRequest) {
  const contentId = request.nextUrl.searchParams.get('content_id')
  if (!contentId) return NextResponse.json({ data: [] })

  const supabase = client()
  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false })

  if (!comments || comments.length === 0) return NextResponse.json({ data: [] })

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
  const enriched = comments.map((c) => ({
    ...c,
    author_name: profileMap.get(c.user_id)?.full_name ?? 'Anonymous',
    author_avatar: profileMap.get(c.user_id)?.avatar_url ?? null,
  }))

  return NextResponse.json({ data: enriched })
}

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = client()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json() as { content_id?: string; content_type?: string; body?: string }
  if (!body.body?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content_id: body.content_id,
      content_type: body.content_type,
      user_id: profile.id,
      body: body.body.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
