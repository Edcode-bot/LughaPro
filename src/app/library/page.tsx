'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { contentTypeLabel } from '@/lib/content'
import { usePurchases } from '@/hooks/usePurchases'
import { LibraryProgressStatus } from '@/types'

export default function LibraryPage() {
  return (
    <AuthGuard>
      <LibraryClient />
    </AuthGuard>
  )
}

function actionLabel(type: string) {
  if (type === 'video') return 'Watch'
  if (type === 'music') return 'Listen'
  return 'Read Now'
}

function Pills<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { key: T; label: string }[]
  active: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition ${
            active === o.key
              ? 'border-[#FFBF00] bg-[#FFBF00] text-[#171717]'
              : 'border-gray-200 bg-white text-[#1a4731]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

type CategoryFilter = 'all' | 'language' | 'music' | 'arts' | 'literature' | 'video' | 'experience'
type TypeFilter = 'all' | 'book' | 'post' | 'video' | 'music'
type PriceFilter = 'all' | 'free' | 'paid'

const CATEGORY_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'language', label: 'Language' },
  { key: 'music', label: 'Music' },
  { key: 'arts', label: 'Arts & Crafts' },
  { key: 'literature', label: 'Literature' },
  { key: 'video', label: 'Video' },
  { key: 'experience', label: 'Experiences' },
]

const TYPE_OPTIONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'book', label: 'Books' },
  { key: 'post', label: 'Posts' },
  { key: 'video', label: 'Videos' },
  { key: 'music', label: 'Music' },
]

const PRICE_OPTIONS: { key: PriceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
]

function LibraryClient() {
  const { purchases, loading, updateProgress } = usePurchases()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')

  const visible = useMemo(() => {
    return purchases.filter((p) => {
      if (category !== 'all' && (p.content as { category?: string }).category !== category) return false
      if (typeFilter !== 'all' && p.content.type !== typeFilter) return false
      if (priceFilter === 'free' && Number(p.amount ?? 0) > 0) return false
      if (priceFilter === 'paid' && Number(p.amount ?? 0) === 0) return false
      return true
    })
  }, [purchases, category, typeFilter, priceFilter])

  async function markComplete(purchaseId: string) {
    await updateProgress(purchaseId, 'completed', 100)
  }

  return (
    <DashboardLayout role="student">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-[#1a4731]">My Library</h1>

          <div className="mt-6 space-y-3">
            <Pills options={CATEGORY_OPTIONS} active={category} onChange={setCategory} />
            <Pills options={TYPE_OPTIONS} active={typeFilter} onChange={setTypeFilter} />
            <Pills options={PRICE_OPTIONS} active={priceFilter} onChange={setPriceFilter} />
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : purchases.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-5xl">📚</p>
              <h2 className="mt-4 font-serif text-2xl font-black text-[#1a4731]">Your library is empty.</h2>
              <Link href="/explore" className="mt-6 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
                Explore Content
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-foreground/60">No items match your filters.</p>
              <button
                type="button"
                onClick={() => { setCategory('all'); setTypeFilter('all'); setPriceFilter('all') }}
                className="mt-3 rounded-full border border-[#1a4731] px-5 py-2 text-sm font-bold text-[#1a4731]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {visible.map((purchase) => {
                const status: LibraryProgressStatus = purchase.progress_status ?? 'not_started'
                const percent = purchase.progress_percent ?? (status === 'completed' ? 100 : status === 'reading' ? 40 : 0)
                return (
                  <article key={purchase.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-20 w-28 shrink-0 rounded-xl bg-gradient-to-br from-[#1a4731] to-[#2d6a4f]" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase text-[#2d6a4f]">{contentTypeLabel(purchase.content.type)}</span>
                        <h3 className="font-bold text-[#1a4731]">{purchase.content.title}</h3>
                        <p className="text-sm text-foreground/60">
                          {purchase.content.author?.full_name} · {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-xs font-semibold capitalize text-foreground/55">{status.replace('_', ' ')}</p>
                        <div className="mt-3 h-2 rounded-full bg-[#f8f4ef]">
                          <div className="h-full rounded-full bg-[#FFBF00]" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <a
                          href={purchase.content.file_url ?? '/explore'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-full bg-[#FFBF00] px-5 text-sm font-bold text-[#171717]"
                        >
                          {actionLabel(purchase.content.type)}
                        </a>
                        {status !== 'completed' ? (
                          <button
                            type="button"
                            onClick={() => void markComplete(purchase.id)}
                            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-[#1a4731] px-5 text-sm font-bold text-[#1a4731]"
                          >
                            Mark Complete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
