'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentGuard } from '@/components/StudentGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { Certificate } from '@/types'

export default function CertificatesPage() {
  return (
    <AuthGuard>
      <StudentGuard>
        <CertificatesClient />
      </StudentGuard>
    </AuthGuard>
  )
}

function CertificatesClient() {
  const { address } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch(`/api/certificates/mine?user=${address}`, { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((result) => setItems(result.data?.items ?? []))
      .finally(() => setLoading(false))
  }, [address])

  const highestLevel = items.reduce<string>((best, item) => item.level ?? best, '—')

  async function shareLink(id: string) {
    const link = `${window.location.origin}/certificates#${id}`
    await navigator.clipboard.writeText(link)
    toast({ title: 'Link copied', type: 'success' })
  }

  return (
    <DashboardLayout role="student">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Certificates</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-foreground/55">Total Earned</p>
              <p className="text-3xl font-black text-forest">{items.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-foreground/55">Highest Level</p>
              <p className="text-3xl font-black text-forest">{highestLevel}</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-cream p-12 text-center">
              <p className="text-lg font-bold text-forest">
                No certificates yet. Complete a course to earn your first NFT certificate!
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {items.map((cert) => (
                <article key={cert.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="font-serif text-xl font-bold text-forest">{cert.course_name}</p>
                  <p className="mt-2 text-sm text-foreground/60">{cert.creator_name} · {cert.level}</p>
                  <p className="mt-1 text-xs text-foreground/50">{new Date(cert.earned_at).toLocaleDateString()}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href="#" className="rounded-full bg-forest px-4 py-2 text-xs font-bold text-white">
                      View on Celo
                    </a>
                    <button type="button" onClick={() => void shareLink(cert.id)} className="rounded-full border-2 border-forest px-4 py-2 text-xs font-bold text-forest">
                      Share Certificate
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
