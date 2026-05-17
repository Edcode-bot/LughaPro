import { generateReferralCode, getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  let referralCode = auth.profile.referral_code

  if (!referralCode) {
    referralCode = generateReferralCode(auth.profile.full_name || auth.userId)
    const { error } = await supabase.from('profiles').update({ referral_code: referralCode }).eq('id', auth.userId)
    if (error) return jsonError('Unable to generate referral code', 500)
  }

  const origin = new URL(request.url).origin

  return jsonOk({ referral_code: referralCode, referral_link: `${origin}/auth/register?ref=${referralCode}` }, 'Referral code ready')
}

