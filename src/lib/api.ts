import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { createServerSupabaseClient } from './supabase'
import { supabaseAdmin } from './supabase'
import { Profile } from '@/types'

export function getWalletAddress(request: Request) {
  return (
    request.headers.get('x-wallet-address')?.toLowerCase() ??
    request.headers.get('wallet_address')?.toLowerCase() ??
    null
  )
}

export async function getProfileByWallet(walletAddress: string): Promise<
  | { profile: Profile; error: null }
  | { profile: null; error: string }
> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .maybeSingle()

  if (error) return { profile: null, error: 'Unable to load profile' }
  if (!profile) return { profile: null, error: 'Profile not found' }
  return { profile: profile as Profile, error: null }
}

export async function getWalletAuthenticatedProfile(request: Request) {
  const wallet = getWalletAddress(request)
  if (!wallet) return { profile: null, error: 'wallet_address header is required' }
  return getProfileByWallet(wallet)
}

export function jsonOk<T>(data: T, message = 'OK', status = 200) {
  return NextResponse.json({ data, error: null, message }, { status })
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message, message }, { status })
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body: unknown = await request.json()
    return { data: schema.parse(body), error: null as string | null }
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: error.issues.map((issue) => issue.message).join(', ') }
    }

    return { data: null, error: 'Invalid JSON body' }
  }
}

export async function getAuthenticatedProfile(): Promise<
  | { profile: Profile; userId: string; error: null }
  | { profile: null; userId: null; error: string }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { profile: null, userId: null, error: 'Authentication required' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (!profile) {
    return { profile: null, userId: null, error: 'Profile not found' }
  }

  return { profile: profile as Profile, userId: session.user.id, error: null }
}

export function sanitizeError(error: unknown, fallback = 'Request failed') {
  if (error instanceof Error && error.message) {
    return fallback
  }

  return fallback
}

export function generateReferralCode(nameOrId: string) {
  const prefix = nameOrId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'LUGHA'
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${suffix}`
}

