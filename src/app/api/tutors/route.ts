import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const params = request.nextUrl.searchParams
  const search = params.get('search')
  const filter = params.get('filter')
  const maxPrice = params.get('max_price')
  const page = Math.max(Number(params.get('page') ?? '1'), 1)
  const limit = Math.min(Math.max(Number(params.get('limit') ?? '6'), 1), 50)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('tutors')
    .select('*, profile:profiles(*)', { count: 'exact' })

  if (filter === 'online') query = query.eq('is_online', true)
  if (filter === 'cusd') query = query.eq('accepts_cusd', true)
  if (filter === 'top_rated') query = query.gte('rating', 4.7)
  if (maxPrice) query = query.lte('hourly_rate', Number(maxPrice))
  if (search) {
    query = query.or(`bio.ilike.%${search}%,specialty.ilike.%${search}%,location.ilike.%${search}%`)
  }

  const { data, error, count } = await query.order('rating', { ascending: false }).range(from, to)

  if (error) return jsonError('Unable to load tutors', 500)

  return jsonOk({ items: data ?? [], page, limit, total: count ?? 0 }, 'Tutors loaded')
}

