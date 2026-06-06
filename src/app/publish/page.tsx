'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ChangeEvent, FormEvent, Suspense, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'All'] as const

function CoverPreview({ src }: { src: string }) {
  return (
    <div className="relative mt-2 w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
      <img src={src} alt="Cover preview" className="h-full w-full object-cover" />
    </div>
  )
}

async function uploadFile(file: File, bucket: string): Promise<string> {
  const supabase = createBrowserSupabaseClient()
  const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '-')}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: true })
  if (error) throw new Error(error.message)
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

function getWalletAddress(): string | null {
  try {
    const raw = localStorage.getItem('lugha_profile')
    if (!raw) return null
    const profile = JSON.parse(raw) as { wallet_address?: string }
    return profile.wallet_address ?? null
  } catch {
    return null
  }
}

export default function PublishPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading...</div>}>
      <AuthGuard>
        <PublishClient />
      </AuthGuard>
    </Suspense>
  )
}

const CONTENT_CATEGORIES = ['language', 'music', 'arts', 'literature', 'video', 'other'] as const

function PublishClient() {
  const [tab, setTab] = useState<'book' | 'post' | 'video' | 'music'>('book')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null)
  const [bookCoverPreview, setBookCoverPreview] = useState('')
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [bookFileMode, setBookFileMode] = useState<'upload' | 'url'>('upload')

  const [postCoverFile, setPostCoverFile] = useState<File | null>(null)
  const [postCoverPreview, setPostCoverPreview] = useState('')

  const [book, setBook] = useState({
    title: '',
    description: '',
    level: 'All',
    price: 0,
    isFree: true,
    file_url: '',
    tags: '',
  })

  const [post, setPost] = useState({
    title: '',
    content: '',
    is_premium: false,
    price: 0,
    tags: '',
  })

  const [video, setVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    price: 0,
    category: 'language',
    level: 'N/A',
    tags: '',
  })
  const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null)
  const [videoThumbPreview, setVideoThumbPreview] = useState('')

  const [music, setMusic] = useState({
    title: '',
    description: '',
    audio_url: '',
    genre: '',
    instrument: '',
    price: 0,
    tags: '',
  })
  const [musicCoverFile, setMusicCoverFile] = useState<File | null>(null)
  const [musicCoverPreview, setMusicCoverPreview] = useState('')

  function onImagePick(event: ChangeEvent<HTMLInputElement>, target: 'book' | 'post') {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (target === 'book') {
      setBookCoverFile(file)
      setBookCoverPreview(preview)
    } else {
      setPostCoverFile(file)
      setPostCoverPreview(preview)
    }
  }

  function resetBookForm() {
    setBook({
      title: '',
      description: '',
      level: 'All',
      price: 0,
      isFree: true,
      file_url: '',
      tags: '',
    })
    setBookCoverFile(null)
    setBookCoverPreview('')
    setBookFile(null)
    setBookFileMode('upload')
  }

  function resetPostForm() {
    setPost({
      title: '',
      content: '',
      is_premium: false,
      price: 0,
      tags: '',
    })
    setPostCoverFile(null)
    setPostCoverPreview('')
  }

  async function publishBook(event: FormEvent) {
    event.preventDefault()
    setSuccess(null)
    setError(null)

    if (!book.title.trim() || !book.description.trim()) {
      setError('Title and description are required.')
      return
    }

    const wallet = getWalletAddress()
    if (!wallet) {
      setError('Wallet not found. Please connect your wallet again.')
      return
    }

    setSubmitting(true)
    try {
      let cover_image_url: string | undefined
      if (bookCoverFile) {
        cover_image_url = await uploadFile(bookCoverFile, 'covers')
      }

      let file_url = book.file_url.trim() || undefined
      if (bookFileMode === 'upload' && bookFile) {
        file_url = await uploadFile(bookFile, 'books')
      }

      const price = book.isFree ? 0 : Number(book.price)
      const role = localStorage.getItem('lugha_role') ?? 'tutor'

      const response = await fetch('/api/content/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': wallet,
          'x-lugha-role': role,
        },
        body: JSON.stringify({
          title: book.title.trim(),
          description: book.description.trim(),
          level: book.level,
          price,
          cover_image_url,
          file_url,
          tags: book.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Failed to publish book')
      }

      setSuccess('Published successfully!')
      resetBookForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish book')
    } finally {
      setSubmitting(false)
    }
  }

  async function publishPost(event: FormEvent) {
    event.preventDefault()
    setSuccess(null)
    setError(null)

    if (!post.title.trim() || !post.content.trim()) {
      setError('Title and content are required.')
      return
    }

    const wallet = getWalletAddress()
    if (!wallet) {
      setError('Wallet not found. Please connect your wallet again.')
      return
    }

    setSubmitting(true)
    try {
      let cover_image_url: string | undefined
      if (postCoverFile) {
        cover_image_url = await uploadFile(postCoverFile, 'covers')
      }

      const role = localStorage.getItem('lugha_role') ?? 'tutor'

      const response = await fetch('/api/content/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': wallet,
          'x-lugha-role': role,
        },
        body: JSON.stringify({
          title: post.title.trim(),
          content: post.content.trim(),
          cover_image_url,
          is_premium: post.is_premium,
          price: post.is_premium ? Number(post.price) : 0,
          tags: post.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Failed to publish post')
      }

      setSuccess('Published successfully!')
      resetPostForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post')
    } finally {
      setSubmitting(false)
    }
  }

  async function publishVideo(event: FormEvent) {
    event.preventDefault()
    setSuccess(null); setError(null)
    if (!video.title.trim()) { setError('Title is required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let thumbnail_url: string | null = null
      if (videoThumbFile) thumbnail_url = await uploadFile(videoThumbFile, 'covers')
      const res = await fetch('/api/content/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
        body: JSON.stringify({
          title: video.title.trim(),
          description: video.description.trim() || null,
          video_url: video.video_url.trim() || null,
          thumbnail_url,
          price: Number(video.price),
          category: video.category,
          level: video.level,
          tags: video.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish video')
      setSuccess('Video published!')
      setVideo({ title: '', description: '', video_url: '', price: 0, category: 'language', level: 'N/A', tags: '' })
      setVideoThumbFile(null); setVideoThumbPreview('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish video')
    } finally { setSubmitting(false) }
  }

  async function publishMusic(event: FormEvent) {
    event.preventDefault()
    setSuccess(null); setError(null)
    if (!music.title.trim()) { setError('Title is required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | null = null
      if (musicCoverFile) cover_image_url = await uploadFile(musicCoverFile, 'covers')
      const res = await fetch('/api/content/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
        body: JSON.stringify({
          title: music.title.trim(),
          description: music.description.trim() || null,
          audio_url: music.audio_url.trim() || null,
          cover_image_url,
          genre: music.genre.trim() || null,
          instrument: music.instrument.trim() || null,
          price: Number(music.price),
          tags: music.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish music')
      setSuccess('Music published!')
      setMusic({ title: '', description: '', audio_url: '', genre: '', instrument: '', price: 0, tags: '' })
      setMusicCoverFile(null); setMusicCoverPreview('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish music')
    } finally { setSubmitting(false) }
  }

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Publish Content</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setTab('book'); setSuccess(null); setError(null) }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'book' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}
            >
              📚 Publish Book
            </button>
            <button
              type="button"
              onClick={() => { setTab('post'); setSuccess(null); setError(null) }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'post' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}
            >
              ✍️ Write Post
            </button>
            <button
              type="button"
              onClick={() => { setTab('video'); setSuccess(null); setError(null) }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'video' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}
            >
              🎬 Upload Video
            </button>
            <button
              type="button"
              onClick={() => { setTab('music'); setSuccess(null); setError(null) }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'music' ? 'bg-gold text-foreground' : 'bg-white text-forest'}`}
            >
              🎵 Upload Music
            </button>
          </div>

          {success ? <p className="mt-4 rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">{success}</p> : null}
          {error ? <p className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}

          {tab === 'book' ? (
            <form onSubmit={(e) => void publishBook(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={book.title} onChange={(v) => setBook({ ...book, title: v })} required />

              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description *
                <textarea
                  required
                  value={book.description}
                  onChange={(e) => setBook({ ...book, description: e.target.value })}
                  className="min-h-28 rounded-xl border border-forest/15 px-4 py-3 font-normal"
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-forest">Level</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBook({ ...book, level })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${book.level === level ? 'bg-gold text-foreground' : 'bg-off-white text-forest'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                <input
                  type="checkbox"
                  checked={book.isFree}
                  onChange={(e) => setBook({ ...book, isFree: e.target.checked, price: e.target.checked ? 0 : book.price })}
                />
                Is Free
              </label>

              {!book.isFree ? (
                <label className="grid gap-2 text-sm font-semibold text-forest">
                  Price (cUSD)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={book.price}
                    onChange={(e) => setBook({ ...book, price: Number(e.target.value) })}
                    className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
                  />
                </label>
              ) : (
                <p className="text-xs text-foreground/55">0 = Free</p>
              )}

              <label className="grid gap-2 text-sm font-semibold text-forest">
                Cover image
                <input type="file" accept="image/*" onChange={(e) => onImagePick(e, 'book')} />
              </label>
              {bookCoverPreview ? <CoverPreview src={bookCoverPreview} /> : null}

              <div>
                <p className="text-sm font-semibold text-forest">Book file</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookFileMode('upload')}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'upload' ? 'bg-forest text-white' : 'bg-off-white text-forest'}`}
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookFileMode('url')}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'url' ? 'bg-forest text-white' : 'bg-off-white text-forest'}`}
                  >
                    External URL
                  </button>
                </div>
                {bookFileMode === 'upload' ? (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="mt-2 block w-full text-sm"
                    onChange={(e) => setBookFile(e.target.files?.[0] ?? null)}
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={book.file_url}
                    onChange={(e) => setBook({ ...book, file_url: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm font-normal"
                  />
                )}
              </div>

              <Field label="Tags (comma separated)" value={book.tags} onChange={(v) => setBook({ ...book, tags: v })} />

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-black text-foreground disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                    Publishing...
                  </>
                ) : (
                  'Publish Book'
                )}
              </button>
            </form>
          ) : null}

          {tab === 'post' ? (
            <form onSubmit={(e) => void publishPost(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={post.title} onChange={(v) => setPost({ ...post, title: v })} required />

              <label className="grid gap-2 text-sm font-semibold text-forest">
                Content *
                <textarea
                  required
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  style={{ minHeight: 200 }}
                  className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-forest">
                Cover image
                <input type="file" accept="image/*" onChange={(e) => onImagePick(e, 'post')} />
              </label>
              {postCoverPreview ? <CoverPreview src={postCoverPreview} /> : null}

              <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                <input
                  type="checkbox"
                  checked={post.is_premium}
                  onChange={(e) => setPost({ ...post, is_premium: e.target.checked })}
                />
                Is Premium
              </label>

              {post.is_premium ? (
                <label className="grid gap-2 text-sm font-semibold text-forest">
                  Price (cUSD)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={post.price}
                    onChange={(e) => setPost({ ...post, price: Number(e.target.value) })}
                    className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
                  />
                </label>
              ) : null}

              <Field label="Tags (comma separated)" value={post.tags} onChange={(v) => setPost({ ...post, tags: v })} />

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-black text-foreground disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                    Publishing...
                  </>
                ) : (
                  'Publish Post'
                )}
              </button>
            </form>
          ) : null}

          {/* ── VIDEO TAB ── */}
          {tab === 'video' ? (
            <form onSubmit={(e) => void publishVideo(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={video.title} onChange={(v) => setVideo({ ...video, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description
                <textarea value={video.description} onChange={(e) => setVideo({ ...video, description: e.target.value })} className="min-h-24 rounded-xl border border-forest/15 px-4 py-3 font-normal" />
              </label>
              <Field label="Video URL (YouTube, Vimeo, or direct)" value={video.video_url} onChange={(v) => setVideo({ ...video, video_url: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Thumbnail image
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return
                  setVideoThumbFile(f); setVideoThumbPreview(URL.createObjectURL(f))
                }} />
              </label>
              {videoThumbPreview ? <CoverPreview src={videoThumbPreview} /> : null}
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Category
                <select value={video.category} onChange={(e) => setVideo({ ...video, category: e.target.value })} className="rounded-xl border border-forest/15 px-4 py-3 font-normal">
                  {CONTENT_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </label>
              <div>
                <p className="text-sm font-semibold text-forest">Level</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['A1','A2','B1','B2','C1','C2','N/A'].map((l) => (
                    <button key={l} type="button" onClick={() => setVideo({ ...video, level: l })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${video.level === l ? 'bg-gold text-foreground' : 'bg-off-white text-forest'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Price (cUSD — 0 = Free)
                <input type="number" min={0} step="0.01" value={video.price} onChange={(e) => setVideo({ ...video, price: Number(e.target.value) })} className="rounded-xl border border-forest/15 px-4 py-3 font-normal" />
              </label>
              <Field label="Tags (comma separated)" value={video.tags} onChange={(v) => setVideo({ ...video, tags: v })} />
              <button type="submit" disabled={submitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-black text-foreground disabled:opacity-50">
                {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />Publishing...</> : 'Publish Video'}
              </button>
            </form>
          ) : null}

          {/* ── MUSIC TAB ── */}
          {tab === 'music' ? (
            <form onSubmit={(e) => void publishMusic(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <Field label="Title *" value={music.title} onChange={(v) => setMusic({ ...music, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description
                <textarea value={music.description} onChange={(e) => setMusic({ ...music, description: e.target.value })} className="min-h-24 rounded-xl border border-forest/15 px-4 py-3 font-normal" />
              </label>
              <Field label="Audio URL (SoundCloud, direct MP3)" value={music.audio_url} onChange={(v) => setMusic({ ...music, audio_url: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Cover image
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return
                  setMusicCoverFile(f); setMusicCoverPreview(URL.createObjectURL(f))
                }} />
              </label>
              {musicCoverPreview ? <CoverPreview src={musicCoverPreview} /> : null}
              <Field label="Genre (Traditional, Contemporary, Folk…)" value={music.genre} onChange={(v) => setMusic({ ...music, genre: v })} />
              <Field label="Instrument (if applicable)" value={music.instrument} onChange={(v) => setMusic({ ...music, instrument: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Price (cUSD — 0 = Free)
                <input type="number" min={0} step="0.01" value={music.price} onChange={(e) => setMusic({ ...music, price: Number(e.target.value) })} className="rounded-xl border border-forest/15 px-4 py-3 font-normal" />
              </label>
              <Field label="Tags (comma separated)" value={music.tags} onChange={(v) => setMusic({ ...music, tags: v })} />
              <button type="submit" disabled={submitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-black text-foreground disabled:opacity-50">
                {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />Publishing...</> : 'Publish Music'}
              </button>
            </form>
          ) : null}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
      />
    </label>
  )
}
