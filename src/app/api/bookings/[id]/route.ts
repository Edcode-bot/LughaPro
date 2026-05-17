import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, student:profiles(*), tutor:tutors(*, profile:profiles(*))')
    .eq('id', id)
    .maybeSingle()

  if (error) return jsonError('Unable to load booking', 500)
  if (!data) return jsonError('Booking not found', 404)

  const tutorProfileId = data.tutor?.profile_id as string | undefined
  if (data.student_id !== auth.userId && tutorProfileId !== auth.userId && auth.profile.role !== 'admin') {
    return jsonError('Forbidden', 403)
  }

  return jsonOk(data, 'Booking loaded')
}

