'use client'

import { useState } from 'react'
import { parseUnits, parseEther, keccak256, stringToHex, encodePacked, formatUnits } from 'viem'
import { useWriteContract, useReadContract, useAccount, usePublicClient, useBalance, useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, LUGHA_PAYMENT_V2_ABI, CUSD_ABI, USDT_ABI } from '@/lib/contracts'
import { ContentType } from '@/types'

type PaymentToken = 'cusd' | 'usdt' | 'celo'

function truncateHash(hash: string) {
  if (hash.length < 20) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

function tokenLabel(token: PaymentToken) {
  if (token === 'cusd') return 'cUSD'
  if (token === 'usdt') return 'USDT'
  return 'CELO'
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
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [step, setStep] = useState<'idle' | 'approving' | 'purchasing' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [payToken, setPayToken] = useState<PaymentToken>('cusd')
  const { writeContractAsync } = useWriteContract()

  // Token balances
  const { data: cusdBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celo.cUSD,
    abi: CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: usdtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celo.USDT,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: celoBalanceData } = useBalance({
    address: address ?? undefined,
    query: { enabled: !!address },
  })

  const amount = parseUnits(priceUSD.toString(), 18)

  const balances = {
    cusd: cusdBalance ?? BigInt(0),
    usdt: usdtBalance ?? BigInt(0),
    celo: celoBalanceData?.value ?? BigInt(0),
  }

  const hasEnough = balances[payToken] >= amount

  function fmtBalance(val: bigint) {
    return Number(formatUnits(val, 18)).toFixed(2)
  }

  async function handlePurchase() {
    if (!address) return
    setError('')

    console.log('Starting payment:', { paymentMethod: payToken, priceUSD, creatorAddress })

    // Guard: creator wallet must be a valid non-zero address
    if (!creatorAddress || creatorAddress === '0x0000000000000000000000000000000000000000') {
      setError('Creator wallet address not found. Cannot process payment.')
      setStep('error')
      return
    }

    if (chainId !== 42220) {
      setError('Please switch MetaMask to Celo Mainnet (Chain ID: 42220) before paying.')
      setStep('error')
      return
    }

    try {
      const contentIdBytes = keccak256(stringToHex(contentId)) as `0x${string}`
      const purchaseId = keccak256(encodePacked(
        ['address', 'bytes32', 'uint256'],
        [address, contentIdBytes, BigInt(Date.now())],
      )) as `0x${string}`

      const creatorWalletAddress = creatorAddress as `0x${string}`
      let hash: `0x${string}`

      if (payToken === 'celo') {
        setStep('purchasing')
        try {
          const celoAmount = parseEther(String(priceUSD))
          const creatorAddr = creatorAddress as `0x${string}`

          console.log('Calling purchaseWithCELO:', {
            contract: CONTRACT_ADDRESSES.celo.LughaPaymentV2,
            purchaseId,
            creator: creatorAddr,
            contentId: contentIdBytes,
            value: celoAmount.toString(),
          })

          hash = await writeContractAsync({
            address: CONTRACT_ADDRESSES.celo.LughaPaymentV2,
            abi: LUGHA_PAYMENT_V2_ABI,
            functionName: 'purchaseWithCELO',
            args: [purchaseId, creatorAddr, contentIdBytes],
            value: celoAmount,
            chainId: 42220,
          })

          console.log('Transaction hash:', hash)
        } catch (celoErr: unknown) {
          console.error('CELO payment error:', celoErr)
          const msg = celoErr instanceof Error ? celoErr.message : String(celoErr)
          if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancel')) {
            setError('You cancelled the transaction.')
          } else if (msg.includes('insufficient') || msg.includes('funds')) {
            setError('Not enough CELO. You need CELO for both the payment and gas fees.')
          } else if (msg.includes('network') || msg.includes('chain')) {
            setError('Wrong network. Please switch MetaMask to Celo Mainnet (Chain ID: 42220).')
          } else {
            setError(`Payment failed: ${msg.slice(0, 100)}`)
          }
          setStep('error')
          return
        }
      } else {
        // cUSD or USDT — approve then purchaseWithToken
        const paymentToken = payToken === 'usdt' ? CONTRACT_ADDRESSES.celo.USDT : CONTRACT_ADDRESSES.celo.cUSD
        const tokenAbi = payToken === 'usdt' ? USDT_ABI : CUSD_ABI

        setStep('approving')
        const approveHash = await writeContractAsync({
          address: paymentToken,
          abi: tokenAbi,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.celo.LughaPaymentV2, amount],
          chainId: 42220,
        })
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash: approveHash })

        setStep('purchasing')
        hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.celo.LughaPaymentV2,
          abi: LUGHA_PAYMENT_V2_ABI,
          functionName: 'purchaseWithToken',
          args: [purchaseId, creatorWalletAddress, contentIdBytes, amount, paymentToken],
          chainId: 42220,
        })
      }

      if (publicClient) await publicClient.waitForTransactionReceipt({ hash })

      setTxHash(hash)
      setStep('done')
      onSuccess(hash)

      // Record to DB after showing success — failures here must not show "Transaction failed"
      try {
        const recordRes = await fetch('/api/purchases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address,
          },
          body: JSON.stringify({
            content_id: contentId,
            content_type: contentType,
            amount: priceUSD,
            payment_method: payToken,
            tx_hash: hash,
            status: 'paid',
          }),
        })
        const recordData = await recordRes.json() as { error?: string }
        if (!recordRes.ok || recordData.error) {
          console.error('Failed to record purchase in DB (on-chain tx succeeded):', recordData)
        }
      } catch (recordErr) {
        console.error('Purchase recording network error (on-chain tx succeeded):', recordErr)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
        setError('Transaction cancelled.')
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setError(`Not enough ${tokenLabel(payToken)} in your wallet.`)
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
        <button type="button" onClick={() => onSuccess(txHash)} className="mt-5 w-full rounded-full bg-[#FFBF00] py-3 font-black text-[#171717]">
          Read Now
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="font-serif text-xl font-black text-[#1a4731]">Unlock Full Access</h3>
      <p className="mt-1 text-sm text-foreground/60">{contentTitle}</p>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8f4ef] p-4">
        <span className="font-semibold">Price</span>
        <span className="font-black text-[#1a4731]">{priceUSD} USD</span>
      </div>

      {/* Token selector */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-foreground/55">Pay with</p>
        <div className="flex gap-2">
          {(['cusd', 'usdt', 'celo'] as PaymentToken[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPayToken(t)}
              className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${
                payToken === t
                  ? 'border-[#FFBF00] bg-[#FFBF00] text-[#171717]'
                  : 'border-gray-200 text-gray-500 hover:border-[#171717]'
              }`}
            >
              {tokenLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Balance row */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#fdf6e3] px-4 py-2 text-sm">
        <span className="text-foreground/60">Your {tokenLabel(payToken)} balance</span>
        <span className={`font-bold ${hasEnough ? 'text-[#2d6a4f]' : 'text-red-600'}`}>
          {fmtBalance(balances[payToken])} {tokenLabel(payToken)}
        </span>
      </div>

      {!hasEnough ? (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">Not enough {tokenLabel(payToken)}.</p>
          <p className="mt-1">You need <strong>{priceUSD} {tokenLabel(payToken)}</strong> but have <strong>{fmtBalance(balances[payToken])}</strong>.</p>
          {payToken !== 'celo' ? (
            <a
              href="https://app.ubeswap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700"
            >
              Swap on Ubeswap ↗
            </a>
          ) : null}
        </div>
      ) : null}

      {step === 'approving' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#fdf6e3] p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FFBF00] border-t-transparent" />
          <span className="text-sm font-semibold">Approving {tokenLabel(payToken)} spend… confirm in wallet</span>
        </div>
      ) : null}

      {step === 'purchasing' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#fdf6e3] p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FFBF00] border-t-transparent" />
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
        className="mt-4 w-full rounded-full bg-[#FFBF00] py-3 font-black text-[#171717] disabled:opacity-50"
      >
        {step === 'idle' || step === 'error' ? `Pay ${priceUSD} ${tokenLabel(payToken)}` : 'Processing…'}
      </button>
      <p className="mt-2 text-center text-xs text-foreground/40">
        Powered by Celo blockchain
      </p>
    </div>
  )
}
