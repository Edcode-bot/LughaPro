import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { wallet_address?: string; role?: 'student' | 'tutor' }
    const walletAddress = body.wallet_address?.toLowerCase()
    const role = body.role === 'tutor' ? 'tutor' : 'student'

    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 422 })
    }

    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle()

    if (lookupError) throw lookupError
    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile, isNew: false })
    }

    const id = crypto.randomUUID()
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id,
        full_name: `Wallet ${walletAddress.slice(0, 6)}`,
        role,
        wallet_address: walletAddress,
      })
      .select('*')
      .single()

    if (profileError) throw profileError
    return NextResponse.json({ profile, isNew: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wallet login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
