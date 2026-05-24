import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  if (auth.profile.role !== 'tutor' && auth.profile.role !== 'admin') {
    return jsonError('Only creators can publish books', 403)
  }

  try {
    const body = await request.json() as {
      title?: string
      description?: string
      level?: string
      price?: number
      cover_image_url?: string
      file_url?: string
      tags?: string[]
      language?: string
      content_type?: string
    }

    if (!body.title?.trim()) return jsonError('Title is required', 422)

    const { data, error } = await supabaseAdmin
      .from('books')
      .insert({
        author_id: auth.profile.id,
        title: body.title.trim(),
        description: body.description ?? null,
        level: body.level ?? 'All',
        price: Number(body.price ?? 0),
        cover_image_url: body.cover_image_url ?? null,
        file_url: body.file_url ?? null,
        tags: body.tags ?? [],
        language: body.language ?? 'Kiswahili',
        content_type: body.content_type ?? 'book',
        published: true,
      })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)
    return jsonOk(data, 'Book published', 201)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to publish book', 500)
  }
}
