import { generateReferralCode, getAuthenticatedProfile, getWalletAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const walletAuth = await getWalletAuthenticatedProfile(request)
  const sessionAuth = walletAuth.profile ? null : await getAuthenticatedProfile()
  const profile = walletAuth.profile ?? sessionAuth?.profile ?? null

  if (!profile) {
    return jsonError(walletAuth.error ?? sessionAuth?.error ?? 'Authentication required', 401)
  }

  let referralCode = profile.referral_code

  if (!referralCode) {
    referralCode = generateReferralCode(profile.full_name || profile.id)
    const client = walletAuth.profile ? supabaseAdmin : await createServerSupabaseClient()
    const { error } = await client.from('profiles').update({ referral_code: referralCode }).eq('id', profile.id)
    if (error) return jsonError('Unable to generate referral code', 500)
  }

  const origin = new URL(request.url).origin

  return jsonOk({
    referral_code: referralCode,
    referral_link: `${origin}/?ref=${referralCode}`,
    total_referred: 0,
    total_earned: 0,
  }, 'Referral code ready')
}

