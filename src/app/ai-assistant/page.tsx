'use client'
import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

type Mode = 'chat' | 'translate' | 'culture'
type Message = { role: 'user' | 'ai'; text: string }

export default function AIAssistantPage() {
  const { address } = useAuth()
  const [mode, setMode] = useState<Mode>('chat')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Habari! I'm your LughaPro cultural guide. Ask me about African languages, proverbs, traditions, or get help translating something." }
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !address || loading) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': address },
        body: JSON.stringify({ mode, message: userMsg }),
      })
      const data = await res.json() as { reply?: string; error?: string }
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply! }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.error ?? "Sorry, I couldn't process that. Try again." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection issue — please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const modeLabels: Record<Mode, { label: string; placeholder: string }> = {
    chat: { label: '💬 Chat', placeholder: 'Ask me anything about African languages or culture...' },
    translate: { label: '🌐 Translate', placeholder: 'Type text to translate, with the language you want...' },
    culture: { label: '🏺 Culture Guide', placeholder: 'Ask about a proverb, tradition, or custom...' },
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl">

        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-[#1a4731]">

          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-black text-white">AI Cultural Assistant</h2>
              <p className="text-xs text-white/50 mt-0.5">Powered by AI · Ask freely</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Online
            </span>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 px-4 pt-3 bg-black/10">
            {(Object.keys(modeLabels) as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-[#fdf6e3] text-[#171717]' : 'text-white/60 hover:text-white'
                }`}>
                {modeLabels[m].label}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div ref={scrollRef} className="bg-[#fdf6e3] h-96 overflow-y-auto p-5 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'ai'
                  ? 'bg-white border border-gray-100 self-start rounded-bl-sm text-[#171717]'
                  : 'bg-[#1a4731] text-white self-end rounded-br-sm'
              }`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-gray-100 self-start rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-[#fdf6e3] px-3 pb-4 sm:px-4">
            <div className="flex items-end gap-2 border-t border-gray-200 pt-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() } }}
                placeholder={modeLabels[mode].placeholder}
                disabled={!address}
                rows={1}
                className="min-w-0 flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#FFBF00] focus:outline-none bg-white disabled:opacity-50 max-h-32 overflow-y-auto"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim() || loading || !address}
                className="shrink-0 rounded-full bg-[#FFBF00] px-4 py-2.5 text-sm font-black text-[#171717] hover:bg-[#e6ac00] disabled:opacity-40 transition-colors"
              >
                Send
              </button>
            </div>
            {!address && <p className="text-xs text-gray-400 mt-2">Connect your wallet to use the AI assistant.</p>}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
