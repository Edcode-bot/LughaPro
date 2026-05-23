'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

type Step = 'connect' | 'role'
type WalletLoginResponse = { data?: { profile?: unknown; isNew?: boolean }; profile?: unknown; isNew?: boolean; error?: string }

export function ConnectWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const { address, isConnected, isLoading, connectMetaMask, connectWalletConnect, connectBrowserWallet } = useAuth()
  const [step, setStep] = useState<Step>('connect')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      setStep(isConnected ? 'role' : 'connect')
    }
  }, [open, isConnected])

  useEffect(() => {
    if (open && isConnected && address) setStep('role')
  }, [open, isConnected, address])

  async function finish(role: 'student' | 'tutor') {
    if (!address) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, role }),
      })
      const result = (await response.json()) as WalletLoginResponse
      if (!response.ok) throw new Error(result.error ?? 'Unable to create wallet profile')
      onClose()
      router.push('/dashboard')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect wallet')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-luxury" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-black text-forest">Connect your wallet</h2>
                <p className="mt-2 text-sm text-forest/65">Use your wallet as your LughaPro account.</p>
              </div>
              <button aria-label="Close" onClick={onClose} className="rounded-full bg-cream p-2 text-forest"><X className="h-5 w-5" /></button>
            </div>
            {error ? <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
            {step === 'connect' ? (
              <div className="mt-6 grid gap-3">
                <Button size="lg" loading={isLoading} onClick={connectMetaMask} className="w-full justify-center"><Wallet className="h-5 w-5" />MetaMask</Button>
                <Button size="lg" loading={isLoading} variant="secondary" onClick={connectWalletConnect} className="w-full justify-center"><Wallet className="h-5 w-5" />WalletConnect</Button>
                <Button size="lg" loading={isLoading} variant="ghost" onClick={connectBrowserWallet} className="w-full justify-center"><Wallet className="h-5 w-5" />Browser Wallet</Button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button disabled={submitting} onClick={() => void finish('student')} className="rounded-3xl border-2 border-forest/10 bg-cream p-5 text-left transition hover:border-gold disabled:opacity-60">
                  <Wallet className="h-8 w-8 text-gold" />
                  <h3 className="mt-4 text-xl font-black text-forest">I want to Learn</h3>
                  <p className="mt-2 text-sm text-forest/65">Find tutors and book Kiswahili lessons.</p>
                </button>
                <button disabled={submitting} onClick={() => void finish('tutor')} className="rounded-3xl border-2 border-forest/10 bg-cream p-5 text-left transition hover:border-gold disabled:opacity-60">
                  <Wallet className="h-8 w-8 text-gold" />
                  <h3 className="mt-4 text-xl font-black text-forest">I want to Teach</h3>
                  <p className="mt-2 text-sm text-forest/65">Create a tutor profile and teach learners.</p>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
