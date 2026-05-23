'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

export function useAuth() {
  const { address, isConnected, status } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  function connectMetaMask() {
    connect({ connector: injected({ target: 'metaMask' }) })
  }

  function connectWalletConnect() {
    connect({ connector: walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '', showQrModal: true }) })
  }

  function connectBrowserWallet() {
    connect({ connector: injected() })
  }

  const displayName = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'

  return {
    address,
    isConnected,
    isLoading: isPending || status === 'connecting',
    displayName,
    connectMetaMask,
    connectWalletConnect,
    connectBrowserWallet,
    disconnect,
  }
}
