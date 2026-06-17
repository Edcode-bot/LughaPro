'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
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

  const [referralLink, setReferralLink] = useState<string | null>(null)
  const [referralStats, setReferralStats] = useState({ referred_count: 0, earned: 0 })
  const [referrerInput, setReferrerInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [alreadyReferred, setAlreadyReferred] = useState(false)

  // Generate referral link
  useEffect(() => {
    if (!address) return
    fetch('/api/referrals/generate', {
      method: 'POST',
      headers: { 'x-wallet-address': address },
    })
      .then((r) => r.json())
      .then((result: { data?: { referral_link?: string } }) => {
        setReferralLink(result.data?.referral_link ?? `https://lugha-pro.vercel.app?ref=${address}`)
      })
      .catch(() => setReferralLink(`https://lugha-pro.vercel.app?ref=${address}`))
  }, [address])

  // Fetch referral stats
  useEffect(() => {
    if (!address) return
    fetch('/api/referrals/stats', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((data: { referred_count?: number; earned?: number; error?: string }) => {
        if (!data.error) setReferralStats({ referred_count: data.referred_count ?? 0, earned: data.earned ?? 0 })
      })
      .catch(() => { /* ignore */ })
  }, [address])

  // Check if already referred (referred_by set on profile)
  useEffect(() => {
    if (!address) return
    fetch('/api/profiles/me', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((d: { data?: { referred_by?: string } }) => {
        if (d.data?.referred_by) setAlreadyReferred(true)
      })
      .catch(() => { /* ignore */ })
  }, [address])

  async function copyLink() {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    toast({ title: 'Copied', description: 'Referral link copied to clipboard', type: 'success' })
  }

  async function applyReferral() {
    const referrer = referrerInput.trim()
    if (!isAddress(referrer)) {
      toast({ title: 'Invalid address', description: 'Enter a valid Celo wallet address', type: 'error' })
      return
    }
    if (referrer.toLowerCase() === address?.toLowerCase()) {
      toast({ title: 'Invalid referrer', description: 'You cannot refer yourself', type: 'error' })
      return
    }
    setApplying(true)
    try {
      const res = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address ?? '' },
        body: JSON.stringify({ referrer_wallet: referrer }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (data.error) {
        toast({ title: 'Error', description: data.error, type: 'error' })
      } else {
        setAlreadyReferred(true)
        setReferrerInput('')
        toast({ title: 'Referral applied!', description: 'Your referrer will earn a reward when you make your first purchase.', type: 'success' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to apply referral', type: 'error' })
    } finally {
      setApplying(false)
    }
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-black text-[#171717]">Wallet</h1>
            <p className="text-gray-500 mt-1">Manage your Celo wallet and referral rewards.</p>
          </div>

          {/* Address card */}
          <div className="rounded-2xl bg-[#171717] p-6 text-white mb-6">
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
          </div>

          {/* Balances */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 mb-6">
            <WalletWidget />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a href="https://app.ubeswap.org" target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-[#FFBF00] px-5 py-2.5 text-sm font-black text-[#171717] hover:bg-[#e6ac00]">
              Add Funds (Ubeswap)
            </a>
            <a href="https://minipay.opera.com" target="_blank" rel="noopener noreferrer"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#171717] hover:border-[#FFBF00]">
              Add Funds via MiniPay
            </a>
            <a href={address ? `https://celoscan.io/address/${address}` : '#'} target="_blank" rel="noopener noreferrer"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#171717] hover:border-[#FFBF00]">
              View Transactions
            </a>
          </div>

          {/* Referral section */}
          <div className="rounded-2xl bg-[#1a4731] p-6 mb-6">
            <h2 className="font-serif text-xl font-black text-white mb-1">Refer friends, earn rewards</h2>
            <p className="text-sm text-white/70 mb-4">Share your link — you earn 0.1 cUSD for each friend who makes their first purchase.</p>
            <div className="rounded-xl bg-white/10 p-3 font-mono text-sm text-white/90 break-all mb-4">
              {referralLink ?? 'Generating link...'}
            </div>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="rounded-full bg-[#FFBF00] px-5 py-2 text-sm font-black text-[#171717] hover:bg-[#e6ac00]"
            >
              Copy Link
            </button>
            <div className="mt-4 flex gap-6">
              <div>
                <div className="text-2xl font-black text-white">{referralStats.referred_count}</div>
                <div className="text-xs text-white/50 mt-0.5">Friends referred</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#FFBF00]">{referralStats.earned.toFixed(2)} cUSD</div>
                <div className="text-xs text-white/50 mt-0.5">Rewards earned</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/40">Rewards are platform-funded and paid manually to your wallet.</p>
          </div>

          {/* Enter referral code */}
          {alreadyReferred ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-5">
              <p className="text-sm font-semibold text-[#1a4731]">✓ Referral registered — your referrer will be rewarded on your first purchase.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h2 className="font-serif text-lg font-black text-[#1a4731] mb-1">Enter a referral code</h2>
              <p className="text-sm text-gray-500 mb-4">Paste your referrer&apos;s wallet address to register.</p>
              <input
                value={referrerInput}
                onChange={(e) => setReferrerInput(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:border-[#FFBF00] focus:outline-none mb-4"
              />
              <button
                type="button"
                disabled={applying || !referrerInput.trim()}
                onClick={() => void applyReferral()}
                className="rounded-full bg-[#1a4731] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d6a4f] disabled:opacity-50"
              >
                {applying ? 'Applying…' : 'Apply Referral'}
              </button>
            </div>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
