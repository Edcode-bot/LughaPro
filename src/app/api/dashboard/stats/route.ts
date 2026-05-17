import { getAuthenticatedProfile, jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const supabase = await createServerSupabaseClient()
  const { data: tutor } = await supabase.from('tutors').select('id').eq('profile_id', auth.userId).maybeSingle()

  let bookingQuery = supabase
    .from('bookings')
    .select('*, tutor:tutors(*, profile:profiles(*)), student:profiles(*)')
    .order('scheduled_at', { ascending: true })

  if (tutor?.id) {
    bookingQuery = bookingQuery.or(`student_id.eq.${auth.userId},tutor_id.eq.${tutor.id}`)
  } else {
    bookingQuery = bookingQuery.eq('student_id', auth.userId)
  }

  const { data: bookings, error } = await bookingQuery
  if (error) return jsonError('Unable to load dashboard stats', 500)

  const allBookings = bookings ?? []
  const completed = allBookings.filter((booking) => booking.status === 'completed')
  const totalSessions = completed.length
  const hoursLearned = completed.reduce((sum, booking) => sum + Number(booking.duration_minutes ?? 0) / 60, 0)
  const amountSpent = allBookings
    .filter((booking) => booking.student_id === auth.userId && ['paid', 'active', 'completed'].includes(String(booking.status)))
    .reduce((sum, booking) => sum + Number(booking.amount ?? 0), 0)

  const { count: referralCount } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', auth.userId)

  const upcomingSessions = allBookings
    .filter((booking) => new Date(booking.scheduled_at).getTime() >= Date.now() && booking.status !== 'cancelled')
    .slice(0, 3)

  const recentActivity = allBookings
    .slice()
    .sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime())
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      label: `Booking ${booking.status}`,
      timestamp: booking.updated_at ?? booking.created_at,
    }))

  return jsonOk({
    total_sessions: totalSessions,
    hours_learned: Number(hoursLearned.toFixed(1)),
    amount_spent: Number(amountSpent.toFixed(2)),
    referral_count: referralCount ?? 0,
    upcoming_sessions: upcomingSessions,
    recent_activity: recentActivity,
  }, 'Dashboard stats loaded')
}

