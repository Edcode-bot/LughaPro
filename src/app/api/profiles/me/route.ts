import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)

  try {
    const body = await request.json() as {
      full_name?: string
      bio?: string
      country?: string
      languages?: string[] | string
    }

    const languages = Array.isArray(body.languages)
      ? body.languages
      : typeof body.languages === 'string'
        ? body.languages.split(',').map((item) => item.trim()).filter(Boolean)
        : undefined

    const updates: Record<string, unknown> = {}
    if (body.full_name !== undefined) updates.full_name = body.full_name
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.country !== undefined) updates.country = body.country
    if (languages !== undefined) updates.languages = languages

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('wallet_address', auth.profile.wallet_address)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Profile updated')
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to update profile', 500)
  }
}
