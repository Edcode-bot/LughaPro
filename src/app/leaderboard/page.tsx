'use client'

import { useEffect, useState } from 'react'
import { NavBar } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

type LeaderboardEntry = {
  id: string
  full_name: string
  avatar_url: string | null
  wallet_address: string | null
  stat: number
  stat_label: string
  level?: string
  xp?: number
}

type TabType = 'creators' | 'learners' | 'earners'

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: 'creators', label: 'Top Creators', emoji: '✍️' },
  { key: 'learners', label: 'Top Learners', emoji: '📚' },
  { key: 'earners', label: 'Most Earned', emoji: '💰' },
]

const RANK_BADGES = ['👑', '🥈', '🥉']

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) return <span className="text-2xl">{RANK_BADGES[rank - 1]}</span>
  return (
    <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-black text-white/60 text-sm">
      {rank}
    </span>
  )
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabType>('creators')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?type=${tab}&limit=20`)
      .then((r) => r.json())
      .then((d: { data?: LeaderboardEntry[] }) => setEntries(d.data ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <main className="min-h-screen bg-[#171717]">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-8">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FFBF00]/8 blur-[120px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#FFBF00] animate-pulse" />
            <span className="text-[#FFBF00] text-sm font-semibold">Live Rankings</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-black text-white mb-4">Leaderboard</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            The top creators and learners in Africa&apos;s cultural platform.
          </p>

          {/* Tabs */}
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                  tab === t.key
                    ? 'bg-[#FFBF00] text-[#171717]'
                    : 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard table */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-white/40">No data yet — be the first!</div>
          ) : (
            <div className="divide-y divide-white/10">
              {entries.map((entry, i) => {
                const rank = i + 1
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 ${
                      rank <= 3 ? 'bg-[#FFBF00]/5' : ''
                    }`}
                  >
                    <div className="w-10 flex justify-center flex-shrink-0">
                      <RankBadge rank={rank} />
                    </div>

                    {entry.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#FFBF00] flex items-center justify-center font-black text-[#171717] text-sm flex-shrink-0">
                        {(entry.full_name ?? 'U').slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{entry.full_name}</div>
                      {entry.level && (
                        <div className="text-xs text-white/40 mt-0.5">{entry.level}</div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-[#FFBF00] text-lg">{entry.stat}</div>
                      <div className="text-xs text-white/40">{entry.stat_label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
