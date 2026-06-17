'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import {
  clearStoredProfile,
  readLughaProfile,
  readLughaRole,
  readStoredProfile,
  saveStoredProfile,
} from '@/lib/profile-storage'
import { Profile, UserRole } from '@/types'

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address: wagmiAddress } = useAccount()
  const { connect } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const [profile, setProfile] = useState<Profile | null>(null)

  // Resolve wallet address: prefer MetaMask/injected wallet, then Privy embedded wallet
  const privyWalletAddress =
    wallets?.[0]?.address ??
    (user as { wallet?: { address?: string } } | null)?.wallet?.address ??
    null

  const address = (wagmiAddress ?? (privyWalletAddress as `0x${string}` | null) ?? undefined) as
    | `0x${string}`
    | undefined

  // Load stored profile when address changes
  useEffect(() => {
    if (!address) {
      setProfile(null)
      return
    }
    setProfile(readStoredProfile(address))
  }, [address])

  const refreshProfile = useCallback(async () => {
    if (!address) return
    const stored = readStoredProfile(address)
    if (stored?.onboarding_completed) {
      setProfile(stored)
      return
    }
    try {
      const res = await fetch('/api/profiles/me', {
        headers: { 'x-wallet-address': address },
      })
      const result = (await res.json()) as { data?: Profile }
      if (result.data) {
        saveStoredProfile(address, result.data)
        setProfile(result.data)
        return
      }
      // Auto-register new wallet
      const loginRes = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, email: (user as { email?: { address?: string } } | null)?.email?.address ?? null }),
      })
      const loginResult = (await loginRes.json()) as { data?: { profile?: Profile } }
      if (loginResult.data?.profile) {
        saveStoredProfile(address, loginResult.data.profile)
        setProfile(loginResult.data.profile)
      }
    } catch {
      if (stored) setProfile(stored)
    }
  }, [address])

  // Auto-sync profile when Privy authenticates and we have a wallet address
  useEffect(() => {
    if (authenticated && address) void refreshProfile()
  }, [authenticated, address, refreshProfile])

  // Post-login redirect: only from the landing page and auth pages → dashboard or onboarding
  // NOTE: /explore, /creators, and all other public pages are intentionally NOT included —
  // authenticated users must be able to browse them freely.
  useEffect(() => {
    if (!authenticated || !ready || !address) return
    if (typeof window === 'undefined') return
    const redirectFromPaths = ['/', '/auth/login', '/auth/register']
    const currentPath = window.location.pathname
    if (!redirectFromPaths.includes(currentPath)) return
    // Attempt login/register and redirect accordingly
    fetch('/api/auth/wallet-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: address, address }),
    })
      .then((r) => r.json())
      .then((result: { data?: { profile?: { onboarding_completed?: boolean }; isNew?: boolean } }) => {
        const prof = result.data?.profile
        if (!prof) return
        if (!prof.onboarding_completed) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = '/dashboard'
        }
      })
      .catch(() => {})
  }, [authenticated, ready, address])

  function disconnect() {
    if (wagmiAddress) clearStoredProfile(wagmiAddress)
    if (privyWalletAddress) clearStoredProfile(privyWalletAddress as `0x${string}`)
    setProfile(null)
    wagmiDisconnect()
    void logout()
  }

  // Profile-derived fields
  const email = (user as { email?: { address?: string } } | null)?.email?.address ?? null
  const googleName = (user as { google?: { name?: string } } | null)?.google?.name ?? null
  const role: UserRole = readLughaRole() ?? profile?.role ?? readLughaProfile()?.role ?? 'student'

  const displayName =
    profile?.full_name ??
    googleName ??
    (email ? email.split('@')[0] : null) ??
    (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest')

  const hasWallet = !!address
  const isEmailOnly = authenticated && !hasWallet

  return {
    // Core auth state
    address,
    isConnected: authenticated,
    isLoading: !ready,
    displayName,
    email,
    hasWallet,
    isEmailOnly,
    user,
    // Privy actions
    login,
    logout: disconnect,
    // Profile state (backward compat)
    role,
    profile,
    setProfile,
    refreshProfile,
    // Wallet connect methods (backward compat — Privy modal handles these)
    disconnect,
    connectMetaMask: () => connect({ connector: injected() }),
    connectWalletConnect: login,
    connectBrowserWallet: () => connect({ connector: injected() }),
  }
}
