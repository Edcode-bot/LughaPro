import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { jsonError, jsonOk, getWalletAddress } from '@/lib/api'
import { getBookOwnerId } from '@/lib/books'
import { createServiceRoleClient } from '@/lib/supabase-service-role'
import { Book, ContentItem, ContentType, Post, Profile, PurchaseWithContent } from '@/types'
import { sendPurchaseConfirmationEmail, sendNewSaleEmail } from '@/lib/email'

async function loadContent(
  supabase: SupabaseClient,
  contentId: string,
  contentType: ContentType,
): Promise<ContentItem | null> {
  if (contentType === 'post') {
    const { data } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('id', contentId)
      .maybeSingle()
    if (!data) return null
    const post = data as Post & { author?: Profile }
    return {
      id: post.id,
      type: 'post',
      title: post.title,
      description: post.content.slice(0, 180),
      content: post.content,
      level: null,
      price: post.is_premium ? Number(post.price) : 0,
      cover_image_url: post.cover_image_url,
      file_url: null,
      tags: post.tags,
      language: post.language,
      author_id: post.author_id,
      author: post.author,
      created_at: post.created_at,
    }
  }

  const { data } = await supabase.from('books').select('*').eq('id', contentId).maybeSingle()
  if (!data) return null
  const book = data as Book
  const ownerId = getBookOwnerId(book)
  const { data: author } = await supabase.from('profiles').select('*').eq('id', ownerId).maybeSingle()
  return {
    id: book.id,
    type: book.content_type === 'lesson' ? 'lesson' : 'book',
    title: book.title,
    description: book.description,
    level: book.level,
    price: Number(book.price),
    cover_image_url: book.cover_image_url,
    file_url: book.file_url,
    tags: book.tags,
    language: book.language,
    author_id: getBookOwnerId(book),
    author: author as Profile | undefined,
    created_at: book.created_at,
  }
}

export async function GET(request: NextRequest) {
  const wallet = getWalletAddress(request) ?? request.nextUrl.searchParams.get('user')?.toLowerCase()
  if (!wallet) return jsonError('user wallet is required', 422)

  try {
    const supabase = createServiceRoleClient()
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .ilike('user_wallet', wallet)
      .order('purchased_at', { ascending: false })

    if (error) return jsonOk({ items: [] }, 'Purchases loaded')

    const items: PurchaseWithContent[] = []
    for (const purchase of purchases ?? []) {
      const content = await loadContent(supabase, purchase.content_id, purchase.content_type as ContentType)
      if (content) items.push({ ...purchase, content })
    }

    return jsonOk({ items }, 'Purchases loaded')
  } catch {
    return jsonOk({ items: [] }, 'Purchases loaded')
  }
}

export async function POST(request: Request) {
  const wallet = getWalletAddress(request)
  if (!wallet) return jsonError('wallet_address header is required', 401)

  try {
    const supabase = createServiceRoleClient()
    const body = await request.json() as {
      content_id?: string
      content_type?: ContentType
      amount?: number
      payment_method?: string
      tx_hash?: string
      status?: string
      progress_status?: 'not_started' | 'reading' | 'completed'
      progress_percent?: number
    }
    if (!body.content_id || !body.content_type) {
      return jsonError('content_id and content_type are required', 422)
    }
    // Require tx_hash for paid content
    if (Number(body.amount ?? 0) > 0 && !body.tx_hash) {
      return jsonError('tx_hash is required for paid content', 422)
    }

    const { data, error } = await supabase
      .from('purchases')
      .upsert(
        {
          user_wallet: wallet,
          content_id: body.content_id,
          content_type: body.content_type,
          amount: Number(body.amount ?? 0),
          payment_method: body.payment_method ?? 'cusd',
          tx_hash: body.tx_hash ?? null,
          status: body.status ?? 'paid',
          purchased_at: new Date().toISOString(),
          progress_status: body.progress_status ?? 'reading',
          progress_percent: body.progress_percent ?? 10,
        },
        { onConflict: 'user_wallet,content_id,content_type' },
      )
      .select('*')
      .single()

    if (error) return jsonError(error.message, 500)

    // Check if buyer was referred — issue a pending reward; also fetch profiles for emails
    try {
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id, referred_by, email, full_name')
        .ilike('wallet_address', wallet)
        .maybeSingle()

      if (buyerProfile?.referred_by) {
        const { data: existingReward } = await supabase
          .from('referral_rewards')
          .select('id')
          .ilike('referred_wallet', wallet)
          .maybeSingle()

        if (!existingReward) {
          await supabase.from('referral_rewards').insert({
            referrer_wallet: buyerProfile.referred_by,
            referred_wallet: wallet.toLowerCase(),
            amount: 0.1,
            paid: false,
          })
        }
      }

      // Send purchase confirmation to buyer (fire-and-forget)
      const contentData = await loadContent(supabase, body.content_id!, body.content_type!)
      if (buyerProfile?.email && contentData && body.tx_hash) {
        sendPurchaseConfirmationEmail(buyerProfile.email, {
          contentTitle: contentData.title,
          creatorName: contentData.creator_name ?? contentData.author?.full_name ?? 'LughaPro Creator',
          amount: `${body.amount ?? 0} ${(body.payment_method ?? 'cUSD').toUpperCase()}`,
          txHash: body.tx_hash,
        }).catch(() => {})
      }

      // Send new sale email to creator (fire-and-forget)
      if (contentData) {
        const creatorId = contentData.author_id ?? contentData.creator_id
        if (creatorId) {
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', creatorId)
            .maybeSingle()
          if (creatorProfile?.email) {
            sendNewSaleEmail(creatorProfile.email, {
              contentTitle: contentData.title,
              amount: `${body.amount ?? 0} ${(body.payment_method ?? 'cUSD').toUpperCase()}`,
              buyerName: buyerProfile?.full_name ?? 'A learner',
            }).catch(() => {})
          }
        }
      }
    } catch {
      // Email/referral failures must not block purchase recording
    }

    return jsonOk(data, 'Purchase recorded', 201)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to record purchase', 500)
  }
}
