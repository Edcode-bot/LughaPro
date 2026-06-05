import { NextRequest } from 'next/server'
import { jsonError, jsonOk, getWalletAddress } from '@/lib/api'
import { createServiceRoleClient } from '@/lib/supabase-service-role'

export async function POST(request: NextRequest) {
  const wallet = getWalletAddress(request)
  if (!wallet) return jsonError('wallet_address header is required', 401)

  try {
    const supabase = createServiceRoleClient()
    const body = await request.json() as {
      title?: string
      description?: string
      audio_url?: string
      cover_image_url?: string
      duration_seconds?: number
      genre?: string
      instrument?: string
      price?: number
      tags?: string[]
    }

    if (!body.title) return jsonError('title is required', 422)

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', wallet)
      .maybeSingle()

    if (!profile) return jsonError('Profile not found', 404)

    const { data, error } = await supabase
      .from('music')
      .insert({
        creator_id: profile.id,
        title: body.title,
        description: body.description ?? null,
        audio_url: body.audio_url ?? null,
        cover_image_url: body.cover_image_url ?? null,
        duration_seconds: body.duration_seconds ?? null,
        genre: body.genre ?? null,
        instrument: body.instrument ?? null,
        price: Number(body.price ?? 0),
        is_free: Number(body.price ?? 0) <= 0,
        tags: body.tags ?? [],
        published: true,
      })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Music published', 201)
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to publish music', 500)
  }
}
