'use client'

import { Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

type FileUploadProps = {
  label: string
  kind: 'cover' | 'thumbnail' | 'avatar' | 'pdf' | 'video'
  accept?: string
  previewUrl?: string | null
  onUploaded: (url: string) => void
  hint?: string
}

export function FileUpload({ label, kind, accept, previewUrl, onUploaded, hint }: FileUploadProps) {
  const { address } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultAccept =
    kind === 'pdf'
      ? 'application/pdf'
      : kind === 'video'
        ? 'video/mp4,video/webm,video/quicktime'
        : 'image/jpeg,image/png,image/webp,image/gif'

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !address) return
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', kind)
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-wallet-address': address },
        body,
      })
      const result = await response.json() as { data?: { url: string }; error?: string }
      if (result.error || !result.data?.url) {
        setError(result.error ?? 'Upload failed')
        return
      }
      onUploaded(result.data.url)
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-forest">{label}</span>
      {hint ? <p className="text-xs text-foreground/55">{hint}</p> : null}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-forest/20 bg-off-white px-4 py-6 transition hover:border-gold">
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-forest/50" />
            <span className="mt-2 text-sm font-bold text-forest">Choose file</span>
          </>
        )}
        <input
          type="file"
          accept={accept ?? defaultAccept}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleChange(e)}
        />
      </label>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-32 max-w-xs rounded-xl object-cover" />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
