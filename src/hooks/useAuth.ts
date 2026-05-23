'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { clearStoredProfile, readStoredProfile } from '@/lib/profile-storage'
import { Profile, UserRole } from '@/types'

export function useAuth() {
  const { address, isConnected, status } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const [profile, setProfile] = useState<Profile | null>(null)

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
    if (stored) {
      setProfile(stored)
      return
    }
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      })
      const result = await response.json() as { data?: { profile?: Profile } }
      if (result.data?.profile) setProfile(result.data.profile)
    } catch {
      // ignore
    }
  }, [address])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  function connectMetaMask() {
    connect({ connector: injected({ target: 'metaMask' }) })
  }

  function connectWalletConnect() {
    connect({ connector: walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '', showQrModal: true }) })
  }

  function connectBrowserWallet() {
    connect({ connector: injected() })
  }

  function disconnect() {
    if (address) clearStoredProfile(address)
    setProfile(null)
    wagmiDisconnect()
  }

  const role: UserRole = profile?.role ?? 'student'
  const displayName = profile?.full_name ?? (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest')

  return {
    address,
    isConnected,
    isLoading: isPending || status === 'connecting',
    displayName,
    role,
    profile,
    setProfile,
    refreshProfile,
    connectMetaMask,
    connectWalletConnect,
    connectBrowserWallet,
    disconnect,
  }
}
