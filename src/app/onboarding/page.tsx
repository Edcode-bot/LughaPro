'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState, ChangeEvent } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/lib/content'
import { saveStoredProfile } from '@/lib/profile-storage'
import { useToast } from '@/components/ui/Toast'

const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Congo', 'DR Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
  'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
  'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
  'Zambia', 'Zimbabwe', 'Other',
]

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingForm />
    </AuthGuard>
  )
}

function OnboardingForm() {
  const router = useRouter()
  const { address, profile, setProfile, isLoading, displayName } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  // Redirect if already onboarded
  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      router.replace('/dashboard')
    }
  }, [isLoading, profile?.onboarding_completed, router])

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [country, setCountry] = useState(profile?.country ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !address) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'x-wallet-address': address },
        body: formData,
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        setAvatarUrl(data.url)
        setAvatarPreview(data.url)
        // Sync localStorage and notify navbar
        try {
          const stored = localStorage.getItem('lugha_profile')
          if (stored) {
            const parsed = JSON.parse(stored) as Record<string, unknown>
            parsed.avatar_url = data.url
            localStorage.setItem('lugha_profile', JSON.stringify(parsed))
            window.dispatchEvent(new Event('lugha_profile_updated'))
          }
        } catch { /* ignore */ }
      } else {
        console.error('Upload failed:', data.error)
        setAvatarPreview('')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setAvatarPreview('')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!address) return
    if (fullName.trim().length < 2) {
      setError('Display name must be at least 2 characters.')
      return
    }
    if (!country) {
      setError('Please select your country.')
      return
    }

    setSubmitting(true)
    setError(null)

    const response = await fetch('/api/profiles/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({
        full_name: fullName.trim(),
        country,
        bio: bio.slice(0, 200),
        avatar_url: avatarUrl || null,
        onboarding_completed: true,
      }),
    })

    const result = await response.json()
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      saveStoredProfile(address, result.data)
      setProfile(result.data)
      window.dispatchEvent(new Event('lugha_profile_updated'))
    }

    toast({ title: 'Profile complete!', description: 'Welcome to LughaPro.', type: 'success' })
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#f8f4ef] px-4 py-12">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">

        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="LughaPro" width={48} height={48} className="h-12 w-12 rounded-xl object-contain" />
        </div>

        <h1 className="mt-6 text-center font-serif text-3xl font-black text-[#171717]">
          Welcome to LughaPro
        </h1>
        <p className="mt-2 text-center text-gray-500">
          Tell us a bit about yourself to get started.
        </p>

        {/* Avatar */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative"
            aria-label="Upload photo"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-[#FFBF00]"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full bg-[#FFBF00] ring-4 ring-[#FFBF00]/30">
                <span className="text-3xl font-black text-[#171717]">
                  {initials(fullName || displayName)}
                </span>
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-[#1a4731] underline underline-offset-2"
          >
            {avatarPreview ? 'Change photo' : 'Add photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e)}
          />
        </div>

        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          {/* Display Name */}
          <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
            Display Name *
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Grace Mwangi"
              className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none"
            />
          </label>

          {/* Country */}
          <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
            Country *
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none"
            >
              <option value="">Select your country</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Bio */}
          <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
            Bio <span className="font-normal text-gray-400">(optional)</span>
            <textarea
              value={bio}
              maxLength={200}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell learners about yourself..."
              className="rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none"
            />
            <span className="text-right text-xs font-normal text-gray-400">{bio.length}/200</span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || uploadingAvatar}
            className="mt-2 h-12 w-full rounded-full bg-[#FFBF00] font-black text-[#171717] transition hover:bg-[#e6ac00] disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Complete Profile →'}
          </button>
        </form>
      </div>
    </main>
  )
}
