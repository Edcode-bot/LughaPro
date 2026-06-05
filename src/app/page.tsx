import type { Metadata } from 'next'
import { HomeClient } from '@/components/HomeClient'

export const metadata: Metadata = {
  title: "LughaPro — Learn. Discover. Preserve.",
  description: "Learn. Discover. Preserve. — Where Africa's languages, arts, music, and wisdom are alive — and open to the world.",
}

export default function Home() {
  return <HomeClient />
}

