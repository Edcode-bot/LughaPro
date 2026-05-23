'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { WalletWidget } from '@/components/WalletWidget'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletClient />
    </AuthGuard>
  )
}

function WalletClient() {
  const { address } = useAuth()
  const { toast } = useToast()
  const [referral, setReferral] = useState<{ referral_link?: string; total_referred?: number; total_earned?: number } | null>(null)

  useEffect(() => {
    if (!address) return
    fetch('/api/referrals/generate', {
      method: 'POST',
      headers: { wallet_address: address },
    })
      .then((response) => response.json())
      .then((result) => setReferral(result.data ?? null))
      .catch(() => setReferral(null))
  }, [address])

  async function copyLink() {
    if (!referral?.referral_link) return
    await navigator.clipboard.writeText(referral.referral_link)
    toast({ title: 'Copied', description: 'Referral link copied to clipboard', type: 'success' })
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Wallet</h1>
          <p className="mt-2 text-foreground/65">Manage your Celo wallet and referral rewards.</p>

          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground/55">Wallet address</p>
            <p className="mt-2 break-all font-mono text-sm text-forest">{address}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => address && void navigator.clipboard.writeText(address)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-forest px-4 py-2 text-sm font-bold text-forest"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <a
                href={address ? `https://celoscan.io/address/${address}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white"
              >
                Celoscan
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-jade/15 px-3 py-1 text-xs font-bold text-jade">
              Celo Mainnet
            </span>
          </section>

          <section className="mt-6">
            <WalletWidget />
          </section>

          <section className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://minipay.opera.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gold px-6 py-3 font-bold text-foreground hover:bg-[#e6ac00]"
            >
              Add Funds via MiniPay
            </a>
            <a
              href={address ? `https://celoscan.io/address/${address}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest hover:bg-forest hover:text-white"
            >
              View Transaction History
            </a>
          </section>

          <section className="mt-8 rounded-2xl bg-forest p-6 text-cream">
            <h2 className="font-serif text-2xl font-bold">Earn 5 cUSD for every friend you refer</h2>
            <p className="mt-2 text-sm text-cream/75">Share your link and earn when friends join LughaPro.</p>
            <p className="mt-4 break-all rounded-xl bg-white/10 p-3 text-sm">
              {referral?.referral_link ?? 'Generating link...'}
            </p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground"
            >
              Copy Link
            </button>
            <div className="mt-4 flex gap-6 text-sm">
              <span>Referred: {referral?.total_referred ?? 0}</span>
              <span>Earned: {referral?.total_earned ?? 0} cUSD</span>
            </div>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
