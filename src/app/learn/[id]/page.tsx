import { Suspense } from 'react'
import { LearnDetailClient } from '@/components/LearnDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Content — LughaPro',
  description: 'Read books and posts from Kiswahili creators on LughaPro.',
}

export default async function LearnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading...</div>}>
      <LearnDetailClient id={id} />
    </Suspense>
  )
}
