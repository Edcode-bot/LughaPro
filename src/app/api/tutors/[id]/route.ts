import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { tutorUpdateSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tutor, error } = await supabase
    .from('tutors')
    .select('*, profile:profiles(*), availability(*), reviews(*, student:profiles(*))')
    .eq('id', id)
    .maybeSingle()

  if (error) return jsonError('Unable to load tutor', 500)
  if (!tutor) return jsonError('Tutor not found', 404)

  return jsonOk(tutor, 'Tutor loaded')
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const parsed = await parseJson(request, tutorUpdateSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid tutor data', 422)

  const supabase = await createServerSupabaseClient()
  const { data: tutor } = await supabase.from('tutors').select('*').eq('id', id).maybeSingle()
  if (!tutor) return jsonError('Tutor not found', 404)
  if (tutor.profile_id !== auth.userId && auth.profile.role !== 'admin') return jsonError('Forbidden', 403)

  const { full_name, avatar_url, availability, ...tutorUpdates } = parsed.data

  if (full_name !== undefined || avatar_url !== undefined) {
    await supabase
      .from('profiles')
      .update({ full_name, avatar_url })
      .eq('id', tutor.profile_id)
  }

  if (Object.keys(tutorUpdates).length > 0) {
    await supabase.from('tutors').update(tutorUpdates).eq('id', id)
  }

  if (availability) {
    await supabase.from('availability').delete().eq('tutor_id', id)
    if (availability.length > 0) {
      await supabase.from('availability').insert(availability.map((slot) => ({ ...slot, tutor_id: id })))
    }
  }

  const { data: updated } = await supabase
    .from('tutors')
    .select('*, profile:profiles(*), availability(*)')
    .eq('id', id)
    .single()

  return jsonOk(updated, 'Tutor updated')
}

