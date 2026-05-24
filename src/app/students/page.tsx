'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { TutorGuard } from '@/components/TutorGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { shortenAddress } from '@/lib/minipay'
import { useAuth } from '@/hooks/useAuth'
import { TutorStudent } from '@/types'

export default function StudentsPage() {
  return (
    <AuthGuard>
      <TutorGuard>
        <StudentsClient />
      </TutorGuard>
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
            <p className="mt-8 text-foreground/60">No students yet.</p>
          ) : (
            <div className="mt-8 grid gap-4">
              {items.map((item, index) => (
                <article key={`${item.wallet}-${index}`} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-bold text-forest">{shortenAddress(item.wallet)}</p>
                  <p className="text-sm text-foreground/60">
                    {item.content_title} · {item.content_type} · {new Date(item.purchased_at).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-jade">{item.amount} cUSD</p>
                </article>
              ))}
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
