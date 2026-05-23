import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { bookingCreateSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const parsed = await parseJson(request, bookingCreateSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid booking data', 422)

  const supabase = await createServerSupabaseClient()
  const { tutor_id, scheduled_at, duration_minutes, payment_method, notes } = parsed.data

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('tutor_id', tutor_id)
    .eq('scheduled_at', scheduled_at)
    .in('status', ['pending', 'paid', 'active'])
    .maybeSingle()

  if (existing) return jsonError('Selected slot is no longer available', 409)

  const { data: tutor } = await supabase.from('tutors').select('hourly_rate, profile_id').eq('id', tutor_id).maybeSingle()
  if (!tutor) return jsonError('Tutor not found', 404)

  const amount = Number(((Number(tutor.hourly_rate) * duration_minutes) / 60).toFixed(2))

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      tutor_id,
      student_id: auth.userId,
      scheduled_at,
      duration_minutes,
      payment_method,
      notes,
      amount,
      status: payment_method === 'fiat' ? 'pending_fiat' : 'pending',
    })
    .select('*')
    .single()

  if (error || !booking) return jsonError('Unable to create booking', 500)

  await supabase.from('notifications').insert({
    user_id: tutor.profile_id,
    title: 'New booking request',
    message: `${auth.profile.full_name} requested a ${duration_minutes} minute Kiswahili session.`,
    type: 'booking',
    read: false,
  })

  return jsonOk(booking, 'Booking created', 201)
}

export async function GET() {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { data: tutor } = await supabase.from('tutors').select('id').eq('profile_id', auth.userId).maybeSingle()

  let query = supabase
    .from('bookings')
    .select('*, student:profiles(*), tutor:tutors(*, profile:profiles(*))')
    .order('scheduled_at', { ascending: true })

  if (tutor?.id) {
    query = query.or(`student_id.eq.${auth.userId},tutor_id.eq.${tutor.id}`)
  } else {
    query = query.eq('student_id', auth.userId)
  }

  const { data, error } = await query
  if (error) return jsonError('Unable to load bookings', 500)

  return jsonOk(data ?? [], 'Bookings loaded')
}

