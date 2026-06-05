import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const search = params.get('search')
  const filter = params.get('filter')
  const maxPrice = params.get('max_price')
  const page = Math.max(Number(params.get('page') ?? '1'), 1)
  const limit = Math.min(Math.max(Number(params.get('limit') ?? '6'), 1), 50)
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Query from profiles (the source of truth for all users) with left join to tutors
  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, wallet_address, bio, country, languages, avatar_url, created_at, tutors!left(id, rating, specialty, accepts_cusd, accepts_fiat, is_online, is_featured, hourly_rate)', { count: 'exact' })
    .eq('role', 'tutor')

  if (filter === 'online') query = query.eq('tutors.is_online', true)
  if (filter === 'cusd') query = query.eq('tutors.accepts_cusd', true)
  if (filter === 'top_rated') query = query.gte('tutors.rating', 4.7)
  if (maxPrice) query = query.lte('tutors.hourly_rate', Number(maxPrice))
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%,tutors.specialty.ilike.%${search}%`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return jsonError(error.message, 500)
  }

  // Normalize to TutorWithProfile shape expected by the frontend
  const items = (data ?? []).map((row) => {
    const tutorData = Array.isArray(row.tutors) ? row.tutors[0] : row.tutors
    const profile = {
      id: row.id,
      full_name: row.full_name,
      wallet_address: row.wallet_address,
      bio: row.bio,
      country: row.country,
      languages: row.languages,
      avatar_url: row.avatar_url,
    }
    return {
      id: row.id,
      rating: tutorData?.rating ?? 0,
      specialty: tutorData?.specialty ?? null,
      accepts_cusd: tutorData?.accepts_cusd ?? false,
      accepts_fiat: tutorData?.accepts_fiat ?? false,
      is_online: tutorData?.is_online ?? false,
      is_featured: tutorData?.is_featured ?? false,
      hourly_rate: tutorData?.hourly_rate ?? 0,
      profile,
    }
  })

  // Apply post-filter for online/cusd since supabase left join filter may not work as expected
  const filtered = items.filter((item) => {
    if (filter === 'online' && !item.is_online) return false
    if (filter === 'cusd' && !item.accepts_cusd) return false
    if (filter === 'top_rated' && item.rating < 4.7) return false
    return true
  })

  // Sort: rated first, then by order
  filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

  return jsonOk({ items: filtered, page, limit, total: count ?? filtered.length }, 'Tutors loaded')
}
