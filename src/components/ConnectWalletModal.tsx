'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { isAddress } from 'viem'
import { injected } from 'wagmi/connectors'
import { useConnect } from 'wagmi'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useRegisterReferral } from '@/hooks/useContracts'

const REFERRER_STORAGE_KEY = 'lugha_referrer'
import { saveStoredProfile } from '@/lib/profile-storage'
import { Profile } from '@/types'

type Step = 'connect' | 'role' | 'checking'
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
  const { connect } = useConnect()
  const { toast } = useToast()
  const { registerReferral } = useRegisterReferral()
  const [step, setStep] = useState<Step>('connect')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | null>(null)
  const [storedName, setStoredName] = useState('')
  const autoConnectDone = useRef(false)

  // MiniPay auto-connect — runs once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (autoConnectDone.current) return
    if ((window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true) {
      autoConnectDone.current = true
      connect({ connector: injected() })
    }
  }, [connect])

  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('lugha_profile')
      if (raw) {
        const profile = JSON.parse(raw) as { full_name?: string }
        if (profile.full_name) setStoredName(profile.full_name)
      }
    } catch {
      setStoredName('')
    }
  }, [open, isConnected])

  const connectors = {
    connectMetaMask,
    connectWalletConnect,
    connectBrowserWallet,
  }

  useEffect(() => {
    if (open) {
      setError(null)
      setSelectedRole(null)
      setStep(isConnected ? 'checking' : 'connect')
    }
  }, [open, isConnected])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ref = new URLSearchParams(window.location.search).get('ref')?.toLowerCase()
    if (ref && isAddress(ref)) {
      localStorage.setItem(REFERRER_STORAGE_KEY, ref)
    }
  }, [open])

  // When wallet connects, check if user is existing or new
  useEffect(() => {
    if (!open || !isConnected || !address) return
    void handleConnected()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isConnected, address])

  async function handleConnected() {
    if (!address) return

    // If stored role exists, just log in and redirect
    const storedRole = (typeof window !== 'undefined' ? localStorage.getItem('lugha_role') : null) as 'student' | 'tutor' | null
    if (storedRole) {
      await doLogin(storedRole, true)
      return
    }

    // No stored role — call wallet-login to check if user already exists
    setStep('checking')
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      })
      const result = (await response.json()) as WalletLoginResponse
      const isNew = result.data?.isNew ?? result.isNew
      const profile = (result.data?.profile ?? result.profile) as Profile | undefined

      if (!isNew) {
        // Existing user — save profile and go to dashboard
        if (profile && address) {
          const role = (profile as Profile & { role?: string }).role as 'student' | 'tutor' | undefined
          if (role) localStorage.setItem('lugha_role', role)
          localStorage.setItem('lugha_profile', JSON.stringify(profile))
          saveStoredProfile(address, profile)
          setProfile(profile)
        }
        onClose()
        router.push('/dashboard')
      } else {
        // Brand new user — show role selector
        setStep('role')
      }
    } catch {
      setStep('role')
    }
  }

  async function doLogin(role: 'student' | 'tutor', silent = false) {
    if (!address) return
    if (!silent) setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, role }),
      })
      const result = (await response.json()) as WalletLoginResponse
      const profile = (result.data?.profile ?? result.profile) as Profile | undefined
      if (!response.ok && !profile) {
        throw new Error(result.error ?? 'Unable to create wallet profile')
      }
      if (profile && address) {
        const profileWithRole = { ...profile, role }
        localStorage.setItem('lugha_role', role)
        localStorage.setItem('lugha_profile', JSON.stringify(profileWithRole))
        saveStoredProfile(address, profileWithRole)
        setProfile(profileWithRole)
      }

      const storedReferrer = localStorage.getItem(REFERRER_STORAGE_KEY)?.toLowerCase()
      if (storedReferrer && isAddress(storedReferrer) && storedReferrer !== address.toLowerCase()) {
        try {
          await registerReferral(storedReferrer as `0x${string}`)
          localStorage.removeItem(REFERRER_STORAGE_KEY)
          toast({ title: 'Referral registered!', description: 'Your referrer will be rewarded when you make your first purchase.', type: 'success' })
        } catch {
          // User may already be referred — do not block onboarding
        }
      }

      if (!silent) {
        toast({ title: 'Welcome to LughaPro! 🎉', description: 'Complete your profile to get started.', type: 'success' })
      }
      onClose()
      router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect wallet')
      setStep('role')
    } finally {
      if (!silent) setSubmitting(false)
    }
  }

  async function finish() {
    if (!address || !selectedRole) return
    setSubmitting(true)
    await doLogin(selectedRole, false)
    setSubmitting(false)
  }

  // Inside MiniPay and already connected — don't render the modal at all
  if (
    typeof window !== 'undefined' &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true &&
    isConnected
  ) {
    return null
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
              ) : step === 'checking' ? (
                <>
                  <h2 className="mt-6 font-serif text-3xl font-black text-forest">Checking account…</h2>
                  <p className="mt-2 text-sm text-foreground/65">One moment</p>
                </>
              ) : (
                <>
                  <h2 className="mt-6 font-serif text-3xl font-black text-forest">
                    {storedName ? `Welcome back, ${storedName}` : 'How will you use LughaPro?'}
                  </h2>
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
            ) : step === 'checking' ? (
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
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
                  className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold font-bold text-foreground transition hover:bg-[#e6ac00] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                      Continuing...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
