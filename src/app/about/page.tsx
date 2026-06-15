import Link from 'next/link'
import { NavBar } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

export default function AboutPage() {
  return (
    <main>
      <NavBar />

      {/* Hero — dark */}
      <section className="min-h-[60vh] bg-[#171717] flex items-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FFBF00]/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#1a4731]/30 blur-[80px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-8 py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-[#FFBF00] animate-pulse" />
            <span className="text-[#FFBF00] text-sm font-semibold">Our Story</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white leading-tight">
            Africa&apos;s Culture,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBF00] to-[#e6ac00]">
              Open to the World
            </span>
          </h1>
          <p className="mt-6 text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            LughaPro is the definitive gateway to African culture — where languages, arts, music, and wisdom are alive and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission section — cream */}
      <section className="bg-[#fdf6e3] py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 border-l-4 border-l-[#FFBF00]">
              <div className="w-12 h-12 rounded-xl bg-[#FFBF00]/20 flex items-center justify-center text-2xl mb-4">🎯</div>
              <h2 className="font-serif text-2xl font-black text-[#1a4731] mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Making Africa&apos;s cultural heritage accessible and affordable — because Africa&apos;s languages, arts, music, and wisdom deserve to be alive and open to the world. We put verified creators, cultural authenticity, and fair pay at the heart of everything we do.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 border-l-4 border-l-[#1a4731]">
              <div className="w-12 h-12 rounded-xl bg-[#1a4731]/10 flex items-center justify-center text-2xl mb-4">🌍</div>
              <h2 className="font-serif text-2xl font-black text-[#1a4731] mb-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A future where every African creator is rewarded for the heritage they share, and African culture is not just preserved — but celebrated, streamed, sold, and studied worldwide. Built on Celo blockchain for transparent, direct creator payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we offer — white */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-black text-[#171717]">What LughaPro Offers</h2>
            <p className="mt-4 text-lg text-gray-500">Everything you need to learn, create, and earn from African culture.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🗣️', title: 'Language Learning', desc: 'Learn Kiswahili, Yoruba, Wolof, Amharic, and 30+ more African languages from verified native speakers.' },
              { icon: '📚', title: 'Books & Literature', desc: 'Access e-books, poetry, and essays from African writers. Buy once, read forever in your library.' },
              { icon: '✍️', title: 'Articles & Posts', desc: 'Long-form cultural essays, tutorials, and insights — paid or free — from creators across the continent.' },
              { icon: '🎵', title: 'Music & Audio', desc: 'Stream traditional music, folk songs, oral histories, and podcast-style audio content.' },
              { icon: '🎬', title: 'Video Content', desc: 'Watch cultural documentaries, language lessons, music performances, and storytelling videos.' },
              { icon: '🏅', title: 'Certificates', desc: 'Earn blockchain-verified certificates on Celo for completed courses — credentials that last forever.' },
              { icon: '💰', title: 'Multi-Token Payments', desc: 'Pay with cUSD, CELO, or USDT. Creators receive 85% of every sale, paid directly to their wallet.' },
              { icon: '🏆', title: 'Gamification', desc: 'Earn XP, unlock achievement badges, climb the leaderboard from Newcomer to Griot level.' },
              { icon: '🔒', title: 'Blockchain-Backed', desc: 'Every transaction is recorded on Celo mainnet — transparent, immutable, and creator-owned.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:border-[#FFBF00] hover:shadow-lg hover:shadow-[#FFBF00]/10 hover:-translate-y-0.5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#171717] text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For creators / learners / enterprises — dark */}
      <section className="bg-[#171717] py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#1a4731]/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFBF00]/8 blur-[100px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-black text-white">Built for Everyone</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="text-3xl mb-4">👩‍🎓</div>
              <h3 className="font-serif text-xl font-black text-white mb-4">For Learners</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>✓ Browse 50+ pieces of cultural content</li>
                <li>✓ Pay with crypto — cUSD, CELO, or USDT</li>
                <li>✓ Access purchased content anytime in My Library</li>
                <li>✓ Earn XP and achievement badges as you learn</li>
                <li>✓ Get blockchain-verified certificates</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#FFBF00]/30 bg-[#FFBF00]/5 p-8">
              <div className="text-3xl mb-4">🎙️</div>
              <h3 className="font-serif text-xl font-black text-white mb-4">For Creators</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>✓ Publish books, posts, videos, and music</li>
                <li>✓ Keep 85% of every sale</li>
                <li>✓ Get paid in cUSD or CELO — directly to your wallet</li>
                <li>✓ Withdraw earnings on-chain anytime</li>
                <li>✓ Build an audience and grow your creator profile</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="font-serif text-xl font-black text-white mb-4">For Enterprises</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>✓ Corporate language training programs</li>
                <li>✓ Custom certificates with your branding</li>
                <li>✓ SDG-aligned cultural education</li>
                <li>✓ API access for integration</li>
                <li>✓ Bulk learner management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain section — forest */}
      <section className="bg-[#1a4731] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFBF00]/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-8 text-center">
          <div className="text-4xl mb-6">⛓️</div>
          <h2 className="font-serif text-4xl font-black text-white mb-4">Powered by Celo Blockchain</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Every payment on LughaPro is processed through our smart contract on Celo mainnet. This means no middlemen, instant payments, and permanent records of every creator earning.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { label: 'Smart Contract', value: '0x99e6...B003', link: 'https://celoscan.io/address/0x99e6eaf7952b9c45658c69f0999ac8503989b003' },
              { label: 'Network', value: 'Celo Mainnet', link: null },
              { label: 'Creator Fee', value: '85% of every sale', link: null },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 p-4">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">{item.label}</div>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFBF00] font-mono text-sm mt-1 block hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className="text-white font-bold text-sm mt-1">{item.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f8f4ef] py-20 text-center">
        <h2 className="font-serif text-4xl font-black text-[#171717]">Ready to explore?</h2>
        <p className="mt-4 text-lg text-gray-500">Join LughaPro and be part of Africa&apos;s cultural renaissance.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/explore"
            className="rounded-full bg-[#FFBF00] px-8 py-4 font-black text-[#171717] hover:bg-[#e6ac00] transition-all hover:scale-105"
          >
            Start Exploring
          </Link>
          <Link
            href="/publish"
            className="rounded-full border-2 border-[#1a4731] px-8 py-4 font-bold text-[#1a4731] hover:bg-[#1a4731] hover:text-white transition-all"
          >
            Become a Creator
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
