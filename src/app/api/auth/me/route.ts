import { jsonError, jsonOk } from '@/lib/api'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return jsonError('Authentication required', 401)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tutor:tutors(*)')
    .eq('id', session.user.id)
    .maybeSingle()

  if (!profile) return jsonError('Profile not found', 404)

  return jsonOk(profile, 'Current profile')
}

