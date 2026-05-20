import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { MiniPayBanner } from '@/components/MiniPayBanner'

export const metadata: Metadata = {
  title: 'LughaPro  Learn Kiswahili with Web3',
  description: 'Premium Kiswahili tutoring marketplace powered by Celo blockchain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MiniPayBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}

