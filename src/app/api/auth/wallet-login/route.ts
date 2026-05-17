import { verifyMessage } from 'viem'
import { jsonError, jsonOk, parseJson } from '@/lib/api'
import { walletLoginSchema } from '@/lib/schemas'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = await parseJson(request, walletLoginSchema)
  if (parsed.error || !parsed.data) return jsonError(parsed.error ?? 'Invalid wallet login data', 422)

  const { wallet_address, signature, message } = parsed.data

  const valid = await verifyMessage({ address: wallet_address as `0x${string}`, message, signature: signature as `0x${string}` })
  if (!valid) return jsonError('Invalid wallet signature', 401)

  const normalizedWallet = wallet_address.toLowerCase()
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('wallet_address', normalizedWallet)
    .maybeSingle()

  if (existingProfile) {
    return jsonOk({ session: null, profile: existingProfile }, 'Wallet verified')
  }

  const generatedEmail = `${normalizedWallet.slice(2)}@wallet.lughapro.local`
  const generatedPassword = crypto.randomUUID() + crypto.randomUUID()

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: generatedEmail,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: { wallet_address: normalizedWallet, role: 'student' },
  })

  if (authError || !authData.user) return jsonError('Unable to create wallet account', 400)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: generatedEmail,
      full_name: `Wallet ${normalizedWallet.slice(0, 6)}`,
      role: 'student',
      wallet_address: normalizedWallet,
    })
    .select('*')
    .single()

  if (profileError || !profile) return jsonError('Unable to create wallet profile', 400)

  return jsonOk({ session: null, profile }, 'Wallet account created', 201)
}

