'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ContentCard } from '@/components/ui/ContentCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { ContentItem, PurchaseWithContent, TutorContentItem } from '@/types'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <UnifiedDashboard />
    </AuthGuard>
  )
}

function UnifiedDashboard() {
  const { displayName, address } = useAuth()
  const [myContent, setMyContent] = useState<TutorContentItem[]>([])
  const [recentPurchases, setRecentPurchases] = useState<PurchaseWithContent[]>([])
  const [recommended, setRecommended] = useState<ContentItem[]>([])
  const [stats, setStats] = useState({ published: 0, accessed: 0, cusdEarned: 0, celoEarned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    Promise.all([
      fetch('/api/content/mine', { headers: { 'x-wallet-address': address } }).then((r) => r.json() as Promise<{ data?: { id: string; type: string; title: string; price: number }[] }>),
      fetch(`/api/purchases/recent?user=${address}&limit=3`).then((r) => r.json()),
      fetch('/api/content?limit=3').then((r) => r.json()),
      fetch('/api/earnings', { headers: { 'x-wallet-address': address } }).then((r) => r.json()),
      fetch(`/api/dashboard/stats?user=${address}`).then((r) => r.json()),
    ])
      .then(([contentRes, recentRes, browseRes, earningsRes, statsRes]) => {
        const items = (contentRes.data ?? []) as TutorContentItem[]
        setMyContent(items.slice(0, 3))
        setRecentPurchases(recentRes.data?.items ?? [])
        setRecommended(browseRes.data?.items ?? [])
        setStats({
          published: items.length,
          accessed: statsRes.data?.content_accessed ?? (recentRes.data?.items ?? []).length,
          cusdEarned: earningsRes.data?.total_earned ?? 0,
          celoEarned: statsRes.data?.celo_earned ?? 0,
        })
      })
      .finally(() => setLoading(false))
  }, [address])

  const statCards = [
    { label: 'Content Published', value: stats.published },
    { label: 'Content Accessed', value: stats.accessed },
    { label: 'cUSD Earned', value: stats.cusdEarned },
    { label: 'CELO Earned', value: stats.celoEarned },
  ]

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">Habari, {displayName} 👋</h1>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)
              : statCards.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-foreground/55">{label}</p>
                    <p className="mt-2 text-3xl font-black text-forest">{value}</p>
                  </div>
                ))}
          </section>

          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-black text-forest">My Recent Content</h2>
              <Link href="/my-content" className="text-sm font-bold text-jade">View all</Link>
            </div>
            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-off-white" />
            ) : myContent.length === 0 ? (
              <div className="mt-6 rounded-xl bg-cream p-8 text-center">
                <p className="text-foreground/65">You haven&apos;t published anything yet.</p>
                <Link href="/publish" className="mt-4 inline-flex rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-white">
                  Publish your first content
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {myContent.map((item) => (
                  <div key={item.id} className="rounded-xl bg-off-white p-4">
                    <p className="font-bold text-forest">{item.title}</p>
                    <p className="text-xs text-foreground/55">{item.type} · ${Number(item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-black text-forest">Recently Accessed</h2>
              <Link href="/library" className="text-sm font-bold text-jade">View all</Link>
            </div>
            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-off-white" />
            ) : recentPurchases.length === 0 ? (
              <div className="mt-6 rounded-xl bg-cream p-8 text-center">
                <p className="text-foreground/65">No purchased content yet.</p>
                <Link href="/explore" className="mt-4 inline-flex rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-white">
                  Browse content
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {recentPurchases.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl bg-off-white p-4">
                    <p className="font-bold text-forest">{item.content?.title}</p>
                    <p className="text-sm text-foreground/60">{item.content?.author?.full_name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {recommended.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-black text-forest">Recommended for You</h2>
                <Link href="/explore" className="text-sm font-bold text-jade">See all</Link>
              </div>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {recommended.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 flex flex-wrap gap-3">
            <Link href="/publish" className="rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">Publish Content</Link>
            <Link href="/explore" className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731]">Explore</Link>
            <Link href="/wallet" className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731]">My Wallet</Link>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
