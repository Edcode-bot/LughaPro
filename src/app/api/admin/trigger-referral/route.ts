import { isAddress } from 'viem'
import { jsonError, jsonOk } from '@/lib/api'
import { assertAdminSecret, triggerReferralRewardOnChain } from '@/lib/admin-wallet'

export async function POST(request: Request) {
  if (!assertAdminSecret(request)) {
    return jsonError('Unauthorized', 401)
  }

  try {
    const body = await request.json() as { userAddress?: string }
    const userAddress = body.userAddress?.toLowerCase()
    if (!userAddress || !isAddress(userAddress)) {
      return jsonError('Valid userAddress is required', 422)
    }

    const hash = await triggerReferralRewardOnChain(userAddress as `0x${string}`)
    return jsonOk({ tx_hash: hash }, 'Referral reward triggered')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Referral trigger failed'
    return jsonOk({ skipped: true, reason: message }, 'Referral trigger skipped')
  }
}
