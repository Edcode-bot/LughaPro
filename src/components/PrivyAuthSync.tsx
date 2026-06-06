'use client'

// This component MUST only be rendered inside <PrivyProvider>.
// It calls Privy hooks unconditionally (no hook-rule violations) and
// publishes the result into PrivyAuthContext for the rest of the app.

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { PrivyAuthContext } from '@/context/PrivyAuthContext'

export function PrivyAuthSync({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  const walletAddress =
    wallets?.[0]?.address ??
    (user as { wallet?: { address?: string } } | null)?.wallet?.address ??
    null

  const email =
    (user as { email?: { address?: string } } | null)?.email?.address ?? null

  const displayName =
    (user as { google?: { name?: string } } | null)?.google?.name ??
    (email ? email.split('@')[0] : null) ??
    (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : null)

  return (
    <PrivyAuthContext.Provider
      value={{
        privyAuthenticated: ready && authenticated,
        privyWalletAddress: walletAddress,
        privyEmail: email,
        privyDisplayName: displayName,
        privyLogin: login,
        privyLogout: logout,
      }}
    >
      {children}
    </PrivyAuthContext.Provider>
  )
}
