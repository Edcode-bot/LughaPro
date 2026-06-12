'use client'

import { ChangeEvent, FormEvent, Suspense, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'All'] as const
const CONTENT_CATEGORIES = ['language', 'music', 'arts', 'literature', 'video', 'other'] as const

type ContentType = 'book' | 'post' | 'video' | 'music'

function CoverPreview({ src }: { src: string }) {
  return (
    <div className="relative mt-2 w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
      <img src={src} alt="Cover preview" className="h-full w-full object-cover" />
    </div>
  )
}

async function uploadFile(file: File, bucket: string, wallet: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  const res = await fetch('/api/upload/cover', {
    method: 'POST',
    headers: { 'x-wallet-address': wallet },
    body: formData,
  })
  const data = await res.json() as { url?: string; error?: string }
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
  return data.url
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

const CARDS: { type: ContentType; emoji: string; title: string; desc: string }[] = [
  { type: 'book', emoji: '📚', title: 'Book / Guide', desc: 'Upload a PDF, e-book, or link to a written resource' },
  { type: 'post', emoji: '✍️', title: 'Article / Post', desc: 'Write a long-form article or cultural essay' },
  { type: 'video', emoji: '🎬', title: 'Video', desc: 'Share a lesson, performance, or documentary clip' },
  { type: 'music', emoji: '🎵', title: 'Music / Audio', desc: 'Publish a song, podcast episode, or oral tradition recording' },
]

function PublishClient() {
  const [active, setActive] = useState<ContentType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null)
  const [bookCoverPreview, setBookCoverPreview] = useState('')
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [bookFileMode, setBookFileMode] = useState<'upload' | 'url'>('upload')
  const [postCoverFile, setPostCoverFile] = useState<File | null>(null)
  const [postCoverPreview, setPostCoverPreview] = useState('')
  const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null)
  const [videoThumbPreview, setVideoThumbPreview] = useState('')
  const [musicCoverFile, setMusicCoverFile] = useState<File | null>(null)
  const [musicCoverPreview, setMusicCoverPreview] = useState('')

  const [book, setBook] = useState({ title: '', description: '', level: 'All', price: 0, isFree: true, file_url: '', tags: '' })
  const [post, setPost] = useState({ title: '', content: '', is_premium: false, price: 0, tags: '' })
  const [video, setVideo] = useState({ title: '', description: '', video_url: '', price: 0, category: 'language', level: 'N/A', tags: '' })
  const [music, setMusic] = useState({ title: '', description: '', audio_url: '', genre: '', instrument: '', price: 0, tags: '' })

  function pickCard(type: ContentType) {
    setActive((prev) => (prev === type ? null : type))
    setSuccess(null)
    setError(null)
  }

  function onImagePick(event: ChangeEvent<HTMLInputElement>, target: 'book' | 'post') {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (target === 'book') { setBookCoverFile(file); setBookCoverPreview(preview) }
    else { setPostCoverFile(file); setPostCoverPreview(preview) }
  }

  async function publishBook(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!book.title.trim() || !book.description.trim()) { setError('Title and description are required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found. Please connect your wallet again.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | undefined
      if (bookCoverFile) cover_image_url = await uploadFile(bookCoverFile, 'covers', wallet)
      let file_url = book.file_url.trim() || undefined
      if (bookFileMode === 'upload' && bookFile) file_url = await uploadFile(bookFile, 'books', wallet)
      const price = book.isFree ? 0 : Number(book.price)
      const res = await fetch('/api/content/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet, 'x-lugha-role': 'tutor' },
        body: JSON.stringify({ title: book.title.trim(), description: book.description.trim(), level: book.level, price, cover_image_url, file_url, tags: book.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish book')
      setSuccess('Book published successfully! 🎉')
      setBook({ title: '', description: '', level: 'All', price: 0, isFree: true, file_url: '', tags: '' })
      setBookCoverFile(null); setBookCoverPreview(''); setBookFile(null); setBookFileMode('upload')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish book') }
    finally { setSubmitting(false) }
  }

  async function publishPost(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!post.title.trim() || !post.content.trim()) { setError('Title and content are required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | undefined
      if (postCoverFile) cover_image_url = await uploadFile(postCoverFile, 'covers', wallet)
      const res = await fetch('/api/content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet, 'x-lugha-role': 'tutor' },
        body: JSON.stringify({ title: post.title.trim(), content: post.content.trim(), cover_image_url, is_premium: post.is_premium, price: post.is_premium ? Number(post.price) : 0, tags: post.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish post')
      setSuccess('Post published successfully! 🎉')
      setPost({ title: '', content: '', is_premium: false, price: 0, tags: '' })
      setPostCoverFile(null); setPostCoverPreview('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish post') }
    finally { setSubmitting(false) }
  }

  async function publishVideo(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!video.title.trim()) { setError('Title is required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let thumbnail_url: string | null = null
      if (videoThumbFile) thumbnail_url = await uploadFile(videoThumbFile, 'covers', wallet)
      const res = await fetch('/api/content/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
        body: JSON.stringify({ title: video.title.trim(), description: video.description.trim() || null, video_url: video.video_url.trim() || null, thumbnail_url, price: Number(video.price), category: video.category, level: video.level, tags: video.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish video')
      setSuccess('Video published! 🎉')
      setVideo({ title: '', description: '', video_url: '', price: 0, category: 'language', level: 'N/A', tags: '' })
      setVideoThumbFile(null); setVideoThumbPreview('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish video') }
    finally { setSubmitting(false) }
  }

  async function publishMusic(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!music.title.trim()) { setError('Title is required.'); return }
    const wallet = getWalletAddress()
    if (!wallet) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | null = null
      if (musicCoverFile) cover_image_url = await uploadFile(musicCoverFile, 'covers', wallet)
      const res = await fetch('/api/content/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
        body: JSON.stringify({ title: music.title.trim(), description: music.description.trim() || null, audio_url: music.audio_url.trim() || null, cover_image_url, genre: music.genre.trim() || null, instrument: music.instrument.trim() || null, price: Number(music.price), tags: music.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish music')
      setSuccess('Music published! 🎉')
      setMusic({ title: '', description: '', audio_url: '', genre: '', instrument: '', price: 0, tags: '' })
      setMusicCoverFile(null); setMusicCoverPreview('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish music') }
    finally { setSubmitting(false) }
  }

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Publish Content</h1>
          <p className="mt-2 text-foreground/60">Share your knowledge with the world. Choose a content type to get started.</p>

          {/* 2×2 card grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CARDS.map((card) => {
              const isActive = active === card.type
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => pickCard(card.type)}
                  className={`rounded-2xl border-2 p-8 text-left transition ${
                    isActive
                      ? 'border-[#FFBF00] bg-amber-50'
                      : 'border-gray-100 bg-white hover:border-[#FFBF00]'
                  }`}
                >
                  <span className="text-4xl">{card.emoji}</span>
                  <h3 className="mt-3 font-serif text-xl font-black text-[#1a4731]">{card.title}</h3>
                  <p className="mt-1 text-sm text-foreground/60">{card.desc}</p>
                  {isActive && (
                    <span className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-3 py-1 text-xs font-black text-[#171717]">
                      Active ↓
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback banners */}
          {success && <p className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">{success}</p>}
          {error && <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}

          {/* ── BOOK FORM ── */}
          {active === 'book' && (
            <form onSubmit={(e) => void publishBook(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border-2 border-[#FFBF00] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-black text-[#1a4731]">Publish a Book / Guide</h2>
              <Field label="Title *" value={book.title} onChange={(v) => setBook({ ...book, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description *
                <textarea required value={book.description} onChange={(e) => setBook({ ...book, description: e.target.value })} className="min-h-28 rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <div>
                <p className="text-sm font-semibold text-forest">Level</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button key={level} type="button" onClick={() => setBook({ ...book, level })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${book.level === level ? 'bg-[#FFBF00] text-[#171717]' : 'bg-off-white text-forest'}`}>{level}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                <input type="checkbox" checked={book.isFree} onChange={(e) => setBook({ ...book, isFree: e.target.checked, price: e.target.checked ? 0 : book.price })} />
                Free content
              </label>
              {!book.isFree && (
                <label className="grid gap-2 text-sm font-semibold text-forest">
                  Price (USD equivalent)
                  <input type="number" min={0} step="0.01" value={book.price} onChange={(e) => setBook({ ...book, price: Number(e.target.value) })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
                </label>
              )}
              <label className="grid gap-2 text-sm font-semibold text-forest">Cover image <input type="file" accept="image/*" onChange={(e) => onImagePick(e, 'book')} /></label>
              {bookCoverPreview ? <CoverPreview src={bookCoverPreview} /> : null}
              <div>
                <p className="text-sm font-semibold text-forest">Book file</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setBookFileMode('upload')} className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'upload' ? 'bg-[#1a4731] text-white' : 'bg-off-white text-forest'}`}>Upload file</button>
                  <button type="button" onClick={() => setBookFileMode('url')} className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'url' ? 'bg-[#1a4731] text-white' : 'bg-off-white text-forest'}`}>External URL</button>
                </div>
                {bookFileMode === 'upload'
                  ? <input type="file" accept=".pdf,.doc,.docx" className="mt-2 block w-full text-sm" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />
                  : <input type="url" placeholder="https://..." value={book.file_url} onChange={(e) => setBook({ ...book, file_url: e.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none" />}
              </div>
              <Field label="Tags (comma separated)" value={book.tags} onChange={(v) => setBook({ ...book, tags: v })} />
              <SubmitBtn submitting={submitting} label="Publish Book" />
            </form>
          )}

          {/* ── POST FORM ── */}
          {active === 'post' && (
            <form onSubmit={(e) => void publishPost(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border-2 border-[#FFBF00] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-black text-[#1a4731]">Write an Article</h2>
              <Field label="Title *" value={post.title} onChange={(v) => setPost({ ...post, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Content *
                <textarea required value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} style={{ minHeight: 200 }} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-forest">Cover image <input type="file" accept="image/*" onChange={(e) => onImagePick(e, 'post')} /></label>
              {postCoverPreview ? <CoverPreview src={postCoverPreview} /> : null}
              <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                <input type="checkbox" checked={post.is_premium} onChange={(e) => setPost({ ...post, is_premium: e.target.checked })} />
                Paid content
              </label>
              {post.is_premium && (
                <label className="grid gap-2 text-sm font-semibold text-forest">
                  Price (USD equivalent)
                  <input type="number" min={0} step="0.01" value={post.price} onChange={(e) => setPost({ ...post, price: Number(e.target.value) })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
                </label>
              )}
              <Field label="Tags (comma separated)" value={post.tags} onChange={(v) => setPost({ ...post, tags: v })} />
              <SubmitBtn submitting={submitting} label="Publish Post" />
            </form>
          )}

          {/* ── VIDEO FORM ── */}
          {active === 'video' && (
            <form onSubmit={(e) => void publishVideo(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border-2 border-[#FFBF00] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-black text-[#1a4731]">Upload a Video</h2>
              <Field label="Title *" value={video.title} onChange={(v) => setVideo({ ...video, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description
                <textarea value={video.description} onChange={(e) => setVideo({ ...video, description: e.target.value })} className="min-h-24 rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <Field label="Video URL (YouTube, Vimeo, or direct)" value={video.video_url} onChange={(v) => setVideo({ ...video, video_url: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">Thumbnail image <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setVideoThumbFile(f); setVideoThumbPreview(URL.createObjectURL(f)) }} /></label>
              {videoThumbPreview ? <CoverPreview src={videoThumbPreview} /> : null}
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Category
                <select value={video.category} onChange={(e) => setVideo({ ...video, category: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none">
                  {CONTENT_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </label>
              <div>
                <p className="text-sm font-semibold text-forest">Level</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['A1','A2','B1','B2','C1','C2','N/A'].map((l) => (
                    <button key={l} type="button" onClick={() => setVideo({ ...video, level: l })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${video.level === l ? 'bg-[#FFBF00] text-[#171717]' : 'bg-off-white text-forest'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Price (USD equivalent — 0 = free for everyone)
                <input type="number" min={0} step="0.01" value={video.price} onChange={(e) => setVideo({ ...video, price: Number(e.target.value) })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <Field label="Tags (comma separated)" value={video.tags} onChange={(v) => setVideo({ ...video, tags: v })} />
              <SubmitBtn submitting={submitting} label="Publish Video" />
            </form>
          )}

          {/* ── MUSIC FORM ── */}
          {active === 'music' && (
            <form onSubmit={(e) => void publishMusic(e)} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border-2 border-[#FFBF00] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-black text-[#1a4731]">Upload Music / Audio</h2>
              <Field label="Title *" value={music.title} onChange={(v) => setMusic({ ...music, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Description
                <textarea value={music.description} onChange={(e) => setMusic({ ...music, description: e.target.value })} className="min-h-24 rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <Field label="Audio URL (SoundCloud, direct MP3)" value={music.audio_url} onChange={(v) => setMusic({ ...music, audio_url: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">Cover image <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setMusicCoverFile(f); setMusicCoverPreview(URL.createObjectURL(f)) }} /></label>
              {musicCoverPreview ? <CoverPreview src={musicCoverPreview} /> : null}
              <Field label="Genre (Traditional, Contemporary, Folk…)" value={music.genre} onChange={(v) => setMusic({ ...music, genre: v })} />
              <Field label="Instrument (if applicable)" value={music.instrument} onChange={(v) => setMusic({ ...music, instrument: v })} />
              <label className="grid gap-2 text-sm font-semibold text-forest">
                Price (USD equivalent — 0 = free for everyone)
                <input type="number" min={0} step="0.01" value={music.price} onChange={(e) => setMusic({ ...music, price: Number(e.target.value) })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
              </label>
              <Field label="Tags (comma separated)" value={music.tags} onChange={(v) => setMusic({ ...music, tags: v })} />
              <SubmitBtn submitting={submitting} label="Publish Music" />
            </form>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
    </label>
  )
}

function SubmitBtn({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button type="submit" disabled={submitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFBF00] px-6 py-4 font-black text-[#171717] disabled:opacity-50">
      {submitting ? (
        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171717]/30 border-t-[#171717]" />Publishing...</>
      ) : label}
    </button>
  )
}
