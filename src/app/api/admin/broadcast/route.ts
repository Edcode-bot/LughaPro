import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_WALLETS = ['0xe38a456433fff7814e40998cf0cbbbd2c885b513']

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')?.toLowerCase()
  if (!wallet || !ADMIN_WALLETS.includes(wallet)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const body = await request.json() as { title?: string; message?: string }
  if (!body.title?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('broadcasts')
    .insert({ title: body.title.trim(), message: body.message.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({ data: data ?? [] })
}
