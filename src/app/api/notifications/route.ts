import { NextRequest, NextResponse } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) {
    return NextResponse.json({ data: [], error: null })
  }

  // Look up profile by wallet address
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('wallet_address', wallet.toLowerCase())
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ data: [], error: null })
  }

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return jsonError('Unable to load notifications', 500)

  return jsonOk(data ?? [], 'Notifications loaded')
}
