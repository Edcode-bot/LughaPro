import { formatUnits } from 'viem'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { generateReferralCode, getAuthenticatedProfile, getWalletAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { CONTRACT_ADDRESSES, LUGHA_REFERRAL_ABI } from '@/lib/contracts'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase'

const publicClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_MAINNET_RPC ?? 'https://forno.celo.org'),
})

export async function POST(request: Request) {
  const walletAuth = await getWalletAuthenticatedProfile(request)
  const sessionAuth = walletAuth.profile ? null : await getAuthenticatedProfile()
  const profile = walletAuth.profile ?? sessionAuth?.profile ?? null

  if (!profile) {
    return jsonError(walletAuth.error ?? sessionAuth?.error ?? 'Authentication required', 401)
  }

  const wallet = profile.wallet_address?.toLowerCase()
  if (!wallet) {
    return jsonError('Connect a wallet to use referrals', 422)
  }

  let referralCode = profile.referral_code
  if (!referralCode) {
    referralCode = generateReferralCode(profile.full_name || profile.id)
    const client = walletAuth.profile ? supabaseAdmin : await createServerSupabaseClient()
    const { error } = await client.from('profiles').update({ referral_code: referralCode }).eq('id', profile.id)
    if (error) return jsonError('Unable to generate referral code', 500)
  }

  let totalEarned = 0
  try {
    const earnings = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.celo.LughaReferral,
      abi: LUGHA_REFERRAL_ABI,
      functionName: 'getEarnings',
      args: [wallet as `0x${string}`],
    })
    totalEarned = Number(formatUnits(earnings, 18))
  } catch {
    totalEarned = 0
  }

  return jsonOk({
    referral_code: wallet,
    referral_link: `https://lugha-pro.vercel.app?ref=${wallet}`,
    total_referred: 0,
    total_earned: totalEarned,
  }, 'Referral code ready')
}
