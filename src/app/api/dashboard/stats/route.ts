import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('user')?.toLowerCase()
  if (!wallet) return jsonError('user wallet is required', 422)

  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_wallet', wallet)

    if (error) {
      return jsonOk({ content_accessed: 0, books_in_library: 0, cusd_spent: 0 }, 'Dashboard stats loaded')
    }

    const items = purchases ?? []
    const booksInLibrary = items.filter((item) => item.content_type === 'book' || item.content_type === 'lesson').length
    const cusdSpent = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)

    return jsonOk({
      content_accessed: items.length,
      books_in_library: booksInLibrary,
      cusd_spent: Number(cusdSpent.toFixed(2)),
    }, 'Dashboard stats loaded')
  } catch {
    return jsonOk({ content_accessed: 0, books_in_library: 0, cusd_spent: 0 }, 'Dashboard stats loaded')
  }
}
