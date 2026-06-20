import { NextRequest, NextResponse } from 'next/server'
import { askGemini } from '@/lib/gemini'

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `You are LughaPro's friendly cultural and language guide for African languages and heritage. Be warm, knowledgeable, and concise. If you don't know something specific, say so honestly rather than making it up.`,
  translate: `You are a culturally-aware translator. Translate the given text and explain any cultural nuance, idiom, or proverb meaning briefly. Format your answer as: Translation, then a short cultural note if relevant.`,
  culture: `You are LughaPro's cultural heritage guide for African languages and traditions. Answer questions about proverbs, customs, and practices. Connect language to history and modern life. Keep answers to 4-6 sentences. Be accurate — if unsure, say so.`,
}

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Please connect your wallet to use the AI assistant.' }, { status: 401 })

  const { mode, message } = await request.json() as { mode: string; message: string }
  if (!message?.trim()) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })

  const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.chat

  try {
    const reply = await askGemini(systemPrompt, message)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('AI request failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'AI assistant is temporarily unavailable.' }, { status: 500 })
  }
}
