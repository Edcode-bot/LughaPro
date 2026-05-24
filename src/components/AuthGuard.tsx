'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isLoading, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace('/')
      return
    }
    if (!isLoading && isConnected && profile && !profile.onboarding_completed && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [isConnected, isLoading, profile, pathname, router])

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  if (!isConnected) return null
  if (profile && !profile.onboarding_completed && pathname !== '/onboarding') return null

  return <>{children}</>
}
