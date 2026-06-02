import type { Metadata } from 'next'
import { HomeClient } from '@/components/HomeClient'

export const metadata: Metadata = {
  title: "LughaPro — Learn Kiswahili with Africa's Best Tutors",
  description: 'Browse premium Kiswahili books, posts, and lessons. Pay with cUSD or learn free.',
}

export default function Home() {
  return <HomeClient />
}

