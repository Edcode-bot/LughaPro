import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${wallet.toLowerCase()}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename)

  // Update profile avatar_url
  await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('wallet_address', wallet.toLowerCase())

  return NextResponse.json({ url: urlData.publicUrl })
}
