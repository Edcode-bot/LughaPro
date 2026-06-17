import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import {
  mintCertificateOnChain,
  buildCertificateTokenUri,
} from '@/lib/admin-wallet'
import { CONTRACT_ADDRESSES, LUGHA_CERTIFICATE_ABI } from '@/lib/contracts'

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Look up profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('wallet_address', wallet)
    .maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json() as {
    content_id?: string
    content_title?: string
    content_type?: string
    creator_name?: string
    level?: string
  }
  if (!body.content_id) return NextResponse.json({ error: 'content_id required' }, { status: 400 })

  // Verify purchase
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .ilike('user_wallet', wallet)
    .eq('content_id', body.content_id)
    .maybeSingle()
  if (!purchase) return NextResponse.json({ error: 'Content not purchased' }, { status: 403 })

  // Prevent duplicate minting
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, token_id, tx_hash')
    .eq('user_id', profile.id)
    .eq('content_id', body.content_id)
    .maybeSingle()
  if (existing) return NextResponse.json({ error: 'Certificate already minted', certificate: existing }, { status: 409 })

  const courseName = body.content_title ?? 'LughaPro Course'
  const creatorName = body.creator_name ?? 'LughaPro Creator'
  const level = body.level ?? 'Beginner'

  try {
    const tokenURI = buildCertificateTokenUri({ courseName, creatorName, level })

    const txHash = await mintCertificateOnChain({
      studentAddress: wallet as `0x${string}`,
      courseName,
      level,
      creatorName,
      tokenURI,
    })

    // Wait for the transaction and extract token ID from the CertificateMinted event
    const publicClient = createPublicClient({ chain: celo, transport: http('https://forno.celo.org') })
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    let tokenId: string | null = null
    try {
      const log = receipt.logs.find(
        (l) => l.address.toLowerCase() === CONTRACT_ADDRESSES.celo.LughaCertificate.toLowerCase(),
      )
      if (log) {
        // CertificateMinted event: first topic = event sig, second = tokenId (indexed)
        tokenId = log.topics[1] ? BigInt(log.topics[1]).toString() : null
      }
    } catch { /* ignore if event parsing fails */ }

    // Record in DB
    const { data: cert, error: dbError } = await supabase
      .from('certificates')
      .insert({
        user_id: profile.id,
        content_id: body.content_id,
        content_title: courseName,
        creator_name: creatorName,
        token_id: tokenId,
        tx_hash: txHash,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[certificates/mint] DB record failed:', dbError.message)
    }

    return NextResponse.json({ data: cert ?? { tx_hash: txHash, token_id: tokenId } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Mint failed'
    console.error('[certificates/mint]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
