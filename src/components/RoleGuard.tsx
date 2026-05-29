'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

export function RoleGuard({
  children,
  allow,
}: {
  children: React.ReactNode
  allow: UserRole[]
}) {
  const { role, isLoading, isConnected, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !isConnected || !profile?.onboarding_completed) return
    const allowed = allow.includes(role) || (allow.includes('admin') && role === 'admin')
    if (!allowed) {
      router.replace('/dashboard')
    }
  }, [allow, isConnected, isLoading, profile?.onboarding_completed, role, router])

  if (isLoading || !profile?.onboarding_completed) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  const allowed = allow.includes(role) || (allow.includes('admin') && role === 'admin')
  if (!allowed) return null
  return <>{children}</>
}
