'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentGuard } from '@/components/StudentGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { useCertificateData, useStudentCertificates } from '@/hooks/useContracts'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'
import { celoscanNft } from '@/lib/celoscan'

function formatIssuedDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function CertificateCard({
  tokenId,
  studentLabel,
}: {
  tokenId: bigint
  studentLabel: string
}) {
  const { data: cert, isLoading } = useCertificateData(tokenId)
  const { toast } = useToast()

  if (isLoading || !cert) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `https://lugha-pro.vercel.app/certificates#${tokenId.toString()}`,
  )}`

  async function share() {
    const link = `${window.location.origin}/certificates#${tokenId.toString()}`
    await navigator.clipboard.writeText(link)
    toast({ title: 'Link copied', type: 'success' })
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-forest to-jade p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-br from-forest via-[#1a4731] to-jade p-6 text-cream">
        <div className="flex items-start justify-between">
          <Image src="/logo.png" alt="LughaPro" width={90} height={28} className="h-7 w-auto brightness-0 invert" />
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-lg font-black text-foreground">
            ★
          </span>
        </div>
        <p className="mt-6 font-serif text-sm uppercase tracking-widest text-gold">Certificate of Completion</p>
        <p className="mt-2 font-serif text-2xl font-black">{cert.courseName}</p>
        <p className="mt-1 text-sm text-cream/80">{studentLabel}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">Level: {cert.level}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">By {cert.creatorName}</span>
        </div>
        <p className="mt-4 text-xs text-cream/70">{formatIssuedDate(cert.issuedAt)}</p>
        <p className="mt-2 text-xs font-semibold text-gold">Token #{tokenId.toString()} on Celo</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={celoscanNft(CONTRACT_ADDRESSES.celo.LughaCertificate, tokenId.toString())}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-bold"
          >
            View on Celoscan
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-xs font-bold text-foreground"
          >
            Share on LinkedIn
            <Share2 className="h-3.5 w-3.5" />
          </a>
          <button type="button" onClick={() => void share()} className="rounded-full border border-cream/30 px-4 py-2 text-xs font-bold">
            Copy link
          </button>
        </div>
      </div>
    </article>
  )
}

function CertificatesClient() {
  const { address, displayName } = useAuth()
  const wallet = address as `0x${string}` | undefined
  const { data: tokenIds, isLoading } = useStudentCertificates(wallet)

  const ids = useMemo(() => {
    if (!tokenIds || !Array.isArray(tokenIds)) return [] as bigint[]
    return [...tokenIds].reverse()
  }, [tokenIds])

  const highestLevel = ids.length > 0 ? 'On-chain' : '—'

  return (
    <DashboardLayout role="student">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Certificates</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-foreground/55">Total Earned</p>
              <p className="text-3xl font-black text-forest">{ids.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-foreground/55">Highest Level</p>
              <p className="text-3xl font-black text-forest">{highestLevel}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
          ) : ids.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-cream p-12 text-center">
              <p className="text-lg font-bold text-forest">
                Complete a course to earn your first NFT certificate! Certificates are stored permanently on the Celo blockchain.
              </p>
              <Link href="/learn" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                Browse Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {ids.map((tokenId) => (
                <CertificateCard
                  key={tokenId.toString()}
                  tokenId={tokenId}
                  studentLabel={displayName}
                />
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
      <StudentGuard>
        <CertificatesClient />
      </StudentGuard>
    </AuthGuard>
  )
}
