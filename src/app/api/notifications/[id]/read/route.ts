import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', auth.userId)
    .select('*')
    .maybeSingle()

  if (error) return jsonError('Unable to mark notification as read', 500)
  if (!data) return jsonError('Notification not found', 404)

  return jsonOk(data, 'Notification marked as read')
}

