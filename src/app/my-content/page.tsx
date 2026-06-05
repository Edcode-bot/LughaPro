'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { TutorContentItem } from '@/types'

export default function MyContentPage() {
  return (
    <AuthGuard>
      <MyContentClient />
    </AuthGuard>
  )
}

function MyContentClient() {
  const { address } = useAuth()
  const [items, setItems] = useState<TutorContentItem[]>([])
  const [tab, setTab] = useState<'books' | 'posts'>('books')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch('/api/content/mine', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result) => setItems(result.data?.items ?? []))
      .finally(() => setLoading(false))
  }, [address])

  const books = useMemo(() => items.filter((i) => i.type === 'book' || i.type === 'lesson'), [items])
  const posts = useMemo(() => items.filter((i) => i.type === 'post'), [items])
  const visible = tab === 'books' ? books : posts

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-4xl font-black text-forest">My Content</h1>
            <Link href="/publish" className="rounded-full bg-gold px-6 py-3 font-bold text-foreground">
              Publish New
            </Link>
          </div>

          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setTab('books')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'books' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}>
              Books ({books.length})
            </button>
            <button type="button" onClick={() => setTab('posts')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'posts' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}>
              Posts ({posts.length})
            </button>
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : visible.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-bold text-forest">You haven&apos;t published anything yet. Start creating!</p>
              <Link href="/publish" className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                Publish Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {visible.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-jade">{item.type}</p>
                    <h3 className="font-bold text-forest">{item.title}</h3>
                    <p className="text-sm text-foreground/60">
                      ${Number(item.price).toFixed(2)} · {item.purchase_count ?? 0} purchases · {item.earnings ?? 0} cUSD earned
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-forest">
                      {item.published === false ? 'Draft' : 'Published'}
                    </span>
                    <button type="button" className="rounded-full border border-forest/20 px-4 py-2 text-xs font-bold text-forest">
                      Edit
                    </button>
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
