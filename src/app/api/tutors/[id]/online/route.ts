import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { onlineSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const parsed = await parseJson(request, onlineSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid online status', 422)

  const supabase = await createServerSupabaseClient()
  const { data: tutor } = await supabase.from('tutors').select('*').eq('id', id).maybeSingle()
  if (!tutor) return jsonError('Tutor not found', 404)
  if (tutor.profile_id !== auth.userId && auth.profile.role !== 'admin') return jsonError('Forbidden', 403)

  const { data, error } = await supabase
    .from('tutors')
    .update({ is_online: parsed.data.is_online })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return jsonError('Unable to update online status', 500)

  return jsonOk(data, 'Online status updated')
}

