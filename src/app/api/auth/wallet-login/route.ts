import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type WalletLoginBody = { wallet_address?: string; role?: 'student' | 'tutor' }

function fallbackProfile(walletAddress: string, role: 'student' | 'tutor') {
  return NextResponse.json({
    data: { profile: { id: walletAddress, role, wallet_address: walletAddress }, isNew: false },
    error: null,
  })
}

export async function POST(request: Request) {
  let walletAddress = ''
  let role: 'student' | 'tutor' = 'student'

  try {
    const body = await request.json() as WalletLoginBody
    walletAddress = body.wallet_address?.toLowerCase() ?? ''
    role = body.role === 'tutor' ? 'tutor' : 'student'

    if (!walletAddress) {
      return NextResponse.json({ data: null, error: 'wallet_address is required' }, { status: 422 })
    }

    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle()

    if (lookupError) {
      console.error('[wallet-login] Supabase lookup failed:', lookupError.message)
      return fallbackProfile(walletAddress, role)
    }

    if (existingProfile) {
      return NextResponse.json({
        data: { profile: existingProfile, isNew: false },
        error: null,
      })
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

    if (profileError) {
      console.error('[wallet-login] Supabase insert failed:', profileError.message)
      return fallbackProfile(walletAddress, role)
    }

    return NextResponse.json({
      data: { profile, isNew: true },
      error: null,
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wallet login failed'
    console.error('[wallet-login] Unexpected error:', message)

    if (walletAddress) {
      return fallbackProfile(walletAddress, role)
    }

    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
