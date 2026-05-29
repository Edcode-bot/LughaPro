import { isAddress } from 'viem'
import { jsonError, jsonOk } from '@/lib/api'
import { assertAdminSecret, buildCertificateTokenUri, mintCertificateOnChain } from '@/lib/admin-wallet'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  if (!assertAdminSecret(request)) {
    return jsonError('Unauthorized', 401)
  }

  try {
    const body = await request.json() as {
      studentAddress?: string
      courseName?: string
      level?: string
      creatorName?: string
      contentId?: string
    }

    const studentAddress = body.studentAddress?.toLowerCase()
    if (!studentAddress || !isAddress(studentAddress)) {
      return jsonError('Valid studentAddress is required', 422)
    }
    if (!body.courseName || !body.creatorName) {
      return jsonError('courseName and creatorName are required', 422)
    }

    const level = body.level ?? 'Completed'
    const tokenURI = buildCertificateTokenUri({
      courseName: body.courseName,
      creatorName: body.creatorName,
      level,
    })

    const txHash = await mintCertificateOnChain({
      studentAddress: studentAddress as `0x${string}`,
      courseName: body.courseName,
      level,
      creatorName: body.creatorName,
      tokenURI,
    })

    await supabaseAdmin.from('certificates').insert({
      student_wallet: studentAddress,
      course_name: body.courseName,
      creator_name: body.creatorName,
      level,
    })

    return jsonOk(
      { tx_hash: txHash, student_address: studentAddress, content_id: body.contentId ?? null },
      'Certificate minted',
      201,
    )
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Mint failed', 500)
  }
}
