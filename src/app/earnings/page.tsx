'use client'

import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import { Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { shortenAddress } from '@/lib/minipay'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { useCreatorBalances, useWithdrawTokenEarnings, useWithdrawCeloEarnings } from '@/hooks/useContracts'
import { WalletRequired } from '@/components/WalletRequired'
import { EarningsSummary } from '@/types'

export default function EarningsPage() {
  return (
    <AuthGuard>
      <EarningsClient />
    </AuthGuard>
  )
}

function EarningsClient() {
  const { address } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawingToken, setWithdrawingToken] = useState(false)
  const [withdrawingCelo, setWithdrawingCelo] = useState(false)
  const [withdrawalWallet, setWithdrawalWallet] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lugha_profile')
      if (stored) {
        const p = JSON.parse(stored) as Record<string, unknown>
        setWithdrawalWallet((p.withdrawal_wallet as string | undefined) ?? '')
      }
    } catch { /* ignore */ }
  }, [])

  const wallet = address as `0x${string}` | undefined
  const { tokenBalance, celoBalance } = useCreatorBalances(wallet)
  const { withdraw: withdrawToken } = useWithdrawTokenEarnings()
  const { withdraw: withdrawCelo } = useWithdrawCeloEarnings()

  useEffect(() => {
    if (!address) return
    fetch('/api/earnings', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result) => setData(result.data ?? { total_earned: 0, monthly: [], recent: [] }))
      .finally(() => setLoading(false))
  }, [address])

  async function handleWithdrawToken() {
    setWithdrawingToken(true)
    try {
      const hash = await withdrawToken()
      toast({ title: 'cUSD withdrawn!', description: `Tx: ${hash.slice(0, 18)}…`, type: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed'
      toast({ title: 'Withdrawal failed', description: msg.slice(0, 120), type: 'error' })
    } finally {
      setWithdrawingToken(false)
    }
  }

  async function handleWithdrawCelo() {
    setWithdrawingCelo(true)
    try {
      const hash = await withdrawCelo()
      toast({ title: 'CELO withdrawn!', description: `Tx: ${hash.slice(0, 18)}…`, type: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed'
      toast({ title: 'Withdrawal failed', description: msg.slice(0, 120), type: 'error' })
    } finally {
      setWithdrawingCelo(false)
    }
  }

  const tokenBalanceFmt = tokenBalance !== undefined ? Number(formatUnits(tokenBalance, 18)).toFixed(4) : '—'
  const celoBalanceFmt = celoBalance !== undefined ? Number(formatUnits(celoBalance, 18)).toFixed(4) : '—'
  const hasTokenEarnings = tokenBalance !== undefined && tokenBalance > BigInt(0)
  const hasCeloEarnings = celoBalance !== undefined && celoBalance > BigInt(0)

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Earnings</h1>

          {/* On-chain balance cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* Token earnings (cUSD) */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Token Earnings (cUSD)</p>
              <p className="mt-2 font-serif text-3xl font-black text-[#1a4731]">{tokenBalanceFmt}</p>
              <p className="text-sm text-foreground/50">cUSD on-chain</p>
              <WalletRequired>
                <button
                  type="button"
                  onClick={() => void handleWithdrawToken()}
                  disabled={!hasTokenEarnings || withdrawingToken}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFBF00] px-5 py-2 text-sm font-black text-[#171717] disabled:opacity-40"
                >
                  {withdrawingToken && <Loader2 className="h-4 w-4 animate-spin" />}
                  Withdraw cUSD
                </button>
              </WalletRequired>
            </div>

            {/* CELO earnings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">CELO Earnings</p>
              <p className="mt-2 font-serif text-3xl font-black text-[#1a4731]">{celoBalanceFmt}</p>
              <p className="text-sm text-foreground/50">CELO on-chain</p>
              <WalletRequired>
                <button
                  type="button"
                  onClick={() => void handleWithdrawCelo()}
                  disabled={!hasCeloEarnings || withdrawingCelo}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1a4731] px-5 py-2 text-sm font-black text-white disabled:opacity-40"
                >
                  {withdrawingCelo && <Loader2 className="h-4 w-4 animate-spin" />}
                  Withdraw CELO
                </button>
              </WalletRequired>
            </div>
          </div>

          {/* Platform records total */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-foreground/55">Total earnings (platform records)</p>
            <p className="mt-1 font-serif text-3xl font-black text-forest">{loading ? '—' : `${data?.total_earned ?? 0} cUSD`}</p>
          </div>

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-serif text-xl font-black text-forest">Monthly breakdown</h2>
            {data?.monthly.length ? (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-foreground/55">
                    <th className="py-2">Month</th>
                    <th>Content sold</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((row) => (
                    <tr key={row.month} className="border-t border-gray-100">
                      <td className="py-3 font-semibold text-forest">{row.month}</td>
                      <td>{row.content_sold}</td>
                      <td>{row.amount_earned} cUSD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-4 text-foreground/60">No earnings yet.</p>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-serif text-xl font-black text-forest">Recent transactions</h2>
            <div className="mt-4 space-y-3">
              {data?.recent.length ? data.recent.map((row, index) => (
                <div key={`${row.buyer_wallet}-${index}`} className="flex justify-between rounded-xl bg-[#f8f4ef] p-4 text-sm">
                  <div>
                    <p className="font-bold text-forest">{row.content_title}</p>
                    <p className="text-foreground/60">{shortenAddress(row.buyer_wallet)} · {new Date(row.purchased_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-forest">{row.amount} cUSD</p>
                </div>
              )) : <p className="text-foreground/60">No transactions yet.</p>}
            </div>
          </section>

          {/* Payout Settings */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="font-serif text-xl font-black text-[#1a4731]">Payout Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Where should your earnings go? Leave blank to use your connected wallet.
            </p>
            <label className="mt-4 block text-sm font-semibold text-[#171717]">
              Withdrawal Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x… (defaults to your connected wallet)"
              value={withdrawalWallet}
              onChange={(e) => setWithdrawalWallet(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:border-[#FFBF00] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                void fetch('/api/profiles/me', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'x-wallet-address': address ?? '' },
                  body: JSON.stringify({ withdrawal_wallet: withdrawalWallet }),
                }).then(() => {
                  toast({ title: 'Payout address saved', type: 'success' })
                  // sync localStorage
                  try {
                    const stored = localStorage.getItem('lugha_profile')
                    if (stored) {
                      const p = JSON.parse(stored) as Record<string, unknown>
                      p.withdrawal_wallet = withdrawalWallet
                      localStorage.setItem('lugha_profile', JSON.stringify(p))
                    }
                  } catch { /* ignore */ }
                })
              }}
              className="mt-4 rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-black text-[#171717] hover:bg-[#e6ac00]"
            >
              Save Payout Address
            </button>
          </div>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
