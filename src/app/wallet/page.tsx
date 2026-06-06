'use client'

import { Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { formatUnits } from 'viem'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { WalletWidget } from '@/components/WalletWidget'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { useHasBeenReferred, useReferralEarnings, useRegisterReferral } from '@/hooks/useContracts'

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
  const [referral, setReferral] = useState<{
    referral_link?: string
    referral_code?: string
    total_referred?: number
    total_earned?: number
  } | null>(null)
  const [referrerInput, setReferrerInput] = useState('')
  const [registering, setRegistering] = useState(false)

  const wallet = address as `0x${string}` | undefined
  const { data: hasBeenReferred, refetch: refetchReferred } = useHasBeenReferred(wallet)
  const { data: onChainEarnings, refetch: refetchEarnings } = useReferralEarnings(wallet)
  const { registerReferral, isPending } = useRegisterReferral()

  useEffect(() => {
    if (!address) return
    fetch('/api/referrals/generate', {
      method: 'POST',
      headers: { 'x-wallet-address': address },
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

  async function applyReferral() {
    const referrer = referrerInput.trim().toLowerCase()
    if (!isAddress(referrer)) {
      toast({ title: 'Invalid address', description: 'Enter a valid Celo wallet address', type: 'error' })
      return
    }
    if (referrer === address?.toLowerCase()) {
      toast({ title: 'Invalid referrer', description: 'You cannot refer yourself', type: 'error' })
      return
    }
    setRegistering(true)
    try {
      await registerReferral(referrer as `0x${string}`)
      await refetchReferred()
      toast({
        title: 'Referral registered on-chain!',
        description: 'Your referrer will earn 5 cUSD when you make your first purchase.',
        type: 'success',
      })
      setReferrerInput('')
      await refetchEarnings()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      toast({ title: 'Could not register', description: msg.slice(0, 120), type: 'error' })
    } finally {
      setRegistering(false)
    }
  }

  const earnedDisplay =
    onChainEarnings !== undefined
      ? Number(formatUnits(onChainEarnings, 18)).toFixed(2)
      : (referral?.total_earned ?? 0).toFixed(2)

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Wallet</h1>
          <p className="mt-2 text-foreground/65">Manage your Celo wallet and referral rewards.</p>

          <section className="mt-8 rounded-2xl bg-[#171717] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Wallet address</p>
            <p className="mt-2 break-all font-mono text-sm text-white/90">{address}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => address && void navigator.clipboard.writeText(address)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <a
                href={address ? `https://celoscan.io/address/${address}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
              >
                Celoscan
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-[#FFBF00]/20 px-3 py-1 text-xs font-bold text-[#FFBF00]">
              Celo Mainnet
            </span>
          </section>

          <section className="mt-6">
            <WalletWidget />
          </section>

          <section className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://app.ubeswap.org"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717] hover:bg-[#e6ac00]"
            >
              Add Funds
            </a>
            <a
              href="https://minipay.opera.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731] hover:bg-[#1a4731] hover:text-white"
            >
              Add Funds via MiniPay
            </a>
            <a
              href={address ? `https://celoscan.io/address/${address}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-[#1a4731] px-6 py-3 font-bold text-[#1a4731] hover:bg-[#1a4731] hover:text-white"
            >
              View Transactions
            </a>
          </section>

          <section className="mt-8 rounded-2xl bg-forest p-6 text-cream">
            <h2 className="font-serif text-2xl font-bold">Earn 5 cUSD for every friend you refer</h2>
            <p className="mt-2 text-sm text-cream/75">Share your link — rewards are paid on-chain when friends purchase.</p>
            <p className="mt-4 break-all rounded-xl bg-white/10 p-3 text-sm font-mono">
              {referral?.referral_link ?? 'Generating link...'}
            </p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground"
            >
              Copy Link
            </button>
            <p className="mt-4 text-sm font-semibold text-gold">
              You&apos;ve earned {earnedDisplay} cUSD from referrals (on-chain)
            </p>
          </section>

          {!hasBeenReferred ? (
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-black text-forest">Enter referral code</h2>
              <p className="mt-2 text-sm text-foreground/60">Paste your referrer&apos;s wallet address to register on-chain.</p>
              <input
                value={referrerInput}
                onChange={(e) => setReferrerInput(e.target.value)}
                placeholder="0x..."
                className="mt-4 w-full rounded-xl border border-forest/15 px-4 py-3 font-mono text-sm"
              />
              <button
                type="button"
                disabled={registering || isPending}
                onClick={() => void applyReferral()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {(registering || isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply Referral
              </button>
            </section>
          ) : (
            <section className="mt-6 rounded-2xl bg-cream p-5">
              <p className="text-sm font-semibold text-forest">✓ Referral registered on-chain</p>
            </section>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
