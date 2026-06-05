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
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.png' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.png',
  },
  verification: {
    // TODO: Replace 'your-google-verification-code-here' with actual code from Search Console
    google: 'your-google-verification-code-here',
  },
  other: {
    'talentapp:project_verification':
      'b6f005b5b6023aba8fc8ce1426aecaaa5069931a78cb6f05c6535b65687eb21c8d50c3e058b3170706f1d9e81875951dcf3578f4dff68a212c9aa397bfc8426e',
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

