'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { FileUpload } from '@/components/ui/FileUpload'
import { useAuth } from '@/hooks/useAuth'
import { saveStoredProfile } from '@/lib/profile-storage'
import { useToast } from '@/components/ui/Toast'

const countries = [
  'Kenya',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Ethiopia',
  'Nigeria',
  'Ghana',
  'South Africa',
  'Other',
]

const specialtyOptions = [
  'Conversational',
  'Business',
  'Academic',
  'Beginners',
  'Cultural',
  'Tourism',
  'Dialect',
]

const languageOptions = ['Kiswahili', 'English', 'French', 'Arabic', 'Luganda']

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingForm />
    </AuthGuard>
  )
}

function OnboardingForm() {
  const router = useRouter()
  const { address, role, profile, setProfile, isLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      router.replace('/dashboard')
    }
  }, [isLoading, profile?.onboarding_completed, router])
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [country, setCountry] = useState(profile?.country ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? ['Kiswahili'])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (role === 'tutor' && languages.length === 0) {
      setError('Select at least one language you teach.')
      return
    }

    setSubmitting(true)
    setError(null)

    const response = await fetch('/api/profiles/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': address,
      },
      body: JSON.stringify({
        full_name: fullName.trim(),
        country,
        bio: bio.slice(0, 200),
        avatar_url: avatarUrl || null,
        languages,
        specialty: role === 'tutor' ? specialties : undefined,
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
    }

    toast({ title: 'Profile complete!', description: 'Welcome to LughaPro.', type: 'success' })
    router.push('/dashboard')
  }

  function toggleSpecialty(value: string) {
    setSpecialties((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  function toggleLanguage(value: string) {
    setLanguages((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-off-white px-5 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
          <div className="h-full w-full rounded-full bg-forest" />
        </div>
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-wide text-foreground/55">
          Step 1 of 1
        </p>
        <Image src="/logo.png" alt="LughaPro" width={120} height={40} className="mx-auto mt-4 h-9 w-auto" />
        <h1 className="mt-6 text-center font-serif text-3xl font-black text-forest">Complete your profile</h1>
        <p className="mt-2 text-center text-sm text-foreground/65">Required before you can use LughaPro.</p>

        <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4">
          <Field label="Display Name *" value={fullName} onChange={setFullName} />
          <label className="grid gap-2 text-sm font-semibold text-forest">
            Country *
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
              required
            >
              <option value="">Select country</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-forest">
            Bio (optional)
            <textarea
              value={bio}
              maxLength={200}
              onChange={(event) => setBio(event.target.value)}
              className="min-h-24 rounded-xl border border-forest/15 px-4 py-3 font-normal"
              placeholder="Tell learners about yourself..."
            />
            <span className="text-xs font-normal text-foreground/50">{bio.length}/200</span>
          </label>

          {role === 'tutor' ? (
            <>
              <div>
                <p className="text-sm font-semibold text-forest">Specialty tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {specialtyOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSpecialty(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        specialties.includes(item) ? 'bg-gold text-foreground' : 'bg-off-white text-forest'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-forest">Languages taught *</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {languageOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleLanguage(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        languages.includes(item) ? 'bg-forest text-white' : 'bg-off-white text-forest'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {role === 'tutor' ? (
            <FileUpload
              label="Profile photo (optional)"
              kind="avatar"
              previewUrl={avatarUrl}
              onUploaded={setAvatarUrl}
            />
          ) : (
            <>
              <Field label="Profile photo URL (optional)" value={avatarUrl} onChange={setAvatarUrl} />
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Preview" className="mx-auto h-20 w-20 rounded-full object-cover" />
              ) : null}
            </>
          )}

          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 rounded-full bg-gold font-bold text-foreground hover:bg-[#e6ac00] disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-forest">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-forest/15 px-4 py-3 font-normal"
        required={label.includes('*')}
      />
    </label>
  )
}
