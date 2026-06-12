'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'

type ContentRow = {
  id: string
  type: 'book' | 'post' | 'video' | 'music'
  title: string
  price: number
  is_free: boolean
  published: boolean
  created_at: string
  cover_image_url?: string | null
  thumbnail_url?: string | null
}

type TabKey = 'all' | 'book' | 'post' | 'video' | 'music'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'book', label: 'Books' },
  { key: 'post', label: 'Posts' },
  { key: 'video', label: 'Videos' },
  { key: 'music', label: 'Music' },
]

const TYPE_COLORS: Record<string, string> = {
  book: 'bg-blue-50 text-blue-700',
  post: 'bg-purple-50 text-purple-700',
  video: 'bg-red-50 text-red-700',
  music: 'bg-green-50 text-green-700',
}

export default function MyContentPage() {
  return (
    <AuthGuard>
      <MyContentClient />
    </AuthGuard>
  )
}

function MyContentClient() {
  const { address } = useAuth()
  const [items, setItems] = useState<ContentRow[]>([])
  const [tab, setTab] = useState<TabKey>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch('/api/content/mine', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result: { data?: ContentRow[] }) => setItems(result.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [address])

  const visible = useMemo(
    () => (tab === 'all' ? items : items.filter((i) => i.type === tab)),
    [items, tab],
  )

  const countFor = (key: TabKey) =>
    key === 'all' ? items.length : items.filter((i) => i.type === key).length

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-4xl font-black text-[#1a4731]">My Content</h1>
            <Link href="/publish" className="rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
              + Publish New
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  tab === t.key ? 'bg-[#FFBF00] text-[#171717]' : 'bg-white text-[#1a4731]'
                }`}
              >
                {t.label} ({countFor(t.key)})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : visible.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-bold text-[#1a4731]">Nothing published yet.</p>
              <Link href="/publish" className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
                Publish Now
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {visible.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-[#f8f4ef] overflow-hidden">
                      {(item.cover_image_url ?? item.thumbnail_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover_image_url ?? item.thumbnail_url ?? ''}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl">
                          {item.type === 'book' ? '📚' : item.type === 'post' ? '✍️' : item.type === 'video' ? '🎬' : '🎵'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${TYPE_COLORS[item.type] ?? ''}`}>
                          {item.type}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-[#1a4731]">{item.title}</h3>
                      <p className="text-sm text-foreground/60">
                        {item.is_free ? 'Free' : `$${Number(item.price).toFixed(2)}`}
                        {' · '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.published === false ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {item.published === false ? 'Draft' : 'Published'}
                    </span>
                    <Link
                      href={`/publish?edit=${item.id}&type=${item.type}`}
                      className="rounded-full border border-[#1a4731]/20 px-4 py-2 text-xs font-bold text-[#1a4731] hover:bg-[#1a4731]/5"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
