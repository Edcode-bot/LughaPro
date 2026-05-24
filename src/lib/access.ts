import { ContentItem } from '@/types'

export function hasAccess(contentId: string, purchases: string[]): boolean {
  return purchases.includes(contentId)
}

export function canAccessContent(item: Pick<ContentItem, 'id' | 'price'>, purchases: string[]): boolean {
  return Number(item.price) <= 0 || hasAccess(item.id, purchases)
}

export function purchaseContentIds(purchases: { content_id: string }[]): string[] {
  return purchases.map((purchase) => purchase.content_id)
}
