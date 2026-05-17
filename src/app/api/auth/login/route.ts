import { jsonError, jsonOk, parseJson } from '@/lib/api'
import { loginSchema } from '@/lib/schemas'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = await parseJson(request, loginSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid login data', 422)

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error || !data.session?.user) return jsonError('Invalid email or password', 401)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .maybeSingle()

  if (!profile) return jsonError('Profile not found', 404)

  return jsonOk({ session: data.session, profile }, 'Logged in successfully')
}

