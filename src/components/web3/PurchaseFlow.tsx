'use client'

import { useState } from 'react'
import { parseUnits, keccak256, stringToHex, encodePacked, formatUnits } from 'viem'
import { useWriteContract, useReadContract, useAccount, usePublicClient, useBalance } from 'wagmi'
import { CONTRACT_ADDRESSES, LUGHA_PAYMENT_ABI, CUSD_ABI } from '@/lib/contracts'
import { ContentType } from '@/types'

type PaymentMethod = 'cusd' | 'celo'

function isMiniPay() {
  if (typeof window === 'undefined') return false
  return (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true
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
  onSuccess: () => void
}) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [step, setStep] = useState<'idle' | 'approving' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isMiniPay() ? 'cusd' : 'cusd')
  const { writeContractAsync } = useWriteContract()

  const { data: cusdBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celo.cUSD,
    abi: CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: celoBalance } = useBalance({ address: address ?? undefined })

  const amount = parseUnits(priceUSD.toString(), 18)
  const cusdEnough = cusdBalance !== undefined && cusdBalance >= amount
  const celoEnough = celoBalance !== undefined && celoBalance.value >= amount

  const selectedBalance = paymentMethod === 'cusd' ? cusdBalance : celoBalance?.value
  const hasEnough = paymentMethod === 'cusd' ? cusdEnough : celoEnough

  const cusdFormatted = cusdBalance !== undefined ? Number(formatUnits(cusdBalance, 18)).toFixed(2) : '—'
  const celoFormatted = celoBalance !== undefined ? Number(formatUnits(celoBalance.value, 18)).toFixed(4) : '—'

  async function handleCusdPurchase() {
    if (!address) return
    const contentIdBytes = keccak256(stringToHex(contentId)) as `0x${string}`
    const purchaseId = keccak256(encodePacked(
      ['address', 'bytes32', 'uint256'],
      [address, contentIdBytes, BigInt(Date.now())],
    )) as `0x${string}`

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

    await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({ content_id: contentId, content_type: contentType, amount: priceUSD, payment_method: 'cusd', tx_hash: hash }),
    })

    setTxHash(hash)
    setStep('done')
  }

  async function handleCeloPurchase() {
    if (!address) return
    setStep('purchasing')
    // CELO payment: record in DB with pending_verification status (contract upgrade pending)
    await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({ content_id: contentId, content_type: contentType, amount: priceUSD, payment_method: 'celo', status: 'pending_verification' }),
    })
    setStep('done')
  }

  async function handlePurchase() {
    setError('')
    try {
      if (paymentMethod === 'cusd') {
        await handleCusdPurchase()
      } else {
        await handleCeloPurchase()
      }
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setError('Transaction cancelled.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setError(`Not enough ${paymentMethod === 'cusd' ? 'cUSD' : 'CELO'} in your wallet.`)
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
        <h3 className="mt-3 font-serif text-xl font-black text-forest">
          {paymentMethod === 'celo' ? 'Payment Recorded!' : 'Access Granted!'}
        </h3>
        <p className="mt-1 text-sm text-foreground/60">{contentTitle}</p>
        {paymentMethod === 'celo' ? (
          <p className="mt-3 rounded-xl bg-cream p-3 text-sm text-foreground/70">
            CELO payment recorded. Access will be granted within 5 minutes after on-chain confirmation.
          </p>
        ) : null}
        {txHash ? (
          <a href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-xs text-forest underline">
            View on Celoscan ↗
          </a>
        ) : null}
        <button type="button" onClick={onSuccess} className="mt-4 w-full rounded-full bg-gold py-3 font-black text-foreground">
          {paymentMethod === 'celo' ? 'Go to Library' : 'Read Now'}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="font-serif text-xl font-black text-forest">Get Access</h3>
      <p className="mt-1 text-sm text-foreground/60">{contentTitle}</p>

      {/* Payment method selector — hidden inside MiniPay */}
      {!isMiniPay() && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('cusd')}
            className={`rounded-xl border-2 p-3 text-left text-sm transition ${paymentMethod === 'cusd' ? 'border-forest bg-cream' : 'border-forest/10 bg-white hover:border-forest/30'}`}
          >
            <p className="font-bold text-forest">Pay with cUSD</p>
            <p className="mt-0.5 text-xs text-foreground/60">Balance: {cusdFormatted} cUSD</p>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('celo')}
            className={`rounded-xl border-2 p-3 text-left text-sm transition ${paymentMethod === 'celo' ? 'border-forest bg-cream' : 'border-forest/10 bg-white hover:border-forest/30'}`}
          >
            <p className="font-bold text-forest">Pay with CELO</p>
            <p className="mt-0.5 text-xs text-foreground/60">Balance: {celoFormatted} CELO</p>
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-off-white p-4">
        <span className="font-semibold">Price</span>
        <span className="font-black text-forest">
          {priceUSD} {paymentMethod === 'cusd' ? 'cUSD' : 'CELO'}
        </span>
      </div>

      {/* Balance warning */}
      {selectedBalance !== undefined && !hasEnough ? (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">
            Not enough {paymentMethod === 'cusd' ? 'cUSD' : 'CELO'} in your wallet.
          </p>
          {paymentMethod === 'cusd' ? (
            <p className="mt-1">
              Your balance: {cusdFormatted} cUSD — need {priceUSD} cUSD.{' '}
              {isMiniPay()
                ? 'Top up via MiniPay.'
                : <a href="https://app.ubeswap.org" className="underline" target="_blank" rel="noopener noreferrer">Swap on Ubeswap →</a>
              }
            </p>
          ) : (
            <p className="mt-1">
              Your balance: {celoFormatted} CELO — need approx {priceUSD} CELO.{' '}
              <a href="https://app.ubeswap.org" className="underline" target="_blank" rel="noopener noreferrer">Get CELO on Ubeswap →</a>
            </p>
          )}
          <a
            href="https://app.ubeswap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700"
          >
            Add Funds →
          </a>
        </div>
      ) : null}

      {paymentMethod === 'celo' && hasEnough ? (
        <p className="mt-3 rounded-xl bg-cream p-3 text-xs text-foreground/70">
          CELO payments are recorded immediately. Access is granted within 5 minutes after on-chain confirmation.
        </p>
      ) : null}

      {step === 'approving' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <span className="text-sm font-semibold">Approving cUSD spend… confirm in wallet</span>
        </div>
      ) : null}

      {step === 'purchasing' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <span className="text-sm font-semibold">Processing payment on Celo…</span>
        </div>
      ) : null}

      {step === 'error' ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void handlePurchase()}
        disabled={!hasEnough || step === 'approving' || step === 'purchasing'}
        className="mt-4 w-full rounded-full bg-gold py-3 font-black text-foreground disabled:opacity-50"
      >
        {step === 'idle' || step === 'error'
          ? `Pay ${priceUSD} ${paymentMethod === 'cusd' ? 'cUSD' : 'CELO'}`
          : 'Processing…'}
      </button>
      <p className="mt-2 text-center text-xs text-foreground/40">Powered by Celo blockchain</p>
    </div>
  )
}
