'use client'

import { useState } from 'react'
import { parseUnits, keccak256, stringToHex, encodePacked, formatUnits } from 'viem'
import { useWriteContract, useReadContract, useAccount, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES, LUGHA_PAYMENT_ABI, CUSD_ABI } from '@/lib/contracts'
import { ContentType } from '@/types'

function truncateHash(hash: string) {
  if (hash.length < 20) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export function PurchaseFlow({
  contentId,
  contentTitle,
  contentType = 'book',
  creatorAddress,
  priceUSD,
  onSuccess,
}: {
  contentId: string
  contentTitle: string
  contentType?: ContentType
  creatorAddress: `0x${string}`
  priceUSD: number
  onSuccess: (txHash?: string) => void
}) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [step, setStep] = useState<'idle' | 'approving' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const { writeContractAsync } = useWriteContract()

  const { data: cusdBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celo.cUSD,
    abi: CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const amount = parseUnits(priceUSD.toString(), 18)
  const hasEnoughBalance = cusdBalance !== undefined && cusdBalance >= amount
  const cusdFormatted = cusdBalance !== undefined ? Number(formatUnits(cusdBalance, 18)).toFixed(2) : '—'

  async function handlePurchase() {
    if (!address) return
    setError('')

    try {
      const contentIdBytes = keccak256(stringToHex(contentId)) as `0x${string}`
      const purchaseId = keccak256(encodePacked(
        ['address', 'bytes32', 'uint256'],
        [address, contentIdBytes, BigInt(Date.now())],
      )) as `0x${string}`

      // Step 1: approve cUSD spend
      setStep('approving')
      const approveHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.celo.cUSD,
        abi: CUSD_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.celo.LughaPayment, amount],
      })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
      }

      // Step 2: call LughaPayment.purchaseContent — this is the contract interaction
      // that shows up on Talent App at 0xFaBAC9A356C001dC3B32352e9b0f0B4D7c171B41
      setStep('purchasing')
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.celo.LughaPayment,
        abi: LUGHA_PAYMENT_ABI,
        functionName: 'purchaseContent',
        args: [purchaseId, creatorAddress, contentIdBytes, amount],
      })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }

      setTxHash(hash)

      // Record purchase in DB immediately — no waiting, access is instant
      await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address,
        },
        body: JSON.stringify({
          content_id: contentId,
          content_type: contentType,
          amount: priceUSD,
          payment_method: 'cusd',
          tx_hash: hash,
          status: 'paid',
        }),
      })

      setStep('done')
      onSuccess(hash)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setError('Transaction cancelled.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setError('Not enough cUSD in your wallet. You need cUSD — not CELO — to pay.')
      } else {
        setError('Transaction failed. Please try again.')
      }
      setStep('error')
    }
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-4xl">✅</div>
        <h3 className="mt-3 font-serif text-xl font-black text-forest">Access Granted!</h3>
        <p className="mt-1 text-sm text-foreground/60">{contentTitle}</p>
        <p className="mt-3 text-sm font-semibold text-jade">Transaction confirmed on Celo blockchain ✓</p>
        {txHash ? (
          <div className="mt-2">
            <p className="font-mono text-xs text-foreground/50">Hash: {truncateHash(txHash)}</p>
            <a
              href={`https://celoscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-forest underline"
            >
              View on Celoscan ↗
            </a>
          </div>
        ) : null}
        <button type="button" onClick={() => onSuccess(txHash)} className="mt-5 w-full rounded-full bg-gold py-3 font-black text-foreground">
          Read Now
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="font-serif text-xl font-black text-forest">Unlock Full Access</h3>
      <p className="mt-1 text-sm text-foreground/60">{contentTitle}</p>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-off-white p-4">
        <span className="font-semibold">Price</span>
        <span className="font-black text-forest">{priceUSD} cUSD</span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-4 py-2 text-sm">
        <span className="text-foreground/60">Your cUSD balance</span>
        <span className={`font-bold ${hasEnoughBalance ? 'text-jade' : 'text-red-600'}`}>{cusdFormatted} cUSD</span>
      </div>

      {cusdBalance !== undefined && !hasEnoughBalance ? (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">Not enough cUSD in your wallet.</p>
          <p className="mt-1">
            You need <strong>{priceUSD} cUSD</strong> but have <strong>{cusdFormatted} cUSD</strong>.
            {' '}cUSD is a stablecoin on Celo — it is different from CELO.
          </p>
          <a
            href="https://app.ubeswap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700"
          >
            Swap CELO → cUSD on Ubeswap ↗
          </a>
        </div>
      ) : null}

      {step === 'approving' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <span className="text-sm font-semibold">Step 1/2 — Approving cUSD spend… confirm in wallet</span>
        </div>
      ) : null}

      {step === 'purchasing' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <span className="text-sm font-semibold">Step 2/2 — Processing payment on Celo…</span>
        </div>
      ) : null}

      {step === 'error' ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void handlePurchase()}
        disabled={!hasEnoughBalance || step === 'approving' || step === 'purchasing'}
        className="mt-4 w-full rounded-full bg-gold py-3 font-black text-foreground disabled:opacity-50"
      >
        {step === 'idle' || step === 'error' ? `Pay ${priceUSD} cUSD` : 'Processing…'}
      </button>
      <p className="mt-2 text-center text-xs text-foreground/40">
        Powered by LughaPayment contract · Celo blockchain
      </p>
    </div>
  )
}
