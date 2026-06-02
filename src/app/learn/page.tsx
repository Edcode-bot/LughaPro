import type { Metadata } from 'next'
import { LearnClient } from '@/components/LearnClient'

export const metadata: Metadata = {
  title: 'Content Library — LughaPro',
  description: 'Browse books, posts, and lessons from top Kiswahili creators.',
}

export default function LearnPage() {
  return <LearnClient />
}
