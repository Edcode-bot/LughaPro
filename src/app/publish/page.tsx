'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, FormEvent, Suspense, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { TutorGuard } from '@/components/TutorGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { uploadToSupabaseStorage } from '@/lib/upload'

// IMPORTANT: Create these buckets in Supabase Dashboard → Storage:
// 1. 'covers' bucket — public — for cover images
// 2. 'books' bucket — public — for PDF files
// Then set bucket policies to allow public reads

export default function PublishPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading...</div>}>
      <AuthGuard>
        <TutorGuard>
          <PublishClient />
        </TutorGuard>
      </AuthGuard>
    </Suspense>
  )
}

function PublishClient() {
  const router = useRouter()
  const params = useSearchParams()
  const initialTab = params.get('tab') === 'post' ? 'post' : 'book'
  const { address } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState<'book' | 'post'>(initialTab)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookCoverPreview, setBookCoverPreview] = useState('')
  const [postCoverPreview, setPostCoverPreview] = useState('')

  const [book, setBook] = useState({
    title: '',
    description: '',
    level: 'All',
    price: 0,
    cover_image_url: '',
    file_url: '',
    tags: '',
  })

  const [post, setPost] = useState({
    title: '',
    content: '',
    cover_image_url: '',
    is_premium: false,
    price: 0,
    tags: '',
  })

  async function uploadCover(event: ChangeEvent<HTMLInputElement>, target: 'book' | 'post') {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const preview = ev.target?.result as string
        if (target === 'book') setBookCoverPreview(preview)
        else setPostCoverPreview(preview)
      }
      reader.readAsDataURL(file)
      const publicUrl = await uploadToSupabaseStorage(file, 'covers')
      if (target === 'book') setBook((current) => ({ ...current, cover_image_url: publicUrl }))
      else setPost((current) => ({ ...current, cover_image_url: publicUrl }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Cover upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function uploadBookPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const publicUrl = await uploadToSupabaseStorage(file, 'books')
      setBook((current) => ({ ...current, file_url: publicUrl }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'PDF upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function publishBook(event: FormEvent) {
    event.preventDefault()
    if (!address) return
    if (!book.title.trim()) {
      setError('Title is required.')
      return
    }
    if (Number(book.price) < 0) {
      setError('Price must be 0 or greater.')
      return
    }
    setSubmitting(true)
    setError(null)
    const response = await fetch('/api/content/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({
        ...book,
        price: Number(book.price),
        tags: book.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    })
    const result = await response.json()
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    toast({ title: 'Book published!', type: 'success' })
    router.push('/my-content')
  }

  async function publishPost(event: FormEvent) {
    event.preventDefault()
    if (!address) return
    if (!post.title.trim() || !post.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    const response = await fetch('/api/content/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({
        ...post,
        price: Number(post.price),
        tags: post.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    })
    const result = await response.json()
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    toast({ title: 'Post published!', type: 'success' })
    router.push('/my-content')
  }

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-4xl font-black text-forest">Publish Content</h1>
            <Link href="/my-content" className="rounded-full border-2 border-forest px-5 py-2 text-sm font-bold text-forest">
              My Content
            </Link>
          </div>

          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setTab('book')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'book' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}>
              Publish Book
            </button>
            <button type="button" onClick={() => setTab('post')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'post' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}>
              Write Post
            </button>
          </div>

          {tab === 'book' ? (
            <form onSubmit={(e) => void publishBook(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={book.title} onChange={(v) => setBook({ ...book, title: v })} />
              <TextArea label="Description" value={book.description} onChange={(v) => setBook({ ...book, description: v })} />
              <Field label="Level" value={book.level} onChange={(v) => setBook({ ...book, level: v })} />
              <Field label="Price (0 = free)" value={String(book.price)} onChange={(v) => setBook({ ...book, price: Number(v) })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Cover image
                <input type="file" accept="image/*" onChange={(e) => void uploadCover(e, 'book')} />
              </label>
              {bookCoverPreview ? <img src={bookCoverPreview} alt="Preview" className="mt-2 h-32 w-full rounded-xl object-cover" /> : null}
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Book PDF
                <input type="file" accept=".pdf,application/pdf" onChange={(e) => void uploadBookPdf(e)} />
              </label>
              {book.file_url ? <p className="text-xs text-jade">PDF uploaded</p> : null}
              <Field label="Tags" value={book.tags} onChange={(v) => setBook({ ...book, tags: v })} />
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={submitting || uploading} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50">
                {submitting ? 'Publishing...' : uploading ? 'Uploading...' : 'Publish Book'}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => void publishPost(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={post.title} onChange={(v) => setPost({ ...post, title: v })} />
              <TextArea label="Content *" value={post.content} onChange={(v) => setPost({ ...post, content: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Cover image
                <input type="file" accept="image/*" onChange={(e) => void uploadCover(e, 'post')} />
              </label>
              {postCoverPreview ? <img src={postCoverPreview} alt="Preview" className="mt-2 h-32 w-full rounded-xl object-cover" /> : null}
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={post.is_premium} onChange={(e) => setPost({ ...post, is_premium: e.target.checked })} />
                Premium post
              </label>
              {post.is_premium ? <Field label="Price" value={String(post.price)} onChange={(v) => setPost({ ...post, price: Number(v) })} /> : null}
              <Field label="Tags" value={post.tags} onChange={(v) => setPost({ ...post, tags: v })} />
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={submitting || uploading} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50">
                {submitting ? 'Publishing...' : uploading ? 'Uploading...' : 'Publish Post'}
              </button>
            </form>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-forest/15 px-4 py-3 font-normal" />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-32 rounded-xl border border-forest/15 px-4 py-3 font-normal" />
    </label>
  )
}
