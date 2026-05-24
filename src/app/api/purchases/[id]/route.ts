import { jsonError, jsonOk, getWalletAddress } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const wallet = getWalletAddress(request)
  if (!wallet) return jsonError('wallet address is required', 401)

  const { id } = await params
  const body = await request.json() as {
    progress_status?: 'not_started' | 'reading' | 'completed'
    progress_percent?: number
  }

  const { data, error } = await supabaseAdmin
    .from('purchases')
    .update({
      progress_status: body.progress_status,
      progress_percent: body.progress_percent,
    })
    .eq('id', id)
    .eq('user_wallet', wallet)
    .select('*')
    .single()

  if (error) return jsonError(error.message, 500)
  return jsonOk(data, 'Purchase updated')
}
