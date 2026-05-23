import { Profile } from '@/types'

const key = (wallet: string) => `lughapro_profile_${wallet.toLowerCase()}`

export function saveStoredProfile(wallet: string, profile: Partial<Profile>) {
  if (typeof window === 'undefined') return
  const existing = readStoredProfile(wallet) ?? {}
  window.localStorage.setItem(key(wallet), JSON.stringify({ ...existing, ...profile, wallet_address: wallet.toLowerCase() }))
}

export function readStoredProfile(wallet: string): Profile | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key(wallet))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function clearStoredProfile(wallet: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key(wallet))
}
