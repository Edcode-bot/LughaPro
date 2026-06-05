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
      video_url?: string
      thumbnail_url?: string
      duration_seconds?: number
      price?: number
      category?: string
      level?: string
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
      .from('videos')
      .insert({
        creator_id: profile.id,
        title: body.title,
        description: body.description ?? null,
        video_url: body.video_url ?? null,
        thumbnail_url: body.thumbnail_url ?? null,
        duration_seconds: body.duration_seconds ?? null,
        price: Number(body.price ?? 0),
        is_free: Number(body.price ?? 0) <= 0,
        category: body.category ?? 'language',
        level: body.level ?? 'N/A',
        tags: body.tags ?? [],
        published: true,
      })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Video published', 201)
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to publish video', 500)
  }
}
