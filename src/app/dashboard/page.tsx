import { AuthGuard } from '@/components/AuthGuard'
import { DashboardClient } from '@/components/DashboardClient'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardClient />
    </AuthGuard>
  )
}
