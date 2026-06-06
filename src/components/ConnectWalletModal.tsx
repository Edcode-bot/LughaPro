'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

/**
 * ConnectWalletModal — simplified Privy version.
 * Calling open=true immediately triggers the Privy auth modal which handles
 * email, Google, and wallet sign-in flows natively.
 */
export function ConnectWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, isConnected } = useAuth()

  // When opened: if already connected just close; otherwise open Privy modal
  useEffect(() => {
    if (!open) return
    if (isConnected) {
      onClose()
      return
    }
    // Trigger Privy's built-in auth modal
    login()
    // Close our wrapper immediately — Privy manages its own modal
    onClose()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // This component renders nothing — Privy's modal is injected at the root
  return null
}
