import { getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH() {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', auth.userId)
    .eq('read', false)

  if (error) return jsonError('Unable to mark notifications as read', 500)

  return jsonOk({ success: true }, 'All notifications marked as read')
}

