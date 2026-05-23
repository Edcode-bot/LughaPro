'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { contentTypeLabel } from '@/lib/content'
import { usePurchases } from '@/hooks/usePurchases'

export default function LibraryPage() {
  return (
    <AuthGuard>
      <LibraryClient />
    </AuthGuard>
  )
}

function LibraryClient() {
  const { purchases, loading } = usePurchases()
  const [tab, setTab] = useState<'all' | 'book' | 'post'>('all')

  const items = useMemo(() => {
    if (tab === 'all') return purchases
    return purchases.filter((purchase) => purchase.content_type === tab || (tab === 'book' && purchase.content_type === 'lesson'))
  }, [purchases, tab])

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">My Library</h1>
          <p className="mt-2 text-foreground/65">Your purchased and accessed content.</p>

          <div className="mt-6 flex gap-2">
            {[
              ['all', 'All'],
              ['book', 'Books'],
              ['post', 'Posts'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key as typeof tab)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  tab === key ? 'bg-gold text-foreground' : 'bg-white text-forest'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-5xl">📚</p>
              <h2 className="mt-4 font-serif text-2xl font-black text-forest">Your library is empty</h2>
              <Link href="/learn" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                Browse Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {items.map((purchase) => (
                <article key={purchase.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                  <div className="h-20 w-32 shrink-0 rounded-xl bg-gradient-to-br from-forest to-jade" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold uppercase text-jade">{contentTypeLabel(purchase.content.type)}</span>
                    <h3 className="font-bold text-forest">{purchase.content.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {purchase.content.author?.full_name} · {new Date(purchase.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={purchase.content.file_url ?? '/learn'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-jade px-5 text-sm font-bold text-white"
                  >
                    Read Now
                  </a>
                </article>
              ))}
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
