'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function TutorGuard({ children }: { children: React.ReactNode }) {
  const { role, isLoading, isConnected } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isConnected && role !== 'tutor' && role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [role, isLoading, isConnected, router])

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  if (role !== 'tutor' && role !== 'admin') return null
  return <>{children}</>
}
