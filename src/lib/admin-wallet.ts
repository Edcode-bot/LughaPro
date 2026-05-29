import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { celo } from 'viem/chains'
import { CONTRACT_ADDRESSES, LUGHA_CERTIFICATE_ABI, LUGHA_REFERRAL_ABI } from '@/lib/contracts'

function getAdminAccount() {
  const key = process.env.DEPLOYER_PRIVATE_KEY
  if (!key) throw new Error('DEPLOYER_PRIVATE_KEY is not configured')
  return privateKeyToAccount(key.startsWith('0x') ? (key as `0x${string}`) : (`0x${key}` as `0x${string}`))
}

export function getAdminWalletClient() {
  const account = getAdminAccount()
  return createWalletClient({
    account,
    chain: celo,
    transport: http(process.env.CELO_MAINNET_RPC ?? 'https://forno.celo.org'),
  })
}

export async function triggerReferralRewardOnChain(userAddress: `0x${string}`) {
  const client = getAdminWalletClient()
  return client.writeContract({
    address: CONTRACT_ADDRESSES.celo.LughaReferral,
    abi: LUGHA_REFERRAL_ABI,
    functionName: 'triggerReferralReward',
    args: [userAddress],
  })
}

export async function mintCertificateOnChain(params: {
  studentAddress: `0x${string}`
  courseName: string
  level: string
  creatorName: string
  tokenURI: string
}) {
  const client = getAdminWalletClient()
  return client.writeContract({
    address: CONTRACT_ADDRESSES.celo.LughaCertificate,
    abi: LUGHA_CERTIFICATE_ABI,
    functionName: 'mintCertificate',
    args: [
      params.studentAddress,
      params.courseName,
      params.level,
      params.creatorName,
      params.tokenURI,
    ],
  })
}

export function buildCertificateTokenUri(metadata: {
  courseName: string
  creatorName: string
  level: string
}) {
  const json = JSON.stringify({
    name: `LughaPro Certificate — ${metadata.courseName}`,
    description: `Issued by ${metadata.creatorName} on LughaPro`,
    image: 'https://lugha-pro.vercel.app/certificate-image.png',
    attributes: [
      { trait_type: 'Level', value: metadata.level },
      { trait_type: 'Course', value: metadata.courseName },
    ],
  })
  return `data:application/json;base64,${Buffer.from(json).toString('base64')}`
}

export function assertAdminSecret(request: Request) {
  const header =
    request.headers.get('x-admin-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return header === process.env.ADMIN_SECRET
}
