'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FadeIn } from '@/components/ui/FadeIn'
import { useAuth } from '@/hooks/useAuth'

const ADMIN_WALLETS = [
  '0xe38a456433fff7814e40998cf0cbbbd2c885b513',
]

type AdminStats = {
  total_users: number
  total_content: number
  total_purchases: number
  total_revenue: number
}

type AdminUser = {
  id: string
  full_name: string
  wallet_address: string | null
  role: string
  created_at: string
}

type AdminContent = {
  id: string
  title: string
  type: string
  price: number
  published: boolean
  created_at: string
  creator_name: string
}

type AdminPurchase = {
  id: string
  user_wallet: string
  content_type: string
  amount: number
  purchased_at: string
  tx_hash: string | null
}

type AdminTab = 'overview' | 'users' | 'content' | 'transactions' | 'broadcast'

export default function AdminPage() {
  const { address } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!address) return
    if (!ADMIN_WALLETS.includes(address.toLowerCase())) {
      router.replace('/dashboard')
    }
  }, [address, router])

  const [tab, setTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [content, setContent] = useState<AdminContent[]>([])
  const [purchases, setPurchases] = useState<AdminPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastSent, setBroadcastSent] = useState(false)

  useEffect(() => {
    if (!address || !ADMIN_WALLETS.includes(address.toLowerCase())) return
    setLoading(true)
    fetch('/api/admin/stats', { headers: { 'x-wallet-address': address } })
      .then((r) => r.json())
      .then((d: { data?: { stats?: AdminStats; users?: AdminUser[]; content?: AdminContent[]; purchases?: AdminPurchase[] } }) => {
        setStats(d.data?.stats ?? null)
        setUsers(d.data?.users ?? [])
        setContent(d.data?.content ?? [])
        setPurchases(d.data?.purchases ?? [])
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false))
  }, [address])

  if (address && !ADMIN_WALLETS.includes(address.toLowerCase())) {
    return null
  }

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: `Users (${users.length})` },
    { key: 'content', label: `Content (${content.length})` },
    { key: 'transactions', label: `Transactions (${purchases.length})` },
    { key: 'broadcast', label: 'Broadcast' },
  ]

  async function sendBroadcast() {
    if (!address || !broadcastTitle.trim() || !broadcastMessage.trim()) return
    setBroadcasting(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage }),
      })
      const data = await res.json() as { data?: unknown; error?: string }
      if (data.data) {
        setBroadcastTitle('')
        setBroadcastMessage('')
        setBroadcastSent(true)
        setTimeout(() => setBroadcastSent(false), 3000)
      }
    } finally {
      setBroadcasting(false)
    }
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          {/* Admin badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 rounded-full bg-[#FFBF00]/20 px-4 py-1.5 border border-[#FFBF00]/30">
              <span className="h-2 w-2 rounded-full bg-[#FFBF00] animate-pulse" />
              <span className="text-sm font-bold text-[#1a4731]">Admin Access</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  tab === t.key
                    ? 'bg-[#171717] text-white'
                    : 'bg-white border border-gray-100 text-[#171717] hover:border-[#FFBF00]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : (
            <>
              {/* Overview */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users', value: stats?.total_users ?? users.length, color: 'text-[#1a4731]' },
                      { label: 'Total Content', value: stats?.total_content ?? content.length, color: 'text-[#FFBF00]' },
                      { label: 'Transactions', value: stats?.total_purchases ?? purchases.length, color: 'text-blue-600' },
                      { label: 'Revenue (cUSD)', value: `${(stats?.total_revenue ?? 0).toFixed(2)}`, color: 'text-green-600' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-6 hover:border-[#FFBF00] transition-colors">
                        <div className={`font-serif text-4xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <h3 className="font-serif text-xl font-black text-[#171717] mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => setTab('users')} className="rounded-full bg-[#1a4731] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2d6a4f] transition-colors">
                        Manage Users
                      </button>
                      <button type="button" onClick={() => setTab('content')} className="rounded-full bg-[#FFBF00] px-5 py-2.5 text-sm font-bold text-[#171717] hover:bg-[#e6ac00] transition-colors">
                        Moderate Content
                      </button>
                      <button type="button" onClick={() => setTab('transactions')} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-[#171717] hover:border-[#FFBF00] transition-colors">
                        View Transactions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users */}
              {tab === 'users' && (
                <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-serif text-xl font-black text-[#171717]">All Users ({users.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f8f4ef]">
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Wallet</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Joined</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#f8f4ef]/50 transition-colors">
                            <td className="px-5 py-4 font-medium text-[#171717]">{u.full_name}</td>
                            <td className="px-5 py-4 text-gray-500 font-mono text-xs">
                              {u.wallet_address ? `${u.wallet_address.slice(0, 8)}…${u.wallet_address.slice(-4)}` : '—'}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                                u.role === 'tutor' ? 'bg-[#1a4731]/10 text-[#1a4731]' :
                                u.role === 'admin' ? 'bg-[#FFBF00]/20 text-[#b8860b]' :
                                'bg-gray-100 text-gray-600'
                              }`}>{u.role}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4">
                              <Link href={`/tutor/${u.id}`} className="text-xs font-bold text-[#1a4731] hover:underline">View →</Link>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No users found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Content */}
              {tab === 'content' && (
                <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-serif text-xl font-black text-[#171717]">All Content ({content.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f8f4ef]">
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creator</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Published</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {content.map((c) => (
                          <tr key={c.id} className="hover:bg-[#f8f4ef]/50 transition-colors">
                            <td className="px-5 py-4 font-medium text-[#171717] max-w-48 truncate">{c.title}</td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-[#f8f4ef] px-2.5 py-0.5 text-xs font-semibold text-[#1a4731] capitalize">{c.type}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-500 text-xs">{c.creator_name}</td>
                            <td className="px-5 py-4 text-gray-600 text-xs">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {c.published ? 'Live' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {content.length === 0 && (
                          <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No content found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Broadcast */}
              {tab === 'broadcast' && (
                <div className="rounded-2xl bg-white border border-gray-100 p-6 max-w-2xl">
                  <h3 className="font-serif text-xl font-black text-[#171717] mb-1">Send Platform Broadcast</h3>
                  <p className="text-sm text-gray-500 mb-5">All logged-in users will see this banner until they dismiss it.</p>
                  <label className="block text-sm font-semibold text-[#1a4731] mb-1">Title</label>
                  <input
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Platform update"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-4 focus:border-[#FFBF00] focus:outline-none"
                  />
                  <label className="block text-sm font-semibold text-[#1a4731] mb-1">Message</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. We've launched new features! Check your dashboard."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-4 focus:border-[#FFBF00] focus:outline-none resize-none"
                  />
                  <button
                    type="button"
                    disabled={broadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
                    onClick={() => void sendBroadcast()}
                    className="rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-bold text-[#171717] hover:bg-[#e6ac00] disabled:opacity-50"
                  >
                    {broadcasting ? 'Sending…' : broadcastSent ? '✓ Sent!' : 'Send Broadcast'}
                  </button>
                </div>
              )}

              {/* Transactions */}
              {tab === 'transactions' && (
                <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-serif text-xl font-black text-[#171717]">Transactions ({purchases.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f8f4ef]">
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Buyer</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                          <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {purchases.map((p) => (
                          <tr key={p.id} className="hover:bg-[#f8f4ef]/50 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-gray-500">
                              {p.user_wallet ? `${p.user_wallet.slice(0, 8)}…${p.user_wallet.slice(-4)}` : '—'}
                            </td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-[#f8f4ef] px-2 py-0.5 text-xs font-semibold capitalize text-[#1a4731]">{p.content_type}</span>
                            </td>
                            <td className="px-5 py-4 font-bold text-[#1a4731]">{p.amount} cUSD</td>
                            <td className="px-5 py-4 text-gray-400 text-xs">{new Date(p.purchased_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4 text-xs">
                              {p.tx_hash ? (
                                <a
                                  href={`https://celoscan.io/tx/${p.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-[#1a4731] hover:underline"
                                >
                                  {p.tx_hash.slice(0, 10)}…
                                </a>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                        {purchases.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No transactions yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
