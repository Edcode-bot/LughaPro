'use client'

import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'

function EditForm({ id, type }: { id: string; type: string }) {
  const router = useRouter()
  const { address } = useAuth()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [price, setPrice] = useState('0')
  const [isPremium, setIsPremium] = useState(false)
  const [tags, setTags] = useState('')
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/content/${id}?type=${type}`)
      .then((r) => r.json())
      .then((d: { data?: { title?: string; content?: string; description?: string; price?: number; is_free?: boolean; tags?: string[]; cover_image_url?: string | null } }) => {
        const data = d.data
        if (!data) return
        setTitle(data.title ?? '')
        setBody(data.content ?? data.description ?? '')
        setPrice(String(data.price ?? 0))
        setIsPremium(!data.is_free)
        setTags((data.tags ?? []).join(', '))
        setCurrentCoverUrl(data.cover_image_url ?? null)
      })
      .finally(() => setLoading(false))
  }, [id, type])

  async function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !address) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/cover', {
        method: 'POST',
        headers: { 'x-wallet-address': address },
        body: formData,
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        setCurrentCoverUrl(data.url)
      } else {
        alert(data.error ?? 'Image upload failed')
      }
    } catch {
      alert('Image upload failed')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!address) { setError('Wallet not found. Please reconnect.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({
          type,
          title,
          content: body,
          description: body,
          price,
          is_premium: isPremium,
          tags,
          cover_image_url: currentCoverUrl,
        }),
      })
      const result = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || result.error) throw new Error(result.error ?? 'Update failed')
      setSuccess(true)
      setTimeout(() => router.push('/my-content'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-white" />

  const isPost = type === 'post'
  const isBook = type === 'book'
  const showCoverUpload = isPost || isBook
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl">
      <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-5">
        <h2 className="font-serif text-2xl font-black text-[#1a4731]">Edit {typeLabel}</h2>

        {success && (
          <div className="rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            ✓ Saved! Redirecting to My Content…
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        )}

        {/* Title */}
        <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
          Title *
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none"
          />
        </label>

        {/* Cover image */}
        {showCoverUpload && (
          <div>
            <div className="text-sm font-semibold text-[#1a4731] mb-2">Cover Image</div>

            {currentCoverUrl ? (
              <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentCoverUrl} alt="cover" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCurrentCoverUrl(null)}
                  className="absolute top-2 right-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload-edit"
                  className="hidden"
                  onChange={(e) => void handleCoverUpload(e)}
                  disabled={uploadingCover}
                />
                <label
                  htmlFor="cover-upload-edit"
                  className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 cursor-pointer hover:border-[#FFBF00] transition-colors"
                >
                  <span className="text-2xl">🖼️</span>
                  <div>
                    <div className="text-sm font-semibold text-[#171717]">Upload cover image</div>
                    <div className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 10MB</div>
                  </div>
                </label>
              </div>
            )}

            {uploadingCover && (
              <div className="mt-2 text-sm text-[#1a4731] font-semibold animate-pulse">Uploading image…</div>
            )}
          </div>
        )}

        {/* Body / Description */}
        <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
          {isPost ? 'Content *' : 'Description'}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none resize-y"
          />
        </label>

        {/* Paid toggle (posts only) */}
        {isPost && (
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1a4731]">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Paid content
          </label>
        )}

        {/* Price */}
        {(isPremium || !isPost) && (
          <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
            Price (USD equivalent)
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none"
            />
          </label>
        )}

        {/* Tags */}
        <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
          Tags (comma separated)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploadingCover}
            className="flex-1 rounded-full bg-[#FFBF00] py-3 font-black text-[#171717] hover:bg-[#e6ac00] transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/my-content')}
            className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

function EditPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')
  const type = searchParams.get('type') ?? 'post'

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <EditForm id={id} type={type} />
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

export default function EditContentPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading…</div>}>
      <AuthGuard>
        <EditPageInner />
      </AuthGuard>
    </Suspense>
  )
}
