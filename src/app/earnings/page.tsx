'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { TutorGuard } from '@/components/TutorGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { EarningsWithdraw } from '@/components/web3/EarningsWithdraw'
import { shortenAddress } from '@/lib/minipay'
import { useAuth } from '@/hooks/useAuth'
import { EarningsSummary } from '@/types'

export default function EarningsPage() {
  return (
    <AuthGuard>
      <TutorGuard>
        <EarningsClient />
      </TutorGuard>
    </AuthGuard>
  )
}

function EarningsClient() {
  const { address } = useAuth()
  const [data, setData] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch('/api/earnings', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result) => setData(result.data ?? { total_earned: 0, monthly: [], recent: [] }))
      .finally(() => setLoading(false))
  }, [address])

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Earnings</h1>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-foreground/55">Total earnings (platform records)</p>
            <p className="mt-2 font-serif text-4xl font-black text-forest">{loading ? '—' : `${data?.total_earned ?? 0} cUSD`}</p>
          </div>

          <EarningsWithdraw />

          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-black text-forest">Monthly breakdown</h2>
            {data?.monthly.length ? (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="text-foreground/55">
                    <th className="py-2">Month</th>
                    <th>Content sold</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((row) => (
                    <tr key={row.month} className="border-t border-forest/10">
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

          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-black text-forest">Recent transactions</h2>
            <div className="mt-4 space-y-3">
              {data?.recent.length ? data.recent.map((row, index) => (
                <div key={`${row.buyer_wallet}-${index}`} className="flex justify-between rounded-xl bg-off-white p-4 text-sm">
                  <div>
                    <p className="font-bold text-forest">{row.content_title}</p>
                    <p className="text-foreground/60">{shortenAddress(row.buyer_wallet)} · {new Date(row.purchased_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-forest">{row.amount} cUSD</p>
                </div>
              )) : <p className="text-foreground/60">No transactions yet.</p>}
            </div>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
