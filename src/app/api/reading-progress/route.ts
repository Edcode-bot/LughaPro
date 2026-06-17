import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  const bookId = request.nextUrl.searchParams.get('book_id')
  if (!wallet || !bookId) return NextResponse.json({ progress_percent: 0 })

  const supabase = client()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()
  if (!profile) return NextResponse.json({ progress_percent: 0 })

  const { data } = await supabase
    .from('reading_progress')
    .select('progress_percent')
    .eq('user_id', profile.id)
    .eq('book_id', bookId)
    .maybeSingle()

  return NextResponse.json({ progress_percent: data?.progress_percent ?? 0 })
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
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json() as { book_id?: string; progress_percent?: number }

  await supabase.from('reading_progress').upsert(
    {
      user_id: profile.id,
      book_id: body.book_id,
      progress_percent: body.progress_percent ?? 0,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_id' },
  )

  return NextResponse.json({ success: true })
}
