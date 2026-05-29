'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useCusdBalance, usePurchaseContent } from '@/hooks/useContracts'
import { celoscanTx, truncateTx } from '@/lib/celoscan'

type PurchaseFlowProps = {
  contentId: string
  contentTitle: string
  creatorAddress: `0x${string}`
  priceUSD: number
  onSuccess: (txHash: `0x${string}`) => void | Promise<void>
  onClose?: () => void
}

export function PurchaseFlow({
  contentId,
  contentTitle,
  creatorAddress,
  priceUSD,
  onSuccess,
  onClose,
}: PurchaseFlowProps) {
  const { address } = useAccount()
  const { data: balance } = useCusdBalance(address)
  const { purchaseContent, step, txHash, errorMsg, reset } = usePurchaseContent()

  const priceWei = parseUnits(priceUSD.toString(), 18)
  const insufficient = balance !== undefined && balance < priceWei

  useEffect(() => {
    reset()
  }, [contentId, reset])

  async function handlePurchase() {
    if (!address || insufficient) return
    try {
      const hash = await purchaseContent({
        contentId,
        creatorAddress,
        priceUSD,
        buyerAddress: address,
      })
      if (hash) await onSuccess(hash)
    } catch {
      // error state handled in hook
    }
  }

  const balanceDisplay =
    balance !== undefined ? Number(formatUnits(balance, 18)).toFixed(2) : '—'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground/55">Unlock content</p>
      <h3 className="mt-1 font-serif text-xl font-black text-forest">{contentTitle}</h3>
      <p className="mt-1 text-sm text-foreground/60">
        Balance: <span className="font-bold text-forest">{balanceDisplay} cUSD</span>
      </p>

      <AnimatePresence mode="wait">
        {insufficient && step === 'idle' ? (
          <motion.div
            key="insufficient"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-xl bg-red-50 p-4 text-center"
          >
            <XCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-2 font-bold text-red-700">Insufficient cUSD balance</p>
            <p className="mt-1 text-sm text-red-600/80">
              You need ${priceUSD.toFixed(2)} cUSD to unlock this content.
            </p>
            <a
              href="https://minipay.opera.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground"
            >
              Add Funds via MiniPay
            </a>
          </motion.div>
        ) : null}

        {step === 'idle' && !insufficient ? (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
            <button
              type="button"
              onClick={() => void handlePurchase()}
              className="flex h-12 w-full items-center justify-center rounded-full bg-gold font-bold text-foreground hover:bg-[#e6ac00]"
            >
              Get Access — ${priceUSD.toFixed(2)} cUSD
            </button>
          </motion.div>
        ) : null}

        {(step === 'approving' || step === 'purchasing') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-forest" />
            <p className="mt-4 font-bold text-forest">
              {step === 'approving'
                ? 'Approving cUSD spend... Please confirm in wallet'
                : 'Processing payment on Celo...'}
            </p>
            {txHash ? (
              <a
                href={celoscanTx(txHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-jade"
              >
                {truncateTx(txHash)}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-jade" />
            <p className="mt-3 font-bold text-forest">Access granted!</p>
            {txHash ? (
              <a
                href={celoscanTx(txHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-jade"
              >
                View on Celoscan
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-white"
              >
                Read Now
              </button>
            ) : null}
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-xl bg-red-50 p-4 text-center"
          >
            <XCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-2 text-sm font-semibold text-red-700">{errorMsg ?? 'Transaction failed'}</p>
            <button
              type="button"
              onClick={() => {
                reset()
                void handlePurchase()
              }}
              className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
        Powered by <span className="text-forest">Celo</span> blockchain
      </p>
    </div>
  )
}
