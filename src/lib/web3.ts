import { createConfig, http, injected } from 'wagmi'
import { celo, celoAlfajores } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'placeholder'

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  {
    appName: 'LughaPro',
    projectId,
  },
)

export const miniPayConnector = injected({ shimDisconnect: true })

export const config = createConfig({
  chains: [celo, celoAlfajores],
  connectors: [miniPayConnector, ...rainbowConnectors],
  ssr: true,
  transports: {
    [celo.id]: http('https://forno.celo.org'),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
  },
})
