'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace('/')
    }
  }, [isConnected, isLoading, router])

  if (isLoading) return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFBF00] border-t-transparent" />
    </div>
  )
  if (!isConnected) return null
  return <>{children}</>
}
