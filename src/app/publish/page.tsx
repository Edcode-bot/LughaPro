'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function PublishPage() {
  return (
    <AuthGuard>
      <PublishClient />
    </AuthGuard>
  )
}

function PublishClient() {
  const { address, role } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState<'book' | 'post'>('book')
  const [submitting, setSubmitting] = useState(false)

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

  if (role !== 'tutor' && role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h1 className="font-serif text-3xl font-black text-forest">Become a Creator</h1>
          <p className="mt-3 text-foreground/65">
            Connect your wallet and select &quot;I want to teach&quot; to publish content.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
            Connect Wallet
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  async function publishBook() {
    if (!address) return
    setSubmitting(true)
    const response = await fetch('/api/content/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', wallet_address: address },
      body: JSON.stringify({
        ...book,
        tags: book.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        price: Number(book.price),
      }),
    })
    const result = await response.json()
    setSubmitting(false)
    if (result.error) {
      toast({ title: 'Publish failed', description: result.error, type: 'error' })
      return
    }
    toast({ title: 'Book published', type: 'success' })
  }

  async function publishPost() {
    if (!address) return
    setSubmitting(true)
    const response = await fetch('/api/content/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', wallet_address: address },
      body: JSON.stringify({
        ...post,
        tags: post.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        price: Number(post.price),
      }),
    })
    const result = await response.json()
    setSubmitting(false)
    if (result.error) {
      toast({ title: 'Publish failed', description: result.error, type: 'error' })
      return
    }
    toast({ title: 'Post published', type: 'success' })
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Publish Content</h1>
          <div className="mt-4 rounded-2xl bg-cream p-4 text-sm font-semibold text-forest">
            Creator tools coming soon — full file upload via Supabase Storage is being added. Paste external URLs for now.
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
            <form
              className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault()
                void publishBook()
              }}
            >
              <Field label="Title" value={book.title} onChange={(value) => setBook({ ...book, title: value })} />
              <TextArea label="Description" value={book.description} onChange={(value) => setBook({ ...book, description: value })} />
              <Field label="Level" value={book.level} onChange={(value) => setBook({ ...book, level: value })} />
              <Field label="Price (0 = free)" value={String(book.price)} onChange={(value) => setBook({ ...book, price: Number(value) })} />
              <Field label="Cover image URL" value={book.cover_image_url} onChange={(value) => setBook({ ...book, cover_image_url: value })} />
              {book.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.cover_image_url} alt="Cover preview" className="h-32 w-48 rounded-xl object-cover" />
              ) : null}
              <Field label="File URL (PDF link)" value={book.file_url} onChange={(value) => setBook({ ...book, file_url: value })} />
              <Field label="Tags (comma separated)" value={book.tags} onChange={(value) => setBook({ ...book, tags: value })} />
              <button type="submit" disabled={submitting} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50">
                {submitting ? 'Publishing...' : 'Publish Book'}
              </button>
            </form>
          ) : (
            <form
              className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault()
                void publishPost()
              }}
            >
              <Field label="Title" value={post.title} onChange={(value) => setPost({ ...post, title: value })} />
              <TextArea label="Content (markdown supported)" value={post.content} onChange={(value) => setPost({ ...post, content: value })} />
              <Field label="Cover image URL" value={post.cover_image_url} onChange={(value) => setPost({ ...post, cover_image_url: value })} />
              <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                <input type="checkbox" checked={post.is_premium} onChange={(event) => setPost({ ...post, is_premium: event.target.checked })} />
                Premium post
              </label>
              {post.is_premium ? (
                <Field label="Price" value={String(post.price)} onChange={(value) => setPost({ ...post, price: Number(value) })} />
              ) : null}
              <Field label="Tags" value={post.tags} onChange={(value) => setPost({ ...post, tags: value })} />
              <button type="submit" disabled={submitting} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50">
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </form>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-forest/15 px-4 py-3 font-normal" />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-32 rounded-xl border border-forest/15 px-4 py-3 font-normal" />
    </label>
  )
}
