'use client'

import Link from 'next/link'
import { ExternalLink, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'
import { celoscanNft } from '@/lib/celoscan'

type DbCertificate = {
  id: string
  content_id: string
  content_title: string
  creator_name: string | null
  token_id: string | null
  tx_hash: string | null
  minted_at: string
}

function CertificateCard({ cert, displayName }: { cert: DbCertificate; displayName: string }) {
  const { toast } = useToast()

  const linkedInUrl = cert.token_id
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `https://lugha-pro.vercel.app/certificates#${cert.token_id}`,
      )}`
    : null

  async function share() {
    const link = `${window.location.origin}/certificates#${cert.token_id ?? cert.id}`
    await navigator.clipboard.writeText(link)
    toast({ title: 'Link copied', type: 'success' })
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a4731] via-[#1a4731] to-[#2d6a4f] p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-br from-[#1a4731] via-[#1a4731] to-[#2d6a4f] p-6 text-white">
        <div className="flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LughaPro" className="h-7 w-auto brightness-0 invert" />
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFBF00] text-lg font-black text-[#171717]">
            ★
          </span>
        </div>
        <p className="mt-6 font-serif text-sm uppercase tracking-widest text-[#FFBF00]">Certificate of Completion</p>
        <p className="mt-2 font-serif text-2xl font-black">{cert.content_title}</p>
        <p className="mt-1 text-sm text-white/80">{displayName}</p>
        {cert.creator_name && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1">By {cert.creator_name}</span>
          </div>
        )}
        <p className="mt-4 text-xs text-white/60">
          {new Date(cert.minted_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        {cert.token_id && (
          <p className="mt-1 text-xs font-semibold text-[#FFBF00]">Token #{cert.token_id} on Celo</p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {cert.tx_hash && (
            <a
              href={`https://celoscan.io/tx/${cert.tx_hash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25"
            >
              View on Celoscan
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {cert.token_id && (
            <a
              href={celoscanNft(CONTRACT_ADDRESSES.celo.LughaCertificate, cert.token_id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-bold hover:bg-white/25"
            >
              View NFT
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {linkedInUrl && (
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#FFBF00] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#e6ac00]"
            >
              Share on LinkedIn
              <Share2 className="h-3.5 w-3.5" />
            </a>
          )}
          <button type="button" onClick={() => void share()} className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold hover:bg-white/10">
            Copy link
          </button>
        </div>
      </div>
    </article>
  )
}

function CertificatesClient() {
  const { address, displayName } = useAuth()
  const [certificates, setCertificates] = useState<DbCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    fetch('/api/certificates/record', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((d: { data?: DbCertificate[] }) => setCertificates(d.data ?? []))
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false))
  }, [address])

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-[#1a4731]">Certificates</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-3xl font-black text-[#1a4731]">{loading ? '—' : certificates.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">On Celo Blockchain</p>
              <p className="text-3xl font-black text-[#1a4731]">{loading ? '—' : certificates.filter(c => !!c.token_id).length}</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : certificates.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-[#fdf6e3] p-12 text-center">
              <div className="text-5xl mb-4">🏅</div>
              <p className="text-lg font-bold text-[#1a4731]">
                No certificates yet. Purchase and complete content to earn your first certificate.
              </p>
              <Link href="/explore" className="mt-6 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717] hover:bg-[#e6ac00]">
                Explore Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} displayName={displayName} />
              ))}
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

export default function CertificatesPage() {
  return (
    <AuthGuard>
      <CertificatesClient />
    </AuthGuard>
  )
}
