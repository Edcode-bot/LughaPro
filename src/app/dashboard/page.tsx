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
  const [role, setRole] = useState<string>('student')

  useEffect(() => {
    const saved = localStorage.getItem('lugha_role')
    console.log('Role read from storage:', saved)
    if (saved) setRole(saved)
  }, [])

  if (role === 'tutor') return <TutorDashboard />
  return <StudentDashboard />
}
