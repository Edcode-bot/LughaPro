import type { Metadata } from 'next'
import { TutorsClient } from '@/components/TutorsClient'

export const metadata: Metadata = {
  title: 'Find Tutors — LughaPro',
  description: 'Discover verified Kiswahili tutors and creators across Africa.',
}

export default function TutorsPage() {
  return <TutorsClient />
}
