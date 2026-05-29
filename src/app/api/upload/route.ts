import { jsonError, jsonOk, getWalletAuthenticatedProfile } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'lugha-content'
const MAX_BYTES = 50 * 1024 * 1024

const ALLOWED: Record<string, string[]> = {
  cover: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  thumbnail: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
}

export async function POST(request: Request) {
  const auth = await getWalletAuthenticatedProfile(request)
  if (auth.error || !auth.profile) return jsonError(auth.error ?? 'Authentication required', 401)
  if (auth.profile.role !== 'tutor' && auth.profile.role !== 'admin') {
    return jsonError('Only creators can upload files', 403)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') ?? 'cover')

    if (!(file instanceof File)) return jsonError('file is required', 422)
    if (file.size > MAX_BYTES) return jsonError('File must be under 50MB', 422)

    const allowed = ALLOWED[kind] ?? ALLOWED.cover
    if (!allowed.includes(file.type)) {
      return jsonError(`Invalid file type for ${kind}`, 422)
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
    const path = `${auth.profile.id}/${kind}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      return jsonError(
        error.message.includes('Bucket not found')
          ? 'Storage bucket "lugha-content" not found. Create it in Supabase Storage (public).'
          : error.message,
        500,
      )
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)
    return jsonOk({ url: urlData.publicUrl, path: data.path }, 'Uploaded', 201)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Upload failed', 500)
  }
}
