import { Footer } from '@/components/ui/Footer'
import { NavBar } from '@/components/ui/NavBar'
import { FadeIn } from '@/components/ui/FadeIn'
import { ReactNode } from 'react'

export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <FadeIn className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">{title}</h1>
        <div className="prose prose-forest mt-8 max-w-none text-foreground/80">{children}</div>
      </FadeIn>
      <Footer />
    </main>
  )
}
