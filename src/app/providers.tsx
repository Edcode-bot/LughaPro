'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/web3'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { isMiniPay } from '@/lib/minipay'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RainbowKitProvider>
            <MiniPayAutoConnect />
            {children}
          </RainbowKitProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect()

  useEffect(() => {
    if (!isMiniPay()) return
    const miniPay = connectors.find((connector) => connector.id === 'injected' || connector.name === 'MiniPay')
    if (miniPay) connect({ connector: miniPay })
  }, [connect, connectors])

  return null
}

