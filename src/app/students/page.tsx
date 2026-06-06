'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { shortenAddress } from '@/lib/minipay'
import { useAuth } from '@/hooks/useAuth'
import { TutorStudent } from '@/types'

export default function StudentsPage() {
  return (
    <AuthGuard>
      <StudentsClient />
    </AuthGuard>
  )
}

function StudentsClient() {
  const { address } = useAuth()
  const [items, setItems] = useState<TutorStudent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch('/api/students/mine', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result) => {
        setItems(result.data?.items ?? [])
        setTotal(result.data?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [address])

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">My Students</h1>
          <p className="mt-2 text-foreground/65">{total} unique learners have purchased your content.</p>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-bold text-[#1a4731]">No students yet. Publish content to attract learners.</p>
              <a href="/publish" className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
                Publish Now
              </a>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-[#f8f4ef]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-foreground/55">Wallet</th>
                    <th className="px-5 py-3 font-semibold text-foreground/55">Content</th>
                    <th className="px-5 py-3 font-semibold text-foreground/55">Date</th>
                    <th className="px-5 py-3 font-semibold text-foreground/55">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.wallet}-${index}`} className="border-t border-gray-100">
                      <td className="px-5 py-4 font-mono font-semibold text-[#1a4731]">{shortenAddress(item.wallet)}</td>
                      <td className="px-5 py-4 text-foreground/70">{item.content_title}</td>
                      <td className="px-5 py-4 text-foreground/60">{new Date(item.purchased_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-bold text-[#2d6a4f]">{item.amount} cUSD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
