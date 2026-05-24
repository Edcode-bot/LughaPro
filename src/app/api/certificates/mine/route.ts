import { jsonError, jsonOk, getWalletAddress } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const wallet = getWalletAddress(request) ?? new URL(request.url).searchParams.get('user')?.toLowerCase()
  if (!wallet) return jsonError('wallet address is required', 422)

  try {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('student_wallet', wallet)
      .order('earned_at', { ascending: false })

    if (error) return jsonOk({ items: [] }, 'Certificates loaded')
    return jsonOk({ items: data ?? [] }, 'Certificates loaded')
  } catch {
    return jsonOk({ items: [] }, 'Certificates loaded')
  }
}
