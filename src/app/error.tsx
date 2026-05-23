"use client";

import { Button } from '@/components/ui/Button'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-off-white px-5 text-center"><div className="max-w-lg rounded-3xl bg-white p-8 shadow-luxury"><h1 className="font-serif text-4xl font-black text-forest">Let&apos;s try that again</h1><p className="mt-3 text-forest/65">Something went wrong, but LughaPro is still here for you.</p><Button className="mt-6" onClick={reset}>Reload</Button></div></main>
}
