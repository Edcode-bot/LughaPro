'use client'

import { useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { parseUnits, parseEther, keccak256, stringToHex, encodePacked } from 'viem'
import { useState } from 'react'
import {
  CONTRACT_ADDRESSES,
  LUGHA_PAYMENT_ABI,
  LUGHA_PAYMENT_V2_ABI,
  LUGHA_REFERRAL_ABI,
  LUGHA_CERTIFICATE_ABI,
  CUSD_ABI,
  USDT_ABI,
} from '@/lib/contracts'

const CONTRACTS = CONTRACT_ADDRESSES.celo

// ── Legacy V1 hook (cUSD only) ──────────────────────────────────────────────

export function usePurchaseContent() {
  const [step, setStep] = useState<'idle' | 'approving' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  async function purchaseContent(params: {
    contentId: string
    creatorAddress: `0x${string}`
    priceUSD: number
    buyerAddress: `0x${string}`
  }) {
    setStep('idle')
    setErrorMsg(null)
    try {
      const amount = parseUnits(params.priceUSD.toString(), 18)
      const contentIdBytes = keccak256(stringToHex(params.contentId))
      const purchaseId = keccak256(encodePacked(
        ['address', 'bytes32', 'uint256'],
        [params.buyerAddress, contentIdBytes, BigInt(Date.now())]
      ))

      if (!publicClient) throw new Error('Wallet not ready')

      const allowance = await publicClient.readContract({
        address: CONTRACTS.cUSD,
        abi: CUSD_ABI,
        functionName: 'allowance',
        args: [params.buyerAddress, CONTRACTS.LughaPayment],
      })

      if (allowance < amount) {
        setStep('approving')
        const approveTx = await writeContractAsync({
          address: CONTRACTS.cUSD,
          abi: CUSD_ABI,
          functionName: 'approve',
          args: [CONTRACTS.LughaPayment, amount],
        })
        setTxHash(approveTx)
        await publicClient.waitForTransactionReceipt({ hash: approveTx })
      }

      setStep('purchasing')
      const purchaseTx = await writeContractAsync({
        address: CONTRACTS.LughaPayment,
        abi: LUGHA_PAYMENT_ABI,
        functionName: 'purchaseContent',
        args: [purchaseId, params.creatorAddress, contentIdBytes, amount],
      })
      setTxHash(purchaseTx)
      await publicClient.waitForTransactionReceipt({ hash: purchaseTx })
      setStep('done')
      return purchaseTx
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      if (msg.includes('rejected') || msg.includes('denied')) {
        setErrorMsg('You cancelled the transaction.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setErrorMsg('Insufficient cUSD balance.')
      } else {
        setErrorMsg('Transaction failed. Please try again.')
      }
      setStep('error')
      throw err
    }
  }

  function reset() {
    setStep('idle')
    setTxHash(null)
    setErrorMsg(null)
  }

  return { purchaseContent, step, txHash, errorMsg, reset }
}

// ── V2 hooks (cUSD, USDT, native CELO) ─────────────────────────────────────

export function usePurchaseWithToken() {
  const [step, setStep] = useState<'idle' | 'approving' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  async function purchaseWithToken(params: {
    contentId: string
    creatorAddress: `0x${string}`
    amount: bigint
    token: `0x${string}` // CONTRACTS.cUSD or CONTRACTS.USDT
    buyerAddress: `0x${string}`
  }) {
    setStep('idle')
    setErrorMsg(null)
    try {
      if (!publicClient) throw new Error('Wallet not ready')
      if (!CONTRACTS.LughaPaymentV2) throw new Error('LughaPaymentV2 not deployed yet')

      const contentIdBytes = keccak256(stringToHex(params.contentId))
      const purchaseId = keccak256(encodePacked(
        ['address', 'bytes32', 'uint256'],
        [params.buyerAddress, contentIdBytes, BigInt(Date.now())]
      ))

      const tokenAbi = params.token === CONTRACTS.USDT ? USDT_ABI : CUSD_ABI
      const allowance = await publicClient.readContract({
        address: params.token,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [params.buyerAddress, CONTRACTS.LughaPaymentV2],
      })

      if (allowance < params.amount) {
        setStep('approving')
        const approveTx = await writeContractAsync({
          address: params.token,
          abi: tokenAbi,
          functionName: 'approve',
          args: [CONTRACTS.LughaPaymentV2, params.amount],
        })
        setTxHash(approveTx)
        await publicClient.waitForTransactionReceipt({ hash: approveTx })
      }

      setStep('purchasing')
      const purchaseTx = await writeContractAsync({
        address: CONTRACTS.LughaPaymentV2,
        abi: LUGHA_PAYMENT_V2_ABI,
        functionName: 'purchaseWithToken',
        args: [purchaseId, params.creatorAddress, contentIdBytes, params.amount, params.token],
      })
      setTxHash(purchaseTx)
      await publicClient.waitForTransactionReceipt({ hash: purchaseTx })
      setStep('done')
      return purchaseTx
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setErrorMsg('You cancelled the transaction.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setErrorMsg('Insufficient token balance.')
      } else {
        setErrorMsg('Transaction failed. Please try again.')
      }
      setStep('error')
      throw err
    }
  }

  function reset() { setStep('idle'); setTxHash(null); setErrorMsg(null) }
  return { purchaseWithToken, step, txHash, errorMsg, reset }
}

export function usePurchaseWithCELO() {
  const [step, setStep] = useState<'idle' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  async function purchaseWithCELO(params: {
    contentId: string
    creatorAddress: `0x${string}`
    priceInCelo: number
    buyerAddress: `0x${string}`
  }) {
    setStep('idle')
    setErrorMsg(null)
    try {
      if (!publicClient) throw new Error('Wallet not ready')
      if (!CONTRACTS.LughaPaymentV2) throw new Error('LughaPaymentV2 not deployed yet')

      const contentIdBytes = keccak256(stringToHex(params.contentId))
      const purchaseId = keccak256(encodePacked(
        ['address', 'bytes32', 'uint256'],
        [params.buyerAddress, contentIdBytes, BigInt(Date.now())]
      ))

      setStep('purchasing')
      const purchaseTx = await writeContractAsync({
        address: CONTRACTS.LughaPaymentV2,
        abi: LUGHA_PAYMENT_V2_ABI,
        functionName: 'purchaseWithCELO',
        args: [purchaseId, params.creatorAddress, contentIdBytes],
        value: parseEther(params.priceInCelo.toString()),
      })
      setTxHash(purchaseTx)
      await publicClient.waitForTransactionReceipt({ hash: purchaseTx })
      setStep('done')
      return purchaseTx
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setErrorMsg('You cancelled the transaction.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setErrorMsg('Insufficient CELO balance.')
      } else {
        setErrorMsg('Transaction failed. Please try again.')
      }
      setStep('error')
      throw err
    }
  }

  function reset() { setStep('idle'); setTxHash(null); setErrorMsg(null) }
  return { purchaseWithCELO, step, txHash, errorMsg, reset }
}

export function useWithdrawTokenEarnings() {
  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient()

  async function withdraw() {
    if (!CONTRACTS.LughaPaymentV2) throw new Error('LughaPaymentV2 not deployed yet')
    const hash = await writeContractAsync({
      address: CONTRACTS.LughaPaymentV2,
      abi: LUGHA_PAYMENT_V2_ABI,
      functionName: 'withdrawTokenEarnings',
      args: [],
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }
  return { withdraw, isPending }
}

export function useWithdrawCeloEarnings() {
  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient()

  async function withdraw() {
    if (!CONTRACTS.LughaPaymentV2) throw new Error('LughaPaymentV2 not deployed yet')
    const hash = await writeContractAsync({
      address: CONTRACTS.LughaPaymentV2,
      abi: LUGHA_PAYMENT_V2_ABI,
      functionName: 'withdrawCeloEarnings',
      args: [],
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }
  return { withdraw, isPending }
}

export function useCreatorBalances(creatorAddress: `0x${string}` | undefined) {
  const tokenBalance = useReadContract({
    address: CONTRACTS.LughaPaymentV2 || undefined,
    abi: LUGHA_PAYMENT_V2_ABI,
    functionName: 'getCreatorTokenBalance',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: { enabled: !!creatorAddress && !!CONTRACTS.LughaPaymentV2 },
  })
  const celoBalance = useReadContract({
    address: CONTRACTS.LughaPaymentV2 || undefined,
    abi: LUGHA_PAYMENT_V2_ABI,
    functionName: 'getCreatorCeloBalance',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: { enabled: !!creatorAddress && !!CONTRACTS.LughaPaymentV2 },
  })
  return { tokenBalance: tokenBalance.data, celoBalance: celoBalance.data }
}

// ── Shared read hooks ────────────────────────────────────────────────────────

export function useHasPurchased(buyerAddress: `0x${string}` | undefined, contentId: string) {
  const contentIdBytes = contentId ? keccak256(stringToHex(contentId)) : ('0x' + '0'.repeat(64) as `0x${string}`)
  return useReadContract({
    address: CONTRACTS.LughaPaymentV2 || CONTRACTS.LughaPayment,
    abi: LUGHA_PAYMENT_V2_ABI,
    functionName: 'hasPurchased',
    args: buyerAddress ? [buyerAddress, contentIdBytes] : undefined,
    query: { enabled: !!buyerAddress && !!contentId }
  })
}

export function useCusdBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.cUSD,
    abi: CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

export function useUsdtBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.USDT,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

export function useCreatorEarnings(creatorAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.LughaPayment,
    abi: LUGHA_PAYMENT_ABI,
    functionName: 'getCreatorBalance',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: { enabled: !!creatorAddress }
  })
}

export function useWithdrawEarnings() {
  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient()

  async function withdraw() {
    const hash = await writeContractAsync({
      address: CONTRACTS.LughaPayment,
      abi: LUGHA_PAYMENT_ABI,
      functionName: 'withdrawEarnings',
      args: [],
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }
  return { withdraw, isPending }
}

export function useRegisterReferral() {
  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient()

  async function registerReferral(referrerAddress: `0x${string}`) {
    const hash = await writeContractAsync({
      address: CONTRACTS.LughaReferral,
      abi: LUGHA_REFERRAL_ABI,
      functionName: 'registerReferral',
      args: [referrerAddress],
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }
  return { registerReferral, isPending }
}

export function useReferralEarnings(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.LughaReferral,
    abi: LUGHA_REFERRAL_ABI,
    functionName: 'getEarnings',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

export function useHasBeenReferred(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.LughaReferral,
    abi: LUGHA_REFERRAL_ABI,
    functionName: 'hasBeenReferred',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

export function useStudentCertificates(studentAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.LughaCertificate,
    abi: LUGHA_CERTIFICATE_ABI,
    functionName: 'getStudentCertificates',
    args: studentAddress ? [studentAddress] : undefined,
    query: { enabled: !!studentAddress }
  })
}

export function useCertificateData(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.LughaCertificate,
    abi: LUGHA_CERTIFICATE_ABI,
    functionName: 'getCertificate',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined }
  })
}

export function useBookingEscrow() {
  return {
    createBooking: async (..._args: unknown[]) => { throw new Error('Use usePurchaseWithToken instead') },
    confirmCompletion: async (..._args: unknown[]) => { throw new Error('Use usePurchaseWithToken instead') },
    cancelBooking: async (..._args: unknown[]) => { throw new Error('Not applicable') },
    disputeBooking: async (..._args: unknown[]) => { throw new Error('Not applicable') },
    approveToken: async (..._args: unknown[]) => { throw new Error('Use usePurchaseWithToken instead') },
    getBooking: (..._args: unknown[]) => null,
    isLoading: false,
    error: null,
  }
}

export function useCertificates(_address?: string) {
  return { data: [], isLoading: false, error: null }
}

export function useReferralRewards() {
  return {
    registerCode: async (..._args: unknown[]) => { throw new Error('Use useRegisterReferral instead') },
    claimReward: async (..._args: unknown[]) => { throw new Error('Not applicable') },
    getEarnings: async () => BigInt(0),
    isLoading: false,
    error: null,
  }
}

export function useNativeOrCusdToken(paymentMethod: string) {
  return paymentMethod.toLowerCase() === 'cusd'
    ? CONTRACT_ADDRESSES.celo.cUSD
    : '0x0000000000000000000000000000000000000000'
}

export function toEscrowAmount(price: string) {
  return parseUnits(price, 18)
}
