import { ChangeEvent } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

// IMPORTANT: Create these buckets in Supabase Dashboard → Storage:
// 1. 'covers' bucket — public — for cover images and avatars
// 2. 'books' bucket — public — for PDF files
// Then set bucket policies to allow public reads and authenticated uploads.

export async function uploadToSupabaseStorage(file: File, bucket: 'covers' | 'books') {
  const supabase = createBrowserSupabaseClient()
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error || !data) {
    throw new Error(error?.message ?? 'Upload failed')
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function handleImageUpload(
  event: ChangeEvent<HTMLInputElement>,
  onPreview: (url: string) => void,
  onUploaded: (publicUrl: string) => void,
  bucket: 'covers' | 'books' = 'covers',
) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    if (typeof ev.target?.result === 'string') onPreview(ev.target.result)
  }
  reader.readAsDataURL(file)

  const publicUrl = await uploadToSupabaseStorage(file, bucket)
  onUploaded(publicUrl)
}
