'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ContentItem, PurchaseWithContent } from '@/types'

export function usePurchases() {
  const { address } = useAuth()
  const [purchases, setPurchases] = useState<PurchaseWithContent[]>([])
  const [loading, setLoading] = useState(true)

  const purchaseIds = useMemo(() => purchases.map((purchase) => purchase.content_id), [purchases])

  const refresh = useCallback(async () => {
    if (!address) {
      setPurchases([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/purchases?user=${address}`, {
        headers: { 'x-wallet-address': address },
      })
      const result = await response.json() as { data?: { items: PurchaseWithContent[] } }
      setPurchases(result.data?.items ?? [])
    } catch {
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function hasAccess(contentId: string) {
    return purchases.some((purchase) => purchase.content_id === contentId)
  }

  async function recordPurchase(item: ContentItem) {
    if (!address) return false
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': address,
      },
      body: JSON.stringify({
        content_id: item.id,
        content_type: item.type,
        amount: item.price,
        progress_status: 'reading',
        progress_percent: 10,
      }),
    })
    if (response.ok) {
      await refresh()
      return true
    }
    return false
  }

  async function updateProgress(purchaseId: string, status: 'reading' | 'completed', percent: number) {
    if (!address) return
    await fetch(`/api/purchases/${purchaseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': address,
      },
      body: JSON.stringify({ progress_status: status, progress_percent: percent }),
    })
    await refresh()
  }

  return { purchases, purchaseIds, loading, refresh, hasAccess, recordPurchase, updateProgress }
}
