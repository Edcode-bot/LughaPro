/** Seeded demo wallets from /api/seed — hide when real creators exist */
const SEED_WALLET_PREFIX = '0x000000000000000000000000000000000000'

export function isSeedWallet(wallet: string | null | undefined) {
  if (!wallet) return false
  return wallet.toLowerCase().startsWith(SEED_WALLET_PREFIX)
}

export function prioritizeRealTutors<T extends { profile?: { wallet_address?: string | null } }>(items: T[]) {
  const real = items.filter((item) => !isSeedWallet(item.profile?.wallet_address))
  return real.length > 0 ? real : items
}
