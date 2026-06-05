import { ContentCategory, ContentItem, ContentType } from '@/types'

export function contentTypeLabel(type: ContentType) {
  if (type === 'book') return 'Book'
  if (type === 'post') return 'Post'
  if (type === 'video') return 'Video'
  if (type === 'music') return 'Music'
  return 'Lesson'
}

/** Solid hex color for category placeholders — no emoji, no gradients */
export function categoryColor(category?: ContentCategory | string | null): string {
  if (category === 'music') return '#171717'
  if (category === 'arts') return '#FFBF00'
  if (category === 'literature') return '#2d6a4f'
  if (category === 'video') return '#171717'
  if (category === 'experience') return '#1a4731'
  return '#1a4731'
}

export function categoryTextColor(category?: ContentCategory | string | null): string {
  if (category === 'arts') return '#171717'
  return '#ffffff'
}

export function contentCoverStyle(type: ContentType) {
  if (type === 'book') return 'bg-[#1a4731]'
  if (type === 'post') return 'bg-[#FFBF00]'
  if (type === 'video') return 'bg-[#171717]'
  if (type === 'music') return 'bg-[#171717]'
  return 'bg-[#2d6a4f]'
}

export function contentCoverEmoji(_type: ContentType) {
  return ''
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
}

export function countryFlag(country?: string | null) {
  const map: Record<string, string> = {
    Kenya: '🇰🇪',
    Tanzania: '🇹🇿',
    Uganda: '🇺🇬',
  }
  return country ? map[country] ?? '🌍' : '🌍'
}

export function isFreeContent(item: Pick<ContentItem, 'price'>) {
  return Number(item.price) <= 0
}

export function sortContent(items: ContentItem[], sort: string) {
  const copy = [...items]
  if (sort === 'popular') {
    return copy.sort((a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0))
  }
  if (sort === 'price_asc') {
    return copy.sort((a, b) => Number(a.price) - Number(b.price))
  }
  if (sort === 'free_first') {
    return copy.sort((a, b) => Number(a.price) - Number(b.price))
  }
  return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function filterContent(
  items: ContentItem[],
  filters: { type?: string; level?: string; price?: string; language?: string; search?: string },
) {
  return items.filter((item) => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false
    if (filters.level && filters.level !== 'all') {
      const level = item.level ?? 'All'
      if (filters.level === 'beginner' && !['A1', 'A2', 'All'].includes(level)) return false
      if (filters.level === 'intermediate' && !['B1', 'B2', 'All'].includes(level)) return false
      if (filters.level === 'advanced' && !['C1', 'C2', 'All'].includes(level)) return false
    }
    if (filters.price === 'free' && Number(item.price) > 0) return false
    if (filters.price === 'paid' && Number(item.price) <= 0) return false
    if (filters.language && filters.language !== 'all') {
      const lang = (item.language ?? 'Kiswahili').toLowerCase()
      if (filters.language === 'kiswahili' && !lang.includes('kiswahili')) return false
      if (filters.language === 'english' && !lang.includes('english')) return false
      if (filters.language === 'bilingual' && !lang.includes('bilingual')) return false
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = `${item.title} ${item.description ?? ''} ${item.author?.full_name ?? ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function previewText(text: string, ratio = 0.2) {
  const length = Math.max(80, Math.floor(text.length * ratio))
  return text.slice(0, length)
}
