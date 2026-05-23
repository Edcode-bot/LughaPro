import { ContentItem, ContentType } from '@/types'

export function contentTypeLabel(type: ContentType) {
  if (type === 'book') return 'Book'
  if (type === 'post') return 'Post'
  return 'Lesson'
}

export function contentCoverStyle(type: ContentType) {
  if (type === 'book') return 'bg-gradient-to-br from-forest to-jade'
  if (type === 'post') return 'bg-gradient-to-br from-gold to-jade'
  return 'bg-gradient-to-br from-jade to-forest'
}

export function contentCoverEmoji(type: ContentType) {
  if (type === 'book') return '📚'
  if (type === 'post') return '📝'
  return '🎬'
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
