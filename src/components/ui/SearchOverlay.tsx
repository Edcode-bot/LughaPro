"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

type ContentResult = {
  id: string
  title: string
  type: string
  image: string | null
}

type CreatorResult = {
  id: string
  full_name: string
  avatar_url: string | null
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [content, setContent] = useState<ContentResult[]>([])
  const [creators, setCreators] = useState<CreatorResult[]>([])

  useEffect(() => {
    if (!open) { setQuery(""); setContent([]); setCreators([]); return }
    if (query.trim().length < 2) { setContent([]); setCreators([]); return }

    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((result: { data?: ContentResult[]; creators?: CreatorResult[] }) => {
          setContent(result.data ?? [])
          setCreators(result.creators ?? [])
        })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [open, query])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[70vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content, creators, topics..."
            className="flex-1 text-base outline-none text-[#171717] placeholder:text-gray-400"
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          {creators.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Creators</p>
              {creators.map((c) => (
                <Link
                  key={c.id}
                  href={`/tutor/${c.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8f4ef] transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-[#1a4731] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">{c.full_name}</span>
                </Link>
              ))}
            </div>
          )}

          {content.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Content</p>
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/learn/${item.id}?type=${item.type}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8f4ef] transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} className="h-full w-full object-cover" alt="" />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#171717] line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.length >= 2 && content.length === 0 && creators.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          )}

          {query.length < 2 && (
            <p className="text-sm text-gray-400 text-center py-8">Type at least 2 characters to search…</p>
          )}
        </div>
      </div>
    </div>
  )
}
