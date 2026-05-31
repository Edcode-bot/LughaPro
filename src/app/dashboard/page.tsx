'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { TutorDashboard } from '@/components/TutorDashboard'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardRouter />
    </AuthGuard>
  )
}

function DashboardRouter() {
  const [role, setRole] = useState<'student' | 'tutor' | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lugha_role')
    setRole(stored === 'tutor' ? 'tutor' : 'student')
  }, [])

  if (role === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-off-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    )
  }

  if (role === 'tutor') return <TutorDashboard />
  return <StudentDashboard />
}
