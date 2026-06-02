import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { createServiceRoleClient } from '@/lib/supabase-service-role'

export async function GET(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  return jsonOk(auth.profile, 'Profile loaded')
}

export async function PATCH(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  try {
    const supabase = createServiceRoleClient()
    const body = await request.json() as {
      full_name?: string
      bio?: string
      country?: string
      languages?: string[] | string
      avatar_url?: string
      onboarding_completed?: boolean
      specialty?: string[] | string
    }

    const languages = Array.isArray(body.languages)
      ? body.languages
      : typeof body.languages === 'string'
        ? body.languages.split(',').map((item) => item.trim()).filter(Boolean)
        : undefined

    const specialty = Array.isArray(body.specialty)
      ? body.specialty
      : typeof body.specialty === 'string'
        ? body.specialty.split(',').map((item) => item.trim()).filter(Boolean)
        : undefined

    const updates: Record<string, unknown> = {}
    if (body.full_name !== undefined) updates.full_name = body.full_name.trim()
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.country !== undefined) updates.country = body.country
    if (languages !== undefined) updates.languages = languages
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url
    if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('wallet_address', auth.profile.wallet_address)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)

    if (auth.profile.role === 'tutor' && specialty) {
      await supabase.from('tutors').upsert(
        {
          id: auth.profile.id,
          profile_id: auth.profile.id,
          specialty: specialty.join(', '),
          languages: languages ?? auth.profile.languages,
        },
        { onConflict: 'id' },
      )
    }

    return jsonOk(data, 'Profile updated')
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to update profile', 500)
  }
}
