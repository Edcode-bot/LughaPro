'use client'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface TransparencyStats {
  creators: number
  content_items: number
  transactions: number
  volume: string
  certificates_minted: number
  recent_transactions: { amount: string; method: string; tx_hash: string; date: string }[]
  contract_address: string
}

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats | null>(null)

  useEffect(() => {
    fetch('/api/stats/transparency').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return (
    <DashboardLayout>
      <div className="animate-pulse text-gray-400">Loading...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-3xl">

        {/* Hero */}
        <div className="rounded-2xl border border-gray-100 bg-white p-7 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#fdf6e3] border border-[#FFBF00]/30 flex items-center justify-center text-[#1a4731]">🌿</div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LughaPro · Transparency</span>
          </div>
          <h1 className="font-serif text-2xl font-black text-[#171717] mb-2">
            Every transaction, verifiable on-chain
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            LughaPro runs on Celo mainnet. Every purchase, every creator payout, every certificate minted is recorded immutably on the blockchain — not in a private database you have to trust us about.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Creators', value: stats.creators },
            { label: 'Content Items', value: stats.content_items },
            { label: 'On-chain Transactions', value: stats.transactions },
            { label: 'Certificates Minted', value: stats.certificates_minted },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-[#f8f4ef] p-4">
              <div className="text-xl font-black text-[#171717]">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* On-chain accountability */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6 flex gap-4">
          <div className="h-9 w-9 rounded-lg bg-[#fdf6e3] border border-[#FFBF00]/30 flex items-center justify-center text-[#1a4731] flex-shrink-0">⛓️</div>
          <div>
            <p className="font-bold text-sm text-[#171717] mb-1">Smart contract accountability</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every payment runs through our LughaPaymentV2 contract on Celo mainnet. Creator earnings, platform fees, and certificate mints are all readable by anyone, anytime, with no admin override.
            </p>
            <a href={`https://celoscan.io/address/${stats.contract_address}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#1a4731] hover:underline">
              View contract on Celoscan →
            </a>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent on-chain activity</p>
          {stats.recent_transactions.length === 0 ? (
            <p className="text-sm text-gray-400">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">{tx.amount} {tx.method?.toUpperCase()}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                  {tx.tx_hash && (
                    <a href={`https://celoscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-mono text-[#1a4731] hover:underline">
                      {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
