import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publish Content — LughaPro',
  description: 'Publish books and posts as a Kiswahili creator on LughaPro.',
}

export default function PublishLayout({ children }: { children: React.ReactNode }) {
  return children
}
