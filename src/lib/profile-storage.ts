import { Profile, UserRole } from '@/types'

const profileKey = (wallet: string) => `lughapro_profile_${wallet.toLowerCase()}`
export const LUGHA_ROLE_KEY = 'lugha_role'
export const LUGHA_PROFILE_KEY = 'lugha_profile'

export function saveLughaRole(role: 'student' | 'tutor') {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LUGHA_ROLE_KEY, role)
}

export function readLughaRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  const role = window.localStorage.getItem(LUGHA_ROLE_KEY)
  if (role === 'tutor' || role === 'student') return role
  return null
}

export function saveLughaProfile(profile: Profile) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LUGHA_PROFILE_KEY, JSON.stringify(profile))
}

export function readLughaProfile(): Profile | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(LUGHA_PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function clearLughaSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LUGHA_ROLE_KEY)
  window.localStorage.removeItem(LUGHA_PROFILE_KEY)
}

export function saveStoredProfile(wallet: string, profile: Partial<Profile>) {
  if (typeof window === 'undefined') return
  const existing = readStoredProfile(wallet) ?? {}
  const merged = { ...existing, ...profile, wallet_address: wallet.toLowerCase() } as Profile
  window.localStorage.setItem(profileKey(wallet), JSON.stringify(merged))
  saveLughaProfile(merged)
  if (merged.role === 'tutor' || merged.role === 'student') {
    saveLughaRole(merged.role)
  }
}

export function readStoredProfile(wallet: string): Profile | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(profileKey(wallet))
  if (!raw) return readLughaProfile()
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function clearStoredProfile(wallet: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(profileKey(wallet))
  clearLughaSession()
}
