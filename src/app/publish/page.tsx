'use client'

import { FormEvent, Suspense, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'All'] as const
const CONTENT_CATEGORIES = ['language', 'music', 'arts', 'literature', 'video', 'other'] as const

type ContentType = 'book' | 'post' | 'video' | 'music'

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
  const { address } = useAuth()
  const [active, setActive] = useState<ContentType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null)
  const [bookCoverPreview, setBookCoverPreview] = useState('')
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [bookFileMode, setBookFileMode] = useState<'upload' | 'url'>('upload')
  const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null)
  const [videoThumbPreview, setVideoThumbPreview] = useState('')
  const [musicCoverFile, setMusicCoverFile] = useState<File | null>(null)
  const [musicCoverPreview, setMusicCoverPreview] = useState('')

  // Post-specific state
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [inlineImages, setInlineImages] = useState<string[]>([])
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postTags, setPostTags] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [postPrice, setPostPrice] = useState('0')
  const [publishingPost, setPublishingPost] = useState(false)

  const [book, setBook] = useState({ title: '', description: '', level: 'All', file_url: '', tags: '' })
  const [bookIsFree, setBookIsFree] = useState(true)
  const [bookPrice, setBookPrice] = useState('0')
  const [video, setVideo] = useState({ title: '', description: '', video_url: '', category: 'language', level: 'N/A', tags: '' })
  const [videoIsPaid, setVideoIsPaid] = useState(false)
  const [videoPrice, setVideoPrice] = useState('0')
  const [music, setMusic] = useState({ title: '', description: '', audio_url: '', genre: '', instrument: '', tags: '' })
  const [musicIsPaid, setMusicIsPaid] = useState(false)
  const [musicPrice, setMusicPrice] = useState('0')

  function pickCard(type: ContentType) {
    setActive((prev) => (prev === type ? null : type))
    setSuccess(null)
    setError(null)
  }

  const handlePublishPost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !address) return
    setPublishingPost(true)
    try {
      let coverImageUrl: string | null = null
      if (coverFile) {
        const formData = new FormData()
        formData.append('file', coverFile)
        const res = await fetch('/api/upload/cover', {
          method: 'POST',
          headers: { 'x-wallet-address': address },
          body: formData,
        })
        const data = await res.json() as { url?: string }
        coverImageUrl = data.url ?? null
      }
      const res = await fetch('/api/content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address, 'x-lugha-role': 'tutor' },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          cover_image_url: coverImageUrl,
          is_premium: isPremium,
          price: isPremium ? parseFloat(postPrice) : 0,
          tags: postTags,
          images: inlineImages,
        }),
      })
      const data = await res.json() as { error?: string }
      if (data.error) throw new Error(data.error)
      setSuccess('Article published! 🎉')
      setPostTitle(''); setPostContent(''); setPostTags('')
      setIsPremium(false); setPostPrice('0')
      setCoverPreview(null); setCoverFile(null); setInlineImages([])
      setActive(null)
    } catch (err: unknown) {
      setError('Failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setPublishingPost(false)
    }
  }

  async function publishBook(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!book.title.trim() || !book.description.trim()) { setError('Title and description are required.'); return }
    if (!address) { setError('Wallet not found. Please connect your wallet again.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | undefined
      if (bookCoverFile) {
        const formData = new FormData()
        formData.append('file', bookCoverFile)
        const res = await fetch('/api/upload/cover', { method: 'POST', headers: { 'x-wallet-address': address }, body: formData })
        const data = await res.json() as { url?: string }
        cover_image_url = data.url
      }
      let file_url = book.file_url.trim() || undefined
      if (bookFileMode === 'upload' && bookFile) file_url = await uploadFile(bookFile, 'books', address)
      const price = bookIsFree ? 0 : parseFloat(bookPrice)
      const res = await fetch('/api/content/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address, 'x-lugha-role': 'tutor' },
        body: JSON.stringify({ title: book.title.trim(), description: book.description.trim(), level: book.level, price, cover_image_url, file_url, tags: book.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish book')
      setSuccess('Book published successfully! 🎉')
      setBook({ title: '', description: '', level: 'All', file_url: '', tags: '' })
      setBookIsFree(true); setBookPrice('0')
      setBookCoverFile(null); setBookCoverPreview(''); setBookFile(null); setBookFileMode('upload')
      setActive(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish book') }
    finally { setSubmitting(false) }
  }

  async function publishVideo(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!video.title.trim()) { setError('Title is required.'); return }
    if (!address) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let thumbnail_url: string | null = null
      if (videoThumbFile) {
        const formData = new FormData()
        formData.append('file', videoThumbFile)
        const res = await fetch('/api/upload/cover', { method: 'POST', headers: { 'x-wallet-address': address }, body: formData })
        const data = await res.json() as { url?: string }
        thumbnail_url = data.url ?? null
      }
      const res = await fetch('/api/content/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({ title: video.title.trim(), description: video.description.trim() || null, video_url: video.video_url.trim() || null, thumbnail_url, price: videoIsPaid ? parseFloat(videoPrice) : 0, category: video.category, level: video.level, tags: video.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish video')
      setSuccess('Video published! 🎉')
      setVideo({ title: '', description: '', video_url: '', category: 'language', level: 'N/A', tags: '' })
      setVideoIsPaid(false); setVideoPrice('0')
      setVideoThumbFile(null); setVideoThumbPreview('')
      setActive(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to publish video') }
    finally { setSubmitting(false) }
  }

  async function publishMusic(event: FormEvent) {
    event.preventDefault(); setSuccess(null); setError(null)
    if (!music.title.trim()) { setError('Title is required.'); return }
    if (!address) { setError('Wallet not found.'); return }
    setSubmitting(true)
    try {
      let cover_image_url: string | null = null
      if (musicCoverFile) {
        const formData = new FormData()
        formData.append('file', musicCoverFile)
        const res = await fetch('/api/upload/cover', { method: 'POST', headers: { 'x-wallet-address': address }, body: formData })
        const data = await res.json() as { url?: string }
        cover_image_url = data.url ?? null
      }
      const res = await fetch('/api/content/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({ title: music.title.trim(), description: music.description.trim() || null, audio_url: music.audio_url.trim() || null, cover_image_url, genre: music.genre.trim() || null, instrument: music.instrument.trim() || null, price: musicIsPaid ? parseFloat(musicPrice) : 0, tags: music.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Failed to publish music')
      setSuccess('Music published! 🎉')
      setMusic({ title: '', description: '', audio_url: '', genre: '', instrument: '', tags: '' })
      setMusicIsPaid(false); setMusicPrice('0')
      setMusicCoverFile(null); setMusicCoverPreview('')
      setActive(null)
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
            <form onSubmit={(e) => void publishBook(e)} className="mt-6 max-w-2xl rounded-2xl border-2 border-[#FFBF00] bg-white p-6 md:p-8 shadow-sm space-y-5">
              <h2 className="font-serif text-2xl font-black text-[#171717]">Publish a Book / Guide</h2>

              {/* Cover Image */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Cover Image</label>
                {bookCoverPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bookCoverPreview} className="h-full w-full object-cover" alt="cover" />
                    <button type="button" onClick={() => { setBookCoverPreview(''); setBookCoverFile(null) }}
                      className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" id="book-cover-img" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { setBookCoverFile(f); setBookCoverPreview(URL.createObjectURL(f)) }
                      }} />
                    <label htmlFor="book-cover-img"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-[#FFBF00] hover:bg-[#fdf6e3] transition-all">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-sm font-semibold text-gray-600">Click to add cover image</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WebP — max 10MB</span>
                    </label>
                  </>
                )}
              </div>

              <Field label="Title *" value={book.title} onChange={(v) => setBook({ ...book, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-[#171717]">
                Description *
                <textarea required value={book.description} onChange={(e) => setBook({ ...book, description: e.target.value })} rows={5} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none resize-y" />
              </label>

              {/* Level */}
              <div>
                <p className="text-sm font-semibold text-[#171717] mb-2">Level</p>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button key={level} type="button" onClick={() => setBook({ ...book, level })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${book.level === level ? 'bg-[#FFBF00] text-[#171717]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{level}</button>
                  ))}
                </div>
              </div>

              {/* Paid toggle */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${!bookIsFree ? 'bg-[#1a4731]' : 'bg-gray-200'}`}
                    onClick={() => setBookIsFree(!bookIsFree)}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${!bookIsFree ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">Paid content</span>
                </label>
                {!bookIsFree && (
                  <input type="number" min="0.01" step="0.01" value={bookPrice}
                    onChange={e => setBookPrice(e.target.value)}
                    placeholder="Price"
                    className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none" />
                )}
                {!bookIsFree && <span className="text-xs text-gray-400">Buyers pay in cUSD, CELO, or USDT</span>}
              </div>

              {/* Book file */}
              <div>
                <p className="text-sm font-semibold text-[#171717] mb-2">Book file</p>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setBookFileMode('upload')} className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'upload' ? 'bg-[#1a4731] text-white' : 'bg-gray-100 text-gray-600'}`}>Upload file</button>
                  <button type="button" onClick={() => setBookFileMode('url')} className={`rounded-full px-4 py-2 text-xs font-bold ${bookFileMode === 'url' ? 'bg-[#1a4731] text-white' : 'bg-gray-100 text-gray-600'}`}>External URL</button>
                </div>
                {bookFileMode === 'upload'
                  ? <input type="file" accept=".pdf,.doc,.docx" className="block w-full text-sm" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />
                  : <input type="url" placeholder="https://..." value={book.file_url} onChange={(e) => setBook({ ...book, file_url: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal focus:border-[#FFBF00] focus:outline-none" />}
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Tags</label>
                <input type="text" value={book.tags} onChange={e => setBook({ ...book, tags: e.target.value })}
                  placeholder="kiswahili, culture, history (comma separated)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#FFBF00] focus:outline-none" />
                <p className="mt-1 text-xs text-gray-400">Tags help learners discover your content</p>
              </div>

              <SubmitBtn submitting={submitting} label="Publish Book" />
            </form>
          )}

          {/* ── POST FORM ── */}
          {active === 'post' && (
            <div className="mt-6 rounded-2xl bg-white border-2 border-[#FFBF00] p-6 md:p-8 max-w-2xl shadow-sm">
              <h2 className="font-serif text-2xl font-black text-[#171717] mb-6">Write an Article</h2>

              {/* Cover Image */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-[#171717] block mb-2">Cover Image</label>
                {coverPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreview} className="h-full w-full object-cover" alt="cover" />
                    <button type="button" onClick={() => { setCoverPreview(null); setCoverFile(null) }}
                      className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" id="cover-img" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
                      }} />
                    <label htmlFor="cover-img"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-[#FFBF00] hover:bg-[#fdf6e3] transition-all">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-sm font-semibold text-gray-600">Click to add cover image</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WebP — max 10MB</span>
                    </label>
                  </>
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-[#171717] block mb-2">Title *</label>
                <input type="text" required value={postTitle} onChange={e => setPostTitle(e.target.value)}
                  placeholder="Give your article a compelling title..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#171717] placeholder-gray-400 focus:border-[#FFBF00] focus:outline-none text-lg font-semibold" />
              </div>

              {/* Content with inline image insertion */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#171717]">Content *</label>
                  <button type="button" onClick={() => document.getElementById('inline-img')?.click()}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-[#FFBF00] hover:text-[#1a4731] transition-all">
                    🖼️ Insert Image
                  </button>
                </div>
                <input type="file" accept="image/*" id="inline-img" className="hidden"
                  onChange={async e => {
                    const f = e.target.files?.[0]
                    if (!f || !address) return
                    setUploadingInlineImage(true)
                    const formData = new FormData()
                    formData.append('file', f)
                    try {
                      const res = await fetch('/api/upload/cover', {
                        method: 'POST',
                        headers: { 'x-wallet-address': address },
                        body: formData,
                      })
                      const data = await res.json() as { url?: string }
                      if (data.url) {
                        const imgMarkdown = `\n\n![image](${data.url})\n\n`
                        setPostContent(prev => prev + imgMarkdown)
                        setInlineImages(prev => [...prev, data.url!])
                      }
                    } finally {
                      setUploadingInlineImage(false)
                      e.target.value = ''
                    }
                  }} />
                <textarea required value={postContent} onChange={e => setPostContent(e.target.value)}
                  placeholder="Write your article here... Use the 'Insert Image' button to add images inline."
                  rows={14}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#171717] placeholder-gray-400 focus:border-[#FFBF00] focus:outline-none resize-none font-mono text-sm leading-relaxed" />
                {uploadingInlineImage && (
                  <div className="mt-2 text-sm text-[#1a4731] font-semibold animate-pulse flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-[#1a4731] animate-bounce" />
                    Uploading image...
                  </div>
                )}
                {inlineImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Embedded images ({inlineImages.length}):</p>
                    <div className="flex gap-2 flex-wrap">
                      {inlineImages.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`inline ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Tip: Images are embedded using ![image](url) markdown and will display in your article.
                </p>
              </div>

              {/* Paid toggle + price */}
              <div className="mb-4 flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${isPremium ? 'bg-[#1a4731]' : 'bg-gray-200'}`}
                    onClick={() => setIsPremium(!isPremium)}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isPremium ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">Paid content</span>
                </label>
                {isPremium && (
                  <input type="number" min="0.01" step="0.01" value={postPrice}
                    onChange={e => setPostPrice(e.target.value)}
                    placeholder="Price"
                    className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none" />
                )}
                {isPremium && <span className="text-xs text-gray-400">Buyers pay in cUSD, CELO, or USDT</span>}
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-[#171717] block mb-2">Tags</label>
                <input type="text" value={postTags} onChange={e => setPostTags(e.target.value)}
                  placeholder="kiswahili, culture, history (comma separated)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#FFBF00] focus:outline-none" />
                <p className="mt-1 text-xs text-gray-400">Tags help learners discover your content</p>
              </div>

              {/* Submit */}
              <button type="button" onClick={() => void handlePublishPost()} disabled={publishingPost || uploadingInlineImage || !postTitle.trim() || !postContent.trim()}
                className="w-full rounded-full bg-[#FFBF00] py-4 font-black text-[#171717] text-lg hover:bg-[#e6ac00] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {publishingPost ? 'Publishing...' : 'Publish Article →'}
              </button>
            </div>
          )}

          {/* ── VIDEO FORM ── */}
          {active === 'video' && (
            <form onSubmit={(e) => void publishVideo(e)} className="mt-6 max-w-2xl rounded-2xl border-2 border-[#FFBF00] bg-white p-6 md:p-8 shadow-sm space-y-5">
              <h2 className="font-serif text-2xl font-black text-[#171717]">Upload a Video</h2>

              {/* Thumbnail */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Thumbnail Image</label>
                {videoThumbPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={videoThumbPreview} className="h-full w-full object-cover" alt="thumbnail" />
                    <button type="button" onClick={() => { setVideoThumbPreview(''); setVideoThumbFile(null) }}
                      className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" id="video-thumb-img" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { setVideoThumbFile(f); setVideoThumbPreview(URL.createObjectURL(f)) }
                      }} />
                    <label htmlFor="video-thumb-img"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-[#FFBF00] hover:bg-[#fdf6e3] transition-all">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-sm font-semibold text-gray-600">Click to add thumbnail</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WebP — max 10MB</span>
                    </label>
                  </>
                )}
              </div>

              <Field label="Title *" value={video.title} onChange={(v) => setVideo({ ...video, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-[#171717]">
                Description
                <textarea value={video.description} onChange={(e) => setVideo({ ...video, description: e.target.value })} rows={4} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none resize-y" />
              </label>
              <Field label="Video URL (YouTube, Vimeo, or direct link)" value={video.video_url} onChange={(v) => setVideo({ ...video, video_url: v })} />

              <label className="grid gap-2 text-sm font-semibold text-[#171717]">
                Category
                <select value={video.category} onChange={(e) => setVideo({ ...video, category: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none">
                  {CONTENT_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </label>

              <div>
                <p className="text-sm font-semibold text-[#171717] mb-2">Level</p>
                <div className="flex flex-wrap gap-2">
                  {['A1','A2','B1','B2','C1','C2','N/A'].map((l) => (
                    <button key={l} type="button" onClick={() => setVideo({ ...video, level: l })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${video.level === l ? 'bg-[#FFBF00] text-[#171717]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Paid toggle */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${videoIsPaid ? 'bg-[#1a4731]' : 'bg-gray-200'}`}
                    onClick={() => setVideoIsPaid(!videoIsPaid)}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${videoIsPaid ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">Paid content</span>
                </label>
                {videoIsPaid && (
                  <input type="number" min="0.01" step="0.01" value={videoPrice}
                    onChange={e => setVideoPrice(e.target.value)}
                    placeholder="Price"
                    className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none" />
                )}
                {videoIsPaid && <span className="text-xs text-gray-400">Buyers pay in cUSD, CELO, or USDT</span>}
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Tags</label>
                <input type="text" value={video.tags} onChange={e => setVideo({ ...video, tags: e.target.value })}
                  placeholder="kiswahili, culture, history (comma separated)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#FFBF00] focus:outline-none" />
                <p className="mt-1 text-xs text-gray-400">Tags help learners discover your content</p>
              </div>

              <SubmitBtn submitting={submitting} label="Publish Video" />
            </form>
          )}

          {/* ── MUSIC FORM ── */}
          {active === 'music' && (
            <form onSubmit={(e) => void publishMusic(e)} className="mt-6 max-w-2xl rounded-2xl border-2 border-[#FFBF00] bg-white p-6 md:p-8 shadow-sm space-y-5">
              <h2 className="font-serif text-2xl font-black text-[#171717]">Upload Music / Audio</h2>

              {/* Cover Image */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Cover Image</label>
                {musicCoverPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={musicCoverPreview} className="h-full w-full object-cover" alt="cover" />
                    <button type="button" onClick={() => { setMusicCoverPreview(''); setMusicCoverFile(null) }}
                      className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" id="music-cover-img" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { setMusicCoverFile(f); setMusicCoverPreview(URL.createObjectURL(f)) }
                      }} />
                    <label htmlFor="music-cover-img"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-[#FFBF00] hover:bg-[#fdf6e3] transition-all">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-sm font-semibold text-gray-600">Click to add cover image</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WebP — max 10MB</span>
                    </label>
                  </>
                )}
              </div>

              <Field label="Title *" value={music.title} onChange={(v) => setMusic({ ...music, title: v })} required />
              <label className="grid gap-2 text-sm font-semibold text-[#171717]">
                Description
                <textarea value={music.description} onChange={(e) => setMusic({ ...music, description: e.target.value })} rows={4} className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none resize-y" />
              </label>
              <Field label="Audio URL (SoundCloud, direct MP3)" value={music.audio_url} onChange={(v) => setMusic({ ...music, audio_url: v })} />
              <Field label="Genre (Traditional, Contemporary, Folk…)" value={music.genre} onChange={(v) => setMusic({ ...music, genre: v })} />
              <Field label="Instrument (if applicable)" value={music.instrument} onChange={(v) => setMusic({ ...music, instrument: v })} />

              {/* Paid toggle */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${musicIsPaid ? 'bg-[#1a4731]' : 'bg-gray-200'}`}
                    onClick={() => setMusicIsPaid(!musicIsPaid)}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${musicIsPaid ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">Paid content</span>
                </label>
                {musicIsPaid && (
                  <input type="number" min="0.01" step="0.01" value={musicPrice}
                    onChange={e => setMusicPrice(e.target.value)}
                    placeholder="Price"
                    className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none" />
                )}
                {musicIsPaid && <span className="text-xs text-gray-400">Buyers pay in cUSD, CELO, or USDT</span>}
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-semibold text-[#171717] block mb-2">Tags</label>
                <input type="text" value={music.tags} onChange={e => setMusic({ ...music, tags: e.target.value })}
                  placeholder="kiswahili, culture, history (comma separated)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#FFBF00] focus:outline-none" />
                <p className="mt-1 text-xs text-gray-400">Tags help learners discover your content</p>
              </div>

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
