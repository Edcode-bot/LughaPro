'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function WalletRequired({ children }: { children: React.ReactNode }) {
  const { address } = useAuth()
  const [customWallet, setCustomWallet] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // If user has a connected wallet, render children normally
  if (address) return <>{children}</>

  // No wallet connected — show wallet setup prompt
  return (
    <div className="rounded-2xl border border-[#FFBF00] bg-[#fdf6e3] p-6">
      <h3 className="font-serif text-xl font-black text-[#1a4731]">
        Wallet Required for Withdrawals
      </h3>
      <p className="mt-2 text-sm text-[#171717]/70">
        Connect a wallet or enter your Celo wallet address to withdraw earnings.
      </p>

      <div className="mt-4">
        <label className="text-sm font-semibold text-[#171717]">
          Your Celo Wallet Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={customWallet}
          onChange={(e) => setCustomWallet(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-[#FFBF00] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[#171717]/50">
          Enter your MetaMask or any Celo-compatible wallet address
        </p>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          if (!customWallet.startsWith('0x') || customWallet.length !== 42) {
            alert('Please enter a valid wallet address (starts with 0x, 42 characters)')
            return
          }
          setSaving(true)
          try {
            const raw = localStorage.getItem('lugha_profile')
            const profile = raw ? (JSON.parse(raw) as { wallet_address?: string }) : {}
            await fetch('/api/profiles/me', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'x-wallet-address': profile.wallet_address ?? customWallet,
              },
              body: JSON.stringify({ withdrawal_wallet: customWallet }),
            })
            localStorage.setItem('lugha_withdrawal_wallet', customWallet)
            setSaved(true)
          } finally {
            setSaving(false)
          }
        }}
        className="mt-4 w-full rounded-full bg-[#FFBF00] py-3 font-black text-[#171717] disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Wallet Address'}
      </button>

      {saved && (
        <p className="mt-3 text-center text-sm font-semibold text-[#1a4731]">
          ✓ Wallet address saved. You can now withdraw earnings.
        </p>
      )}

      <div className="mt-4 rounded-xl bg-white p-4">
        <p className="text-xs font-semibold text-[#171717]/60">Don&apos;t have a wallet?</p>
        <a
          href="https://metamask.io"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-xs text-[#1a4731] underline"
        >
          Get MetaMask →
        </a>
        <a
          href="https://minipay.opera.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-xs text-[#1a4731] underline"
        >
          Get MiniPay (East Africa) →
        </a>
      </div>
    </div>
  )
}
