import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MiniPayBanner } from '@/components/MiniPayBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <MiniPayBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}

