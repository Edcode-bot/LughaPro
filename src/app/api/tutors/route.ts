import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

const SEEDED_WALLET_PREFIX = '0x000000000000000000000000000000000000000'

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
    .select('*, profile:profiles!inner(*)', { count: 'exact' })
    .not('profiles.wallet_address', 'like', `${SEEDED_WALLET_PREFIX}%`)

  if (filter === 'online') query = query.eq('is_online', true)
  if (filter === 'cusd') query = query.eq('accepts_cusd', true)
  if (filter === 'top_rated') query = query.gte('rating', 4.7)
  if (filter === 'featured') query = query.eq('is_featured', true)
  if (maxPrice) query = query.lte('hourly_rate', Number(maxPrice))
  if (search) {
    query = query.or(`bio.ilike.%${search}%,specialty.ilike.%${search}%,location.ilike.%${search}%`)
  }

  const { data, error, count } = await query.order('rating', { ascending: false }).range(from, to)

  if (error) {
    const fallback = await supabaseAdmin
      .from('tutors')
      .select('*, profile:profiles(*)')
      .order('rating', { ascending: false })
      .range(from, to)

    const items = (fallback.data ?? []).filter((tutor) => {
      const wallet = (tutor.profile as { wallet_address?: string } | null)?.wallet_address?.toLowerCase()
      return wallet && !wallet.startsWith(SEEDED_WALLET_PREFIX)
    })

    return jsonOk({ items, page, limit, total: items.length }, 'Tutors loaded')
  }

  return jsonOk({ items: data ?? [], page, limit, total: count ?? 0 }, 'Tutors loaded')
}
