import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { bookingStatusUpdateSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const parsed = await parseJson(request, bookingStatusUpdateSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid booking status', 422)

  const supabase = await createServerSupabaseClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, tutor:tutors(*)')
    .eq('id', id)
    .maybeSingle()

  if (!booking) return jsonError('Booking not found', 404)

  const tutorProfileId = booking.tutor?.profile_id as string | undefined
  if (booking.student_id !== auth.userId && tutorProfileId !== auth.userId && auth.profile.role !== 'admin') {
    return jsonError('Forbidden', 403)
  }

  const updates = parsed.data.status === 'paid'
    ? { status: parsed.data.status, tx_hash: parsed.data.tx_hash ?? null }
    : { status: parsed.data.status }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return jsonError('Unable to update booking status', 500)

  if (parsed.data.status === 'completed') {
    await supabase.from('notifications').insert({
      user_id: booking.student_id,
      title: 'How was your lesson?',
      message: 'Your session is complete. Leave a review for your tutor.',
      type: 'review_prompt',
      read: false,
    })
  }

  return jsonOk(data, 'Booking status updated')
}

