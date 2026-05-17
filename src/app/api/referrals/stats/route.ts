import { getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('referrals').select('*').eq('referrer_id', auth.userId)

  if (error) return jsonError('Unable to load referral stats', 500)

  const referrals = data ?? []
  const pending = referrals.filter((item) => item.status === 'pending').length
  const rewarded = referrals.filter((item) => item.status === 'rewarded').length
  const totalEarned = referrals
    .filter((item) => item.status === 'rewarded')
    .reduce((sum, item) => sum + Number(item.reward_amount ?? 0), 0)

  return jsonOk({ total_referrals: referrals.length, pending, rewarded, total_earned: totalEarned }, 'Referral stats loaded')
}

