"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentItem, TutorWithProfile } from "@/types";

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [content, setContent] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setTutors([])
      setContent([])
      return
    }

    const timer = window.setTimeout(() => {
      Promise.all([
        fetch(`/api/tutors?search=${encodeURIComponent(query)}&limit=5`).then((r) => r.json()),
        fetch(`/api/content?search=${encodeURIComponent(query)}&limit=5`).then((r) => r.json()),
      ]).then(([tutorResult, contentResult]) => {
        setTutors(tutorResult.data?.items ?? [])
        setContent(contentResult.data?.items ?? [])
      })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [open, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] bg-forest/60 backdrop-blur-sm">
      <div className="mx-auto mt-20 max-w-2xl px-5">
        <div className="rounded-2xl bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-foreground/50" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creators or content..."
              className="flex-1 outline-none"
            />
            <button type="button" onClick={onClose} aria-label="Close search">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {tutors.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase text-foreground/50">Creators</p>
                {tutors.map((tutor) => (
                  <Link
                    key={tutor.id}
                    href={`/tutor/${tutor.id}`}
                    onClick={onClose}
                    className="block rounded-xl px-3 py-2 hover:bg-off-white"
                  >
                    {tutor.profile?.full_name}
                  </Link>
                ))}
              </div>
            ) : null}
            {content.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-foreground/50">Content</p>
                {content.map((item) => (
                  <Link
                    key={item.id}
                    href="/learn"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-2 hover:bg-off-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ) : null}
            {query.length >= 2 && tutors.length === 0 && content.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/60">No results found</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
