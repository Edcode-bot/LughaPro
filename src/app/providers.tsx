'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { celo } from 'wagmi/chains'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ToastProvider } from '@/components/ui/Toast'
import { config } from '@/lib/web3'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <PrivyProvider
      appId="cmjzjfwc603wtl50c6f2wguxy"
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#FFBF00',
          logo: 'https://lugha-pro.vercel.app/logo.png',
          landingHeader: 'Welcome to LughaPro',
          loginMessage: 'Learn. Discover. Preserve.',
        },
        defaultChain: celo,
        supportedChains: [celo],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ScrollToTop />
            {children}
          </ToastProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
