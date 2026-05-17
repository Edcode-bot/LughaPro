import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { reviewCreateSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const auth = await getAuthenticatedProfile()
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  const parsed = await parseJson(request, reviewCreateSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid review data', 422)

  const supabase = await createServerSupabaseClient()
  const { booking_id, tutor_id, rating, comment } = parsed.data

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('student_id', auth.userId)
    .eq('tutor_id', tutor_id)
    .eq('status', 'completed')
    .maybeSingle()

  if (!booking) return jsonError('Completed booking required before reviewing', 403)

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({ booking_id, tutor_id, student_id: auth.userId, rating, comment })
    .select('*')
    .single()

  if (error || !review) return jsonError('Unable to create review', 500)

  const { data: reviews } = await supabase.from('reviews').select('rating').eq('tutor_id', tutor_id)
  const ratings = reviews ?? []
  const average = ratings.length ? ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length : rating

  await supabase
    .from('tutors')
    .update({ rating: Number(average.toFixed(2)), review_count: ratings.length })
    .eq('id', tutor_id)

  return jsonOk(review, 'Review created', 201)
}

