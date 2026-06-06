import { NextRequest } from 'next/server'
import { getAuthenticatedProfile, jsonError, jsonOk, parseJson } from '@/lib/api'
import { tutorUpdateSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Query profiles first — all wallet-registered users have a profiles row,
  // but not all have a tutors row.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, wallet_address, bio, country, languages, avatar_url, role, created_at')
    .eq('id', id)
    .maybeSingle()

  if (profileError) return jsonError('Unable to load profile', 500)
  if (!profile) return jsonError('Tutor not found', 404)

  // Optionally enrich with tutors-table data (may not exist for all users)
  const { data: tutorExtra } = await supabase
    .from('tutors')
    .select('rating, specialty, accepts_cusd, is_online, hourly_rate, availability(*), reviews(*, student:profiles(*))')
    .eq('id', id)
    .maybeSingle()

  return jsonOk(
    {
      id: profile.id,
      full_name: profile.full_name,
      wallet_address: profile.wallet_address,
      bio: profile.bio,
      country: profile.country,
      languages: profile.languages,
      avatar_url: profile.avatar_url,
      role: profile.role,
      created_at: profile.created_at,
      rating: tutorExtra?.rating ?? null,
      specialty: tutorExtra?.specialty ?? null,
      accepts_cusd: tutorExtra?.accepts_cusd ?? true,
      is_online: tutorExtra?.is_online ?? false,
      hourly_rate: tutorExtra?.hourly_rate ?? null,
      availability: tutorExtra?.availability ?? [],
      reviews: tutorExtra?.reviews ?? [],
    },
    'Tutor loaded',
  )
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

