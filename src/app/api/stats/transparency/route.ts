import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const [creators, content, purchases, certificates] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('purchases').select('amount, payment_method, tx_hash, purchased_at').order('purchased_at', { ascending: false }),
    supabase.from('certificates').select('id', { count: 'exact', head: true }),
  ])

  const [books, videos, music] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('videos').select('id', { count: 'exact', head: true }),
    supabase.from('music').select('id', { count: 'exact', head: true }),
  ])

  const totalContent = (content.count ?? 0) + (books.count ?? 0) + (videos.count ?? 0) + (music.count ?? 0)
  const totalTransactions = purchases.data?.length ?? 0
  const totalVolume = (purchases.data ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const recentTx = (purchases.data ?? []).slice(0, 10).map(p => ({
    amount: p.amount,
    method: p.payment_method,
    tx_hash: p.tx_hash,
    date: p.purchased_at,
  }))

  return NextResponse.json({
    creators: creators.count ?? 0,
    content_items: totalContent,
    transactions: totalTransactions,
    volume: totalVolume.toFixed(2),
    certificates_minted: certificates.count ?? 0,
    recent_transactions: recentTx,
    contract_address: '0x99e6eaf7952b9c45658C69f0999Ac8503989B003',
  })
}
