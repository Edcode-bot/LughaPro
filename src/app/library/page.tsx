'use client'

import Link from 'next/link'
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

function LibraryClient() {
  const { purchases, loading, updateProgress } = usePurchases()

  async function markComplete(purchaseId: string) {
    await updateProgress(purchaseId, 'completed', 100)
  }

  return (
    <DashboardLayout role="student">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">My Library</h1>
          <p className="mt-2 text-foreground/65">Track your reading progress across purchased content.</p>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : purchases.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-5xl">📚</p>
              <h2 className="mt-4 font-serif text-2xl font-black text-forest">Your library is empty</h2>
              <Link href="/learn" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                Browse Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {purchases.map((purchase) => {
                const status: LibraryProgressStatus = purchase.progress_status ?? 'not_started'
                const percent = purchase.progress_percent ?? (status === 'completed' ? 100 : status === 'reading' ? 40 : 0)
                return (
                  <article key={purchase.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-20 w-28 shrink-0 rounded-xl bg-gradient-to-br from-forest to-jade" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase text-jade">{contentTypeLabel(purchase.content.type)}</span>
                        <h3 className="font-bold text-forest">{purchase.content.title}</h3>
                        <p className="text-sm text-foreground/60">
                          {purchase.content.author?.full_name} · {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-xs font-semibold capitalize text-foreground/55">{status.replace('_', ' ')}</p>
                        <div className="mt-3 h-2 rounded-full bg-off-white">
                          <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <a
                          href={purchase.content.file_url ?? '/learn'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-full bg-jade px-5 text-sm font-bold text-white"
                        >
                          Read Now
                        </a>
                        {status !== 'completed' ? (
                          <button
                            type="button"
                            onClick={() => void markComplete(purchase.id)}
                            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-forest px-5 text-sm font-bold text-forest"
                          >
                            Mark as Complete
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
