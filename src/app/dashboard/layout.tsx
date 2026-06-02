import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — LughaPro',
  description: 'Your LughaPro learning or creator dashboard.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
