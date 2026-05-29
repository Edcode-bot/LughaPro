'use client'

import { ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { useCreatorEarnings, useWithdrawEarnings } from '@/hooks/useContracts'
import { celoscanTx, truncateTx } from '@/lib/celoscan'

export function EarningsWithdraw({ compact = false }: { compact?: boolean }) {
  const { address } = useAccount()
  const { data: balance, refetch } = useCreatorEarnings(address)
  const { withdraw, isPending } = useWithdrawEarnings()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash ?? undefined })

  const balanceCusd =
    balance !== undefined ? Number(formatUnits(balance, 18)).toFixed(2) : '0.00'

  async function handleWithdraw() {
    if (!address || !balance || balance === 0n) return
    setError(null)
    setSuccess(false)
    try {
      const hash = await withdraw()
      setTxHash(hash)
      setSuccess(true)
      await refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed'
      if (msg.includes('rejected') || msg.includes('denied')) {
        setError('You cancelled the transaction.')
      } else if (msg.includes('No earnings')) {
        setError('No on-chain earnings to withdraw.')
      } else {
        setError('Withdrawal failed. Please try again.')
      }
    }
  }

  if (compact) {
    return (
      <div className="mt-6 rounded-xl border border-forest/15 bg-cream p-4">
        <p className="text-sm font-semibold text-forest">On-chain balance: {balanceCusd} cUSD</p>
        <p className="mt-1 text-xs text-foreground/55">Platform fee: 15% per sale · You receive: 85%</p>
        <button
          type="button"
          disabled={isPending || confirming || balance === 0n}
          onClick={() => void handleWithdraw()}
          className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground disabled:opacity-50"
        >
          {isPending || confirming ? 'Withdrawing...' : 'Withdraw to Wallet'}
        </button>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        {success && txHash ? (
          <a href={celoscanTx(txHash)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-jade">
            Withdrawn · {truncateTx(txHash)} <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <section className="mt-8 rounded-2xl bg-forest p-8 text-cream">
      <p className="text-sm text-cream/70">On-chain balance (smart contract)</p>
      <p className="mt-2 font-serif text-5xl font-black text-gold">{balanceCusd} cUSD</p>
      <p className="mt-2 text-sm text-cream/70">Platform fee: 15% per sale · You receive: 85%</p>
      <button
        type="button"
        disabled={isPending || confirming || balance === 0n}
        onClick={() => void handleWithdraw()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50"
      >
        {(isPending || confirming) && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending || confirming ? 'Processing withdrawal...' : 'Withdraw to Wallet'}
      </button>
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-jade">Withdrawn successfully!</p> : null}
      {txHash ? (
        <a
          href={celoscanTx(txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gold"
        >
          {truncateTx(txHash)} on Celoscan
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  )
}
