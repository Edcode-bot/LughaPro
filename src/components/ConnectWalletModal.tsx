'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useRegisterReferral } from '@/hooks/useContracts'

const REFERRER_STORAGE_KEY = 'lugha_referrer'
import { saveStoredProfile, saveLughaProfile, saveLughaRole } from '@/lib/profile-storage'
import { Profile } from '@/types'

type Step = 'connect' | 'role'
type WalletLoginResponse = {
  data?: { profile?: unknown; isNew?: boolean }
  profile?: unknown
  isNew?: boolean
  error?: string | null
}

const walletOptions = [
  {
    id: 'metamask',
    label: 'MetaMask',
    sub: 'Browser extension',
    iconBg: 'bg-gold/20 text-forest',
    icon: '🦊',
    action: 'connectMetaMask' as const,
  },
  {
    id: 'walletconnect',
    label: 'WalletConnect',
    sub: 'Scan QR code',
    iconBg: 'bg-jade/15 text-jade',
    icon: '🔗',
    action: 'connectWalletConnect' as const,
  },
  {
    id: 'browser',
    label: 'Browser Wallet',
    sub: 'Other injected wallet',
    iconBg: 'bg-off-white text-foreground/60',
    icon: '👛',
    action: 'connectBrowserWallet' as const,
  },
]

export function ConnectWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const { address, isConnected, isLoading, connectMetaMask, connectWalletConnect, connectBrowserWallet, setProfile } = useAuth()
  const { toast } = useToast()
  const { registerReferral } = useRegisterReferral()
  const [step, setStep] = useState<Step>('connect')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | null>(null)

  const connectors = {
    connectMetaMask,
    connectWalletConnect,
    connectBrowserWallet,
  }

  useEffect(() => {
    if (open) {
      setError(null)
      setSelectedRole(null)
      setStep(isConnected ? 'role' : 'connect')
    }
  }, [open, isConnected])

  useEffect(() => {
    if (open && isConnected && address) setStep('role')
  }, [open, isConnected, address])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ref = new URLSearchParams(window.location.search).get('ref')?.toLowerCase()
    if (ref && isAddress(ref)) {
      localStorage.setItem(REFERRER_STORAGE_KEY, ref)
    }
  }, [open])

  async function finish() {
    if (!address || !selectedRole) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, role: selectedRole }),
      })
      const result = (await response.json()) as WalletLoginResponse
      const profile = (result.data?.profile ?? result.profile) as Profile | undefined
      if (!response.ok && !profile) {
        throw new Error(result.error ?? 'Unable to create wallet profile')
      }
      if (profile && address) {
        saveStoredProfile(address, profile)
        saveLughaRole(selectedRole)
        saveLughaProfile({ ...profile, role: selectedRole })
        setProfile({ ...profile, role: selectedRole })
      }

      const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY)?.toLowerCase()
      if (
        storedReferrer &&
        isAddress(storedReferrer) &&
        storedReferrer !== address.toLowerCase()
      ) {
        try {
          await registerReferral(storedReferrer as `0x${string}`)
          localStorage.removeItem(REFERRER_STORAGE_KEY)
          toast({
            title: 'Referral registered!',
            description: 'Your referrer will be rewarded when you make your first purchase.',
            type: 'success',
          })
        } catch {
          // User may already be referred — do not block onboarding
        }
      }

      toast({
        title: 'Welcome to LughaPro! 🎉',
        description: 'Complete your profile to get started.',
        type: 'success',
      })
      onClose()
      router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect wallet')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-off-white p-2 text-forest"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <Image src="/logo.png" alt="LughaPro" width={100} height={32} className="mx-auto h-8 w-auto" />
              {step === 'connect' ? (
                <>
                  <h2 className="mt-6 font-serif text-3xl font-black text-forest">Connect your wallet</h2>
                  <p className="mt-2 text-sm text-foreground/65">Use your wallet as your LughaPro account</p>
                </>
              ) : (
                <>
                  <h2 className="mt-6 font-serif text-3xl font-black text-forest">How will you use LughaPro?</h2>
                  <p className="mt-2 text-sm text-foreground/65">Choose your path to continue</p>
                </>
              )}
            </div>

            {error ? (
              <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
            ) : null}

            {step === 'connect' ? (
              <div className="mt-6 grid gap-3">
                {walletOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => void connectors[option.action]()}
                    className="flex items-center gap-4 rounded-xl border border-forest/10 bg-white p-4 text-left transition hover:border-gold disabled:opacity-60"
                  >
                    <span className={`grid h-12 w-12 place-items-center rounded-full text-xl ${option.iconBg}`}>
                      {option.icon}
                    </span>
                    <span>
                      <span className="block font-bold text-forest">{option.label}</span>
                      <span className="block text-sm text-foreground/60">{option.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedRole('student')}
                    className={`rounded-2xl border-2 p-5 text-left transition disabled:opacity-60 ${
                      selectedRole === 'student' ? 'border-forest bg-cream' : 'border-forest/10 bg-white hover:border-forest/30'
                    }`}
                  >
                    <span className="text-3xl">📚</span>
                    <h3 className="mt-3 font-serif text-xl font-bold text-forest">I want to Learn</h3>
                    <p className="mt-2 text-sm text-foreground/65">Browse books, posts, and lessons from top creators.</p>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedRole('tutor')}
                    className={`rounded-2xl border-2 p-5 text-left transition disabled:opacity-60 ${
                      selectedRole === 'tutor' ? 'border-forest bg-cream' : 'border-forest/10 bg-white hover:border-forest/30'
                    }`}
                  >
                    <span className="text-3xl">🎓</span>
                    <h3 className="mt-3 font-serif text-xl font-bold text-forest">I want to Teach</h3>
                    <p className="mt-2 text-sm text-foreground/65">Publish content and earn from your expertise.</p>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!selectedRole || submitting}
                  onClick={() => void finish()}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-gold font-bold text-foreground transition hover:bg-[#e6ac00] disabled:opacity-50"
                >
                  {submitting ? 'Continuing...' : 'Continue'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
