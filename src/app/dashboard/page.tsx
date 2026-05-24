'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { TutorDashboard } from '@/components/TutorDashboard'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardRouter />
    </AuthGuard>
  )
}

function DashboardRouter() {
  const { role } = useAuth()
  if (role === 'tutor' || role === 'admin') return <TutorDashboard />
  return <StudentDashboard />
}
