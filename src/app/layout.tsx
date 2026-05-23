import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { MiniPayBanner } from '@/components/MiniPayBanner'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: "LughaPro — Learn Kiswahili with Africa's Best Tutors",
  description: 'Book live Kiswahili sessions with verified African tutors. Pay with crypto or card.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "LughaPro — Learn Kiswahili with Africa's Best Tutors",
    description: 'Book live Kiswahili sessions with verified African tutors. Pay with crypto or card.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "LughaPro — Learn Kiswahili with Africa's Best Tutors",
    description: 'Book live Kiswahili sessions with verified African tutors. Pay with crypto or card.',
    images: ['/og-image.png'],
  },
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

