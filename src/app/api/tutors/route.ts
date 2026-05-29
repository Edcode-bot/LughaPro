import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { prioritizeRealTutors } from '@/lib/tutors'
import { supabaseAdmin } from '@/lib/supabase'

async function attachContentCounts<T extends { profile_id?: string; id?: string }>(tutors: T[]) {
  const ids = tutors.map((t) => t.profile_id ?? t.id).filter(Boolean) as string[]
  if (!ids.length) return tutors.map((t) => ({ ...t, content_count: 0 }))

  const [booksRes, postsRes] = await Promise.all([
    supabaseAdmin.from('books').select('author_id').in('author_id', ids),
    supabaseAdmin.from('posts').select('author_id').in('author_id', ids),
  ])

  const counts = new Map<string, number>()
  for (const row of booksRes.data ?? []) {
    counts.set(row.author_id, (counts.get(row.author_id) ?? 0) + 1)
  }
  for (const row of postsRes.data ?? []) {
    counts.set(row.author_id, (counts.get(row.author_id) ?? 0) + 1)
  }

  return tutors.map((tutor) => ({
    ...tutor,
    content_count: counts.get(tutor.profile_id ?? tutor.id ?? '') ?? 0,
  }))
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const search = params.get('search')
  const filter = params.get('filter')
  const maxPrice = params.get('max_price')
  const page = Math.max(Number(params.get('page') ?? '1'), 1)
  const limit = Math.min(Math.max(Number(params.get('limit') ?? '6'), 1), 50)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('tutors')
    .select('*, profile:profiles(*)', { count: 'exact' })

  if (filter === 'online') query = query.eq('is_online', true)
  if (filter === 'cusd') query = query.eq('accepts_cusd', true)
  if (filter === 'top_rated') query = query.gte('rating', 4.7)
  if (filter === 'featured') query = query.eq('is_featured', true)
  if (maxPrice) query = query.lte('hourly_rate', Number(maxPrice))
  if (search) {
    query = query.or(`bio.ilike.%${search}%,specialty.ilike.%${search}%,location.ilike.%${search}%`)
  }

  const { data, error, count } = await query.order('rating', { ascending: false }).range(from, to)

  if (error) return jsonError('Unable to load tutors', 500)

  const withProfiles = (data ?? []).filter(
    (row) => row.profile?.role === 'tutor' && row.profile?.onboarding_completed === true,
  )

  const prioritized = prioritizeRealTutors(withProfiles)
  const withCounts = await attachContentCounts(prioritized)
  const pageItems = withCounts.slice(0, limit)

  return jsonOk(
    { items: pageItems, page, limit, total: prioritized.length || count || 0 },
    'Tutors loaded',
  )
}
