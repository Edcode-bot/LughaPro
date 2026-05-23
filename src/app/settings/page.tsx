'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { saveStoredProfile } from '@/lib/profile-storage'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsClient />
    </AuthGuard>
  )
}

function SettingsClient() {
  const { address, profile, role, setProfile } = useAuth()
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [languages, setLanguages] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setBio(profile.bio ?? '')
    setCountry(profile.country ?? '')
    setLanguages((profile.languages ?? []).join(', '))
  }, [profile])

  async function save() {
    if (!address) return
    setSaving(true)
    const response = await fetch('/api/profiles/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        wallet_address: address,
      },
      body: JSON.stringify({
        full_name: fullName,
        bio,
        country,
        languages,
      }),
    })
    const result = await response.json()
    setSaving(false)
    if (result.error) {
      toast({ title: 'Save failed', description: result.error, type: 'error' })
      return
    }
    if (result.data) {
      saveStoredProfile(address, result.data)
      setProfile(result.data)
    }
    toast({ title: 'Profile saved', type: 'success' })
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest">Settings</h1>
          <form
            className="mt-8 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <Field label="Display Name" value={fullName} onChange={setFullName} />
            <TextArea label="Bio" value={bio} onChange={setBio} />
            <Field label="Country" value={country} onChange={setCountry} />
            <Field label="Languages (comma separated)" value={languages} onChange={setLanguages} />
            <label className="grid gap-2 text-sm font-semibold text-forest">
              Wallet address
              <input value={address ?? ''} readOnly className="rounded-xl bg-off-white px-4 py-3 font-mono text-sm text-foreground/60" />
            </label>
            <p className="text-sm font-semibold text-forest">
              Role: <span className="rounded-full bg-cream px-3 py-1 capitalize">{role === 'tutor' ? 'Creator' : role}</span>
            </p>
            <button type="submit" disabled={saving} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
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
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 rounded-xl border border-forest/15 px-4 py-3 font-normal" />
    </label>
  )
}
