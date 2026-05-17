import { jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) return jsonError('Unable to log out', 400)

  return jsonOk({ success: true }, 'Logged out successfully')
}

