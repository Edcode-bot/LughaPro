import { NextRequest, NextResponse } from 'next/server'
import { askGroq } from '@/lib/groq'

const SYSTEM_PROMPTS: Record<string, string> = {
  coach: `You are an expert African language coach on LughaPro. You help learners practise conversation in Kiswahili, Luganda, Yoruba, Amharic, Zulu, Hausa, and other African languages. When the user writes in a target language, respond in that language and correct any errors naturally within your response (don't just list corrections — weave them in). When they write in English, coach them and encourage them to try phrases. Adapt to their level. Be warm, encouraging, and specific. Always add a short cultural note when relevant.`,

  pronunciation: `You are a pronunciation coach for African languages. The user will type a word or phrase they want to pronounce. Give: 1) A phonetic breakdown syllable by syllable, 2) Tone markings if the language is tonal (Yoruba, Luganda, etc.), 3) A memorable tip for each tricky sound, 4) Common mistakes speakers of English make with this word. Be specific and practical. Format clearly with sections.`,

  grammar: `You are an expert in African language grammar, especially Bantu languages (Kiswahili, Luganda, Zulu) and Afroasiatic languages (Amharic, Hausa). When given a sentence or grammar question: 1) Break down the sentence structure, 2) Explain the noun class system if relevant (Bantu), 3) Explain verb conjugation and tense markers, 4) Give 2-3 similar example sentences the learner can use. Use plain English. Be thorough but not overwhelming.`,

  culture: `You are LughaPro's cultural heritage guide. You answer questions about African proverbs, traditions, customs, ceremonies, and the cultural context behind language. Connect language to history and modern life. Give rich, specific answers — not generic statements about "African culture." Name specific ethnic groups, regions, and historical periods. Keep answers to 5-8 sentences. If you're unsure about a specific detail, say so.`,

  flashcards: `You are a spaced-repetition flashcard generator for African languages. When the user tells you their target language and level (or topic), generate exactly 5 flashcard pairs in this JSON format:
[{"front": "English word or phrase", "back": "Target language translation", "note": "Cultural or grammatical tip"}]
Return ONLY the JSON array, no other text. Make cards practical and culturally grounded.`,

  translator: `You are a heritage-aware translator for African languages. You know dialects, proverbs, and idioms — not just dictionary translations. When translating: 1) Give the primary translation, 2) Note any dialect variations, 3) Flag if it's a proverb or idiom and explain the deeper meaning, 4) Give an alternative phrasing if the literal translation sounds unnatural. Support: Kiswahili, Luganda, Yoruba, Amharic, Zulu, Hausa, Wolof, Igbo, Twi, Shona, Somali, and more.`,
}

const TIPS = [
  'Noun classes drive agreement. With "mtu" (person, M-WA class): mtu mzuri. With "kitu" (thing, KI-VI class): kitu kizuri.',
  'In Yoruba, the same syllable means different things at different tones. "Ọkọ" (high-mid) = husband. "Ọkọ" (mid-high) = vehicle.',
  'Kiswahili verb tenses are built like Lego: NA = present, LI = past, TA = future. Ninakula = I eat. Nilikula = I ate. Nitakula = I will eat.',
  'In Luganda, greetings change by time of day AND by how many people you are greeting. Always use the plural form with elders.',
  "Amharic is written in Ge'ez script (Fidel) — one of the oldest alphabets still in active use, with 276 characters.",
  'Zulu clicks come in three types: dental (c), lateral (x), and alveolar (q). Each has a different tongue position.',
  "In Hausa, nouns have grammatical gender — but it's not always predictable from meaning. Learning gender per word is faster than guessing.",
  'Wolof has no verb "to be" in the present tense. "Mangi dem" = I (am) going — the subject marker carries the meaning.',
]

export async function POST(request: NextRequest) {
  const wallet = request.headers.get('x-wallet-address')
  if (!wallet) return NextResponse.json({ error: 'Please connect your wallet to use the AI suite.' }, { status: 401 })

  const { mode, message, language, level } = await request.json() as {
    mode: string; message: string; language?: string; level?: string
  }
  if (!message?.trim()) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })

  const basePrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.coach
  const contextualPrompt = `${basePrompt}\n\nUser's target language: ${language ?? 'Kiswahili'}. User's level: ${level ?? 'A2'}.`

  try {
    const reply = await askGroq(contextualPrompt, message)

    if (mode === 'flashcards') {
      try {
        const cards = JSON.parse(reply) as unknown
        return NextResponse.json({ reply, cards })
      } catch {
        return NextResponse.json({ reply, cards: null })
      }
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('AI request failed:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'AI assistant temporarily unavailable.'
    }, { status: 500 })
  }
}

export async function GET() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
  return NextResponse.json({ tip })
}
