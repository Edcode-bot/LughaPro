import { jsonError, jsonOk, parseJson } from '@/lib/api'
import { registerSchema } from '@/lib/schemas'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = await parseJson(request, registerSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid registration data', 422)

  const { email, password, full_name, role, referral_code } = parsed.data

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    })

    if (authError || !authData.user) return jsonError('Unable to create user', 400)

    const profilePayload = {
      id: authData.user.id,
      email,
      full_name,
      role,
      referral_code: null,
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profilePayload)
      .select('*')
      .single()

    if (profileError || !profile) return jsonError('Unable to create profile', 400)

    if (role === 'tutor') {
      const { error: tutorError } = await supabaseAdmin.from('tutors').insert({
        profile_id: authData.user.id,
        hourly_rate: 10,
        rating: 0,
        review_count: 0,
        is_online: false,
        accepts_cusd: true,
        accepts_celo: true,
        accepts_fiat: true,
      })

      if (tutorError) return jsonError('Unable to create tutor profile', 400)
    }

    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('referral_code', referral_code)
        .maybeSingle()

      if (referrer?.id) {
        await supabaseAdmin.from('referrals').insert({
          referrer_id: referrer.id,
          referred_id: authData.user.id,
          referral_code,
          status: 'pending',
          reward_amount: 5,
        })
      }
    }

    return jsonOk({ user: authData.user, profile }, 'Registered successfully', 201)
  } catch {
    return jsonError('Registration failed', 500)
  }
}

