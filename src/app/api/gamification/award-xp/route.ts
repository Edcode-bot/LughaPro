import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const XP_MAP: Record<string, number> = {
  publish_content: 50,
  first_purchase: 100,
  purchase: 20,
  daily_login: 10,
  complete_profile: 30,
  refer_friend: 75,
}

const LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Explorer', min: 100 },
  { name: 'Scholar', min: 300 },
  { name: 'Elder', min: 750 },
  { name: 'Griot', min: 1500 },
]

function getLevel(xp: number): string {
  let level = LEVELS[0].name
  for (const l of LEVELS) {
    if (xp >= l.min) level = l.name
  }
  return level
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { user_id?: string; action?: string; amount?: number }
    const { user_id, action, amount } = body

    if (!user_id || !action) {
      return NextResponse.json({ error: 'user_id and action required' }, { status: 400 })
    }

    const xpToAdd = amount ?? XP_MAP[action] ?? 0
    if (xpToAdd === 0) {
      return NextResponse.json({ error: 'Unknown action or zero XP' }, { status: 400 })
    }

    const supabase = serviceClient()

    // Upsert XP row
    const { data: existing } = await supabase
      .from('user_xp')
      .select('xp')
      .eq('user_id', user_id)
      .maybeSingle()

    const currentXp = existing?.xp ?? 0
    const newXp = currentXp + xpToAdd
    const newLevel = getLevel(newXp)

    await supabase
      .from('user_xp')
      .upsert({ user_id, xp: newXp, level: newLevel, last_active: new Date().toISOString().slice(0, 10) })

    return NextResponse.json({ success: true, xp: newXp, level: newLevel, added: xpToAdd })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
