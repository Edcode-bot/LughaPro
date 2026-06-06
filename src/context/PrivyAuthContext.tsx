'use client'

import { createContext, useContext } from 'react'

export type PrivyAuthState = {
  privyAuthenticated: boolean
  privyWalletAddress: string | null
  privyEmail: string | null
  privyDisplayName: string | null
  privyLogin: (() => void) | null
  privyLogout: (() => void) | null
}

const defaultState: PrivyAuthState = {
  privyAuthenticated: false,
  privyWalletAddress: null,
  privyEmail: null,
  privyDisplayName: null,
  privyLogin: null,
  privyLogout: null,
}

export const PrivyAuthContext = createContext<PrivyAuthState>(defaultState)

export function usePrivyAuth() {
  return useContext(PrivyAuthContext)
}
