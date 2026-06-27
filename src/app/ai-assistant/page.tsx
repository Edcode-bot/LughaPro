'use client'
import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

type Mode = 'coach' | 'pronunciation' | 'grammar' | 'culture' | 'flashcards' | 'translator'
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
type Message = { role: 'user' | 'ai'; text: string }
type Flashcard = { front: string; back: string; note: string }

const LANGUAGES = ['Kiswahili', 'Luganda', 'Yoruba', 'Amharic', 'Zulu', 'Hausa', 'Wolof', 'Igbo', 'Twi', 'Shona', 'Somali']
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const MODES: { id: Mode; icon: string; label: string; shortLabel: string; description: string; badge: string }[] = [
  { id: 'coach', icon: '💬', label: 'Conversation Coach', shortLabel: 'Coach', description: 'Practise real-life scenarios with an AI that responds like a native speaker and corrects you in context.', badge: 'Adaptive' },
  { id: 'pronunciation', icon: '🎙️', label: 'Pronunciation Guide', shortLabel: 'Pronunciation', description: 'Get phonetic breakdowns, tone feedback, and tips for any word or phrase.', badge: 'Phonetic' },
  { id: 'grammar', icon: '📝', label: 'Grammar Explainer', shortLabel: 'Grammar', description: 'Type any sentence and get a breakdown of noun classes, verb conjugations, and tonal rules.', badge: 'Bantu AI' },
  { id: 'culture', icon: '🏺', label: 'Cultural Context', shortLabel: 'Culture', description: 'Ask about any proverb, tradition, or practice and get a rich heritage-connected explanation.', badge: 'Heritage' },
  { id: 'flashcards', icon: '🃏', label: 'Flashcard Generator', shortLabel: 'Flashcards', description: 'Generate personalised spaced-repetition flashcard decks for your weak areas.', badge: 'Adaptive' },
  { id: 'translator', icon: '🔤', label: 'Heritage Translator', shortLabel: 'Translator', description: 'Translate with cultural notes, dialect variations, and idiomatic alternatives.', badge: '34 languages' },
]

const PLACEHOLDERS: Record<Mode, string> = {
  coach: "Say something in your target language, or ask me to start a scenario (e.g. \"Let's practise at a market in Nairobi\")...",
  pronunciation: 'Type a word or phrase to get a phonetic breakdown (e.g. "asante sana" or "ẹ káàbọ̀")...',
  grammar: 'Type a sentence or ask a grammar question (e.g. "What does the -ki- prefix mean in Kiswahili?")...',
  culture: 'Ask about a proverb, tradition, or custom (e.g. "What does Sankofa mean?" or "Why do Yoruba people greet by kneeling?")...',
  flashcards: 'Tell me your topic and level (e.g. "Give me 5 flashcards for Kiswahili market phrases at A2 level")...',
  translator: "Type text to translate and the language pair (e.g. \"Translate 'I respect my elders' to Luganda\")...",
}

const MODE_INTROS: Record<Mode, string> = {
  coach: "Habari! I'm your conversation coach. Tell me what scenario you want to practise, or just start speaking in your target language.",
  pronunciation: "Type any word or phrase and I'll give you a full phonetic breakdown with tone guidance.",
  grammar: "Type a sentence or grammar question. I'll break it down — noun classes, verb forms, tonal rules — all of it.",
  culture: "Ask me about any African proverb, tradition, ceremony, or cultural practice. I'll give you the full heritage context.",
  flashcards: "Tell me your topic and level and I'll generate a personalised flashcard deck for you.",
  translator: "What would you like to translate? Tell me the source text and target language.",
}

export default function AIAssistantPage() {
  const { address } = useAuth()
  const [mode, setMode] = useState<Mode>('coach')
  const [language, setLanguage] = useState('Kiswahili')
  const [level, setLevel] = useState<Level>('A2')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Habari! I'm your AI language coach. Ask me anything in English or Kiswahili — grammar, culture, or just practise conversation. Karibu sana!" }
  ])
  const [loading, setLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [tip, setTip] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/ai/ask').then(r => r.json()).then((d: { tip?: string }) => setTip(d.tip ?? null)).catch(() => {})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setFlashcards(null)
    setFlippedCards(new Set())
    setMessages([{ role: 'ai', text: MODE_INTROS[newMode] }])
    setInput('')
  }

  const handleSend = async () => {
    if (!input.trim() || !address || loading) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    setFlashcards(null)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({ mode, message: userMsg, language, level }),
      })
      const data = await res.json() as { reply?: string; cards?: Flashcard[] | null; error?: string }
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply! }])
        if (data.cards) setFlashcards(data.cards)
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.error ?? 'Something went wrong. Please try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection issue — please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const toggleCard = (i: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const currentMode = MODES.find(m => m.id === mode)!

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a4731] to-[#0f2a1e] p-6 md:p-8 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  AI Suite · Online
                </span>
              </div>
              <h1 className="font-serif text-3xl font-black">LughaPro AI Suite</h1>
              <p className="text-white/60 mt-1 max-w-lg text-sm leading-relaxed">
                Your 24/7 AI language coach for African languages. Real-time grammar help, pronunciation guidance, cultural context, and conversation practice.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-[#FFBF00] cursor-pointer">
                {LANGUAGES.map(l => <option key={l} value={l} className="text-[#171717]">{l}</option>)}
              </select>
              <div className="flex rounded-full bg-white/10 border border-white/20 overflow-hidden">
                {LEVELS.map(l => (
                  <button key={l} type="button" onClick={() => setLevel(l)}
                    className={`px-3 py-2 text-xs font-bold transition-colors ${level === l ? 'bg-[#FFBF00] text-[#171717]' : 'text-white/60 hover:text-white'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode cards */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {MODES.map(m => (
              <button key={m.id} type="button" onClick={() => handleModeChange(m.id)}
                className={`rounded-xl p-3 text-left transition-all ${mode === m.id ? 'bg-[#FFBF00] text-[#171717]' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}>
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-xs font-bold leading-tight">{m.shortLabel}</div>
                <div className={`text-xs mt-1 ${mode === m.id ? 'text-[#171717]/60' : 'text-white/40'}`}>{m.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Active mode description */}
        <div className="flex items-center gap-3 rounded-xl bg-[#fdf6e3] border border-[#FFBF00]/30 px-4 py-3">
          <span className="text-2xl">{currentMode.icon}</span>
          <div>
            <p className="font-bold text-sm text-[#171717]">{currentMode.label}</p>
            <p className="text-xs text-gray-500">{currentMode.description}</p>
          </div>
          <span className="ml-auto rounded-full bg-[#FFBF00]/20 px-3 py-1 text-xs font-bold text-[#1a4731]">{currentMode.badge}</span>
        </div>

        {/* Chat */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          <div ref={scrollRef} className="h-80 md:h-[420px] overflow-y-auto p-5 flex flex-col gap-3 bg-[#f8f4ef]">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] ${m.role === 'ai' ? 'self-start' : 'self-end'}`}>
                {m.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="h-5 w-5 rounded-full bg-[#1a4731] flex items-center justify-center text-white text-xs font-bold">A</div>
                    <span className="text-xs text-gray-400 font-semibold">AI Coach</span>
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'ai'
                    ? 'bg-white border border-gray-100 text-[#171717] rounded-tl-sm'
                    : 'bg-[#1a4731] text-white rounded-tr-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#1a4731] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-[#1a4731] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-[#1a4731] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-4 py-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() } }}
                placeholder={PLACEHOLDERS[mode]}
                disabled={!address}
                rows={2}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#FFBF00] focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
              />
              <button type="button" onClick={() => void handleSend()} disabled={!input.trim() || loading || !address}
                className="rounded-xl bg-[#FFBF00] px-4 py-2.5 font-black text-[#171717] hover:bg-[#e6ac00] disabled:opacity-40 transition-colors self-end flex-shrink-0 text-lg">
                ↑
              </button>
            </div>
            {!address ? (
              <p className="text-xs text-gray-400 mt-2 text-center">Connect your wallet to use the AI suite.</p>
            ) : (
              <p className="text-xs text-gray-300 mt-1 text-center">Enter to send · Shift+Enter for new line · {language} · {level}</p>
            )}
          </div>
        </div>

        {/* Flashcards */}
        {flashcards && flashcards.length > 0 && (
          <div>
            <h3 className="font-serif text-xl font-black text-[#171717] mb-3">Your Flashcard Deck</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {flashcards.map((card, i) => (
                <button key={i} type="button" onClick={() => toggleCard(i)}
                  className={`rounded-2xl p-5 text-left border-2 transition-all ${
                    flippedCards.has(i)
                      ? 'bg-[#1a4731] border-[#1a4731] text-white'
                      : 'bg-white border-gray-100 text-[#171717] hover:border-[#FFBF00]'
                  }`}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-60">
                    {flippedCards.has(i) ? 'Translation' : 'English'}
                  </div>
                  <div className="font-serif text-lg font-bold">
                    {flippedCards.has(i) ? card.back : card.front}
                  </div>
                  {flippedCards.has(i) && card.note && (
                    <div className="mt-2 text-xs text-white/70 leading-relaxed">{card.note}</div>
                  )}
                  <div className="mt-3 text-xs opacity-50">{flippedCards.has(i) ? 'Click to see English' : 'Click to reveal'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tip of the Day */}
        {tip && (
          <div className="rounded-2xl bg-[#171717] p-5 flex gap-4 items-start">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-[#FFBF00] mb-1">AI Tip of the Day</p>
              <p className="text-white/80 text-sm leading-relaxed">{tip}</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          LughaPro AI Language Suite · 34 African languages · Heritage-trained responses
        </p>

      </div>
    </DashboardLayout>
  )
}
