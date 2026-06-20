import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_WALLETS = ['0xe38a456433fff7814e40998cf0cbbbd2c885b513']

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')?.toLowerCase()
  if (!wallet || !ADMIN_WALLETS.includes(wallet)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { type, id } = await request.json() as { type: string; id: string }

  const tableMap: Record<string, string> = {
    user: 'profiles',
    post: 'posts',
    book: 'books',
    video: 'videos',
    music: 'music',
    comment: 'comments',
  }

  const table = tableMap[type]
  if (!table) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
