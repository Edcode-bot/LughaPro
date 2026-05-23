import { DashboardClient } from '@/components/DashboardClient'
import { AuthGuard } from '@/components/AuthGuard'

export default function Dashboard() {
  return <AuthGuard><DashboardClient /></AuthGuard>
}
