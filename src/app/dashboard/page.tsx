'use client'

import Link from 'next/link'
import { BookOpen, DollarSign, FileText, Trophy, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ContentCard } from '@/components/ui/ContentCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { ContentItem, PurchaseWithContent, TutorContentItem } from '@/types'

const LEVELS = [
  { name: 'Newcomer', min: 0, emoji: '🌱' },
  { name: 'Explorer', min: 100, emoji: '🔭' },
  { name: 'Scholar', min: 300, emoji: '📚' },
  { name: 'Elder', min: 750, emoji: '🌿' },
  { name: 'Griot', min: 1500, emoji: '🥁' },
]

function getLevelInfo(xp: number) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      current = LEVELS[i]
      next = LEVELS[i + 1] ?? LEVELS[i]
    }
  }
  const progress = next === current
    ? 100
    : Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100))
  return { current, next, progress }
}

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
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)

  const firstName = (displayName ?? 'Friend').split(' ')[0]

  useEffect(() => {
    if (!address) return
    Promise.all([
      fetch('/api/content/mine', { headers: { 'x-wallet-address': address } }).then((r) => r.json() as Promise<{ data?: TutorContentItem[] }>),
      fetch(`/api/purchases/recent?user=${address}&limit=3`).then((r) => r.json()),
      fetch('/api/content?limit=3').then((r) => r.json()),
      fetch('/api/earnings', { headers: { 'x-wallet-address': address } }).then((r) => r.json()),
      fetch(`/api/dashboard/stats?user=${address}`).then((r) => r.json()),
    ])
      .then(([contentRes, recentRes, browseRes, earningsRes, statsRes]) => {
        const items = contentRes.data ?? []
        setMyContent(items.slice(0, 3))
        setRecentPurchases(recentRes.data?.items ?? [])
        setRecommended(browseRes.data?.items ?? [])
        setStats({
          published: items.length,
          accessed: statsRes.data?.content_accessed ?? (recentRes.data?.items ?? []).length,
          cusdEarned: earningsRes.data?.total_earned ?? 0,
          celoEarned: statsRes.data?.celo_earned ?? 0,
        })
        // Compute XP from actions (simple: 50 per published, 20 per purchase)
        setXp(items.length * 50 + (recentRes.data?.items ?? []).length * 20)
      })
      .finally(() => setLoading(false))
  }, [address])

  const { current: levelInfo, next: nextLevelInfo, progress } = getLevelInfo(xp)
  const nextLevelXp = nextLevelInfo.min

  const statCards = [
    { label: 'Content Published', value: stats.published, icon: FileText, color: 'bg-[#1a4731]/10 text-[#1a4731]' },
    { label: 'Content Accessed', value: stats.accessed, icon: BookOpen, color: 'bg-[#FFBF00]/20 text-[#b8860b]' },
    { label: 'cUSD Earned', value: `${Number(stats.cusdEarned).toFixed(2)}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'CELO Earned', value: `${Number(stats.celoEarned).toFixed(4)}`, icon: Wallet, color: 'bg-blue-100 text-blue-600' },
  ]

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          {/* Welcome hero card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1a4731] to-[#2d6a4f] p-6 lg:p-8 text-white mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">Welcome back</p>
                <h2 className="font-serif text-3xl lg:text-4xl font-black mt-1">Habari, {firstName} 👋</h2>
                <p className="text-white/60 mt-2 text-sm">Here&apos;s what&apos;s happening with your content today.</p>
              </div>
              <Link
                href="/publish"
                className="self-start sm:self-center shrink-0 rounded-full bg-[#FFBF00] px-6 py-3 font-black text-[#171717] hover:bg-[#e6ac00] transition-all hover:scale-105 text-sm"
              >
                + Publish Content
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
                ))
              : statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white p-5 border border-gray-100 hover:border-[#FFBF00] hover:shadow-lg hover:shadow-[#FFBF00]/10 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="font-serif text-3xl font-black text-[#171717]">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
          </div>

          {/* XP / Level card */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 mb-8 hover:border-[#FFBF00] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Your Level</span>
                <div className="font-serif text-2xl font-black text-[#1a4731] mt-0.5">{levelInfo.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{levelInfo.emoji}</span>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-1.5 rounded-full border border-[#FFBF00]/40 px-3 py-1.5 text-xs font-bold text-[#1a4731] hover:bg-[#FFBF00] hover:text-[#171717] transition-all"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Leaderboard
                </Link>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-[#FFBF00] h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{xp} XP</span>
              <span>{nextLevelXp} XP to reach {nextLevelInfo.name} {nextLevelInfo.emoji}</span>
            </div>
          </div>

          {/* My Recent Content */}
          <section className="mb-8 rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-black text-[#171717]">My Recent Content</h2>
              <Link href="/my-content" className="text-sm font-bold text-[#1a4731] hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="h-20 animate-pulse rounded-xl bg-[#f8f4ef]" />
            ) : myContent.length === 0 ? (
              <div className="rounded-xl bg-[#f8f4ef] p-8 text-center">
                <p className="text-[#171717]/60 text-sm">You haven&apos;t published anything yet.</p>
                <Link href="/publish" className="mt-4 inline-flex rounded-full bg-[#1a4731] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d6a4f] transition-colors">
                  Publish your first content
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f8f4ef] p-4 hover:bg-[#FFBF00]/10 transition-colors">
                    <div>
                      <p className="font-bold text-[#171717] text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.type} · {item.is_free ? 'Free' : `$${Number(item.price).toFixed(2)}`}</p>
                    </div>
                    <Link
                      href={`/publish/edit/${item.id}?type=${item.type}`}
                      className="text-xs font-bold text-[#1a4731] hover:underline"
                    >
                      Edit →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recently Accessed */}
          <section className="mb-8 rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-black text-[#171717]">Recently Accessed</h2>
              <Link href="/library" className="text-sm font-bold text-[#1a4731] hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="h-20 animate-pulse rounded-xl bg-[#f8f4ef]" />
            ) : recentPurchases.length === 0 ? (
              <div className="rounded-xl bg-[#f8f4ef] p-8 text-center">
                <p className="text-[#171717]/60 text-sm">No purchased content yet.</p>
                <Link href="/explore" className="mt-4 inline-flex rounded-full bg-[#1a4731] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d6a4f] transition-colors">
                  Browse content
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {recentPurchases.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl bg-[#f8f4ef] p-4 hover:bg-[#FFBF00]/10 transition-colors">
                    <p className="font-bold text-[#171717] text-sm">{item.content?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.content?.author?.full_name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recommended */}
          {recommended.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-black text-[#171717]">Recommended for You</h2>
                <Link href="/explore" className="text-sm font-bold text-[#1a4731] hover:underline">See all →</Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="/publish" className="rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717] text-sm hover:bg-[#e6ac00] transition-colors">
              Publish Content
            </Link>
            <Link href="/explore" className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731] text-sm hover:bg-[#1a4731] hover:text-white transition-all">
              Explore
            </Link>
            <Link href="/wallet" className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731] text-sm hover:bg-[#1a4731] hover:text-white transition-all">
              My Wallet
            </Link>
          </div>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
