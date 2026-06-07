'use client'

import Image from 'next/image'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'
import { saveStoredProfile } from '@/lib/profile-storage'
import { useToast } from '@/components/ui/Toast'
import { initials } from '@/lib/content'

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsClient />
    </AuthGuard>
  )
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-black text-[#1a4731]">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, readOnly, type = 'text' }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
      {label}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`rounded-xl border px-4 py-3 font-normal ${readOnly ? 'border-transparent bg-[#f8f4ef] font-mono text-sm text-foreground/60' : 'border-gray-200 focus:border-[#FFBF00] focus:outline-none'}`}
      />
    </label>
  )
}

function SettingsClient() {
  const { address, profile, role, setProfile, displayName } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [languages, setLanguages] = useState('')
  const [withdrawalWallet, setWithdrawalWallet] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setBio(profile.bio ?? '')
    setCountry(profile.country ?? '')
    setLanguages((profile.languages ?? []).join(', '))
    setWithdrawalWallet((profile as Record<string, unknown>).withdrawal_wallet as string ?? '')
    setAvatarUrl((profile as Record<string, unknown>).avatar_url as string ?? '')
  }, [profile])

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
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
      setAvatarUrl(data.url)
      // Sync localStorage profile
      try {
        const stored = localStorage.getItem('lugha_profile')
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, unknown>
          parsed.avatar_url = data.url
          localStorage.setItem('lugha_profile', JSON.stringify(parsed))
        }
      } catch { /* ignore */ }
      toast({ title: 'Avatar updated', type: 'success' })
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Error', type: 'error' })
      setAvatarPreview('')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function save() {
    if (!address) return
    setSaving(true)
    const res = await fetch('/api/profiles/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
      body: JSON.stringify({ full_name: fullName, bio, country, languages, withdrawal_wallet: withdrawalWallet }),
    })
    const result = await res.json()
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

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-[#1a4731]">Settings</h1>

          <div className="mt-8 max-w-2xl space-y-6">
            {/* ── PROFILE ── */}
            <Section title="Profile">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  {displayAvatar ? (
                    <Image src={displayAvatar} alt="Avatar" width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-[#FFBF00] text-2xl font-black text-[#171717]">
                      {initials(displayName)}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full border-2 border-[#1a4731] px-4 py-2 text-sm font-bold text-[#1a4731] hover:bg-[#1a4731] hover:text-white"
                  >
                    Change photo
                  </button>
                  <p className="mt-1 text-xs text-foreground/50">JPG or PNG, max 5 MB</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleAvatarChange(e)} />
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); void save() }} className="space-y-4">
                <Field label="Display Name" value={fullName} onChange={setFullName} />
                <label className="grid gap-2 text-sm font-semibold text-[#1a4731]">
                  Bio
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-28 rounded-xl border border-gray-200 px-4 py-3 font-normal focus:border-[#FFBF00] focus:outline-none" />
                </label>
                <Field label="Country" value={country} onChange={setCountry} />
                <Field label="Languages (comma separated)" value={languages} onChange={setLanguages} />
                <button type="submit" disabled={saving} className="rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717] disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            </Section>

            {/* ── ACCOUNT ── */}
            <Section title="Account">
              <Field label="Wallet Address" value={address ?? ''} readOnly />
              <p className="text-sm font-semibold text-[#1a4731]">
                Role: <span className="rounded-full bg-[#f8f4ef] px-3 py-1 capitalize">{role === 'tutor' ? 'Creator' : role}</span>
              </p>
              <Field label="Withdrawal wallet (for payouts)" value={withdrawalWallet} onChange={setWithdrawalWallet} />
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-full bg-[#1a4731] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Save
              </button>
            </Section>

            {/* ── DANGER ZONE ── */}
            <Section title="Danger Zone">
              <p className="text-sm text-foreground/60">
                To delete your account or report an issue, contact us at{' '}
                <a href="mailto:support@lugha.pro" className="font-bold text-[#1a4731] underline">support@lugha.pro</a>.
              </p>
            </Section>
          </div>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
