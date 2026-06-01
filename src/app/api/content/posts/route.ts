import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  const roleHeader = request.headers.get('x-lugha-role')
  const isCreator =
    auth.profile.role === 'tutor' ||
    auth.profile.role === 'admin' ||
    roleHeader === 'tutor'
  if (!isCreator) {
    return jsonError('Only creators can publish posts', 403)
  }

  try {
    const supabase = createAdminClient()
    const body = await request.json() as {
      title?: string
      content?: string
      cover_image_url?: string
      is_premium?: boolean
      price?: number
      tags?: string[]
      language?: string
    }

    if (!body.title?.trim() || !body.content?.trim()) {
      return jsonError('Title and content are required', 422)
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: auth.profile.id,
        title: body.title.trim(),
        content: body.content.trim(),
        cover_image_url: body.cover_image_url ?? null,
        is_premium: Boolean(body.is_premium),
        price: body.is_premium ? Number(body.price ?? 0) : 0,
        tags: body.tags ?? [],
        language: body.language ?? 'Kiswahili',
        published: true,
      })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Post published', 201)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to publish post', 500)
  }
}
