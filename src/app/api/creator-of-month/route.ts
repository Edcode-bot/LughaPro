import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: topXp } = await supabase
    .from('user_xp')
    .select('user_id, xp, level')
    .order('xp', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!topXp) return NextResponse.json({ data: null })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, country, wallet_address')
    .eq('id', topXp.user_id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ data: null })

  return NextResponse.json({
    data: {
      ...profile,
      xp: topXp.xp,
      level: topXp.level,
    },
  })
}
