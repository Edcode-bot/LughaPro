'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ContentItem, PurchaseWithContent } from '@/types'

export function usePurchases() {
  const { address } = useAuth()
  const [purchases, setPurchases] = useState<PurchaseWithContent[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!address) {
      setPurchases([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/purchases?user=${address}`, {
        headers: { wallet_address: address },
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

  function hasAccess(contentId: string, contentType: string) {
    return purchases.some((purchase) => purchase.content_id === contentId && purchase.content_type === contentType)
  }

  async function recordPurchase(item: ContentItem) {
    if (!address) return false
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        wallet_address: address,
      },
      body: JSON.stringify({
        content_id: item.id,
        content_type: item.type,
        amount: item.price,
      }),
    })
    if (response.ok) {
      await refresh()
      return true
    }
    return false
  }

  return { purchases, loading, refresh, hasAccess, recordPurchase }
}
