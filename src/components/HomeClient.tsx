"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { ContentCard } from "@/components/ui/ContentCard";
import { CreatorCard } from "@/components/ui/CreatorCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { contentCoverEmoji, contentCoverStyle } from "@/lib/content";
import { formatCount } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { ContentItem, PlatformStats, TutorWithProfile } from "@/types";

const features = [
  { icon: "📚", title: "Rich Content Library", text: "Books, lessons, and articles from verified creators across Africa." },
  { icon: "💳", title: "Flexible Payments", text: "Pay with cUSD, CELO, or card — only for what you want to learn." },
  { icon: "🏆", title: "NFT Certificates", text: "Earn blockchain certificates when you complete learning paths." },
  { icon: "🌍", title: "African-First", text: "Content designed for African learners, by African creators." },
];

const testimonials = [
  { name: "Grace Mwangi", country: "🇰🇪 Kenya", quote: "LughaPro feels like a real edtech platform built for us. I bought two books and started immediately.", rating: 5 },
  { name: "Samuel Okello", country: "🇺🇬 Uganda", quote: "The creator library is excellent. Clear pricing, beautiful content cards, and easy wallet sign-in.", rating: 5 },
  { name: "Asha Hassan", country: "🇹🇿 Tanzania", quote: "Finally a Kiswahili marketplace that respects African learners and creators equally.", rating: 5 },
];

const previewCards = [
  { title: "Business Kiswahili", creator: "Amina K.", type: "book" as const },
  { title: "Coastal Dialect", creator: "Zara H.", type: "lesson" as const },
];

export function HomeClient() {
  const router = useRouter();
  const { isConnected } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [creators, setCreators] = useState<TutorWithProfile[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => response.json())
      .then((result: { data?: PlatformStats }) => setPlatformStats(result.data ?? null))
      .catch(() => setPlatformStats(null))
      .finally(() => setLoadingStats(false));

    fetch("/api/content?limit=6")
      .then((response) => response.json())
      .then((result: { data?: { items: ContentItem[] } }) => setContent(result.data?.items ?? []))
      .catch(() => setContent([]))
      .finally(() => setLoadingContent(false));

    fetch("/api/tutors?limit=4&filter=featured")
      .then((response) => response.json())
      .then((result: { data?: { items: TutorWithProfile[] } }) => setCreators(result.data?.items ?? []))
      .catch(() => setCreators([]))
      .finally(() => setLoadingCreators(false));
  }, []);

  function handleGetStarted() {
    if (isConnected) router.push("/learn");
    else setWalletOpen(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[radial-gradient(circle_at_1px_1px,rgba(26,71,49,0.08)_1px,transparent_0)] [background-size:24px_24px]">
        <NavBar />

        <FadeIn>
          <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex rounded-full bg-cream px-4 py-2 text-sm font-bold text-forest">
                🌍 Africa&apos;s #1 Kiswahili Platform
              </span>
              <h1 className="mt-6 font-serif text-4xl font-black leading-tight text-forest md:text-6xl">
                Master Kiswahili with Africa&apos;s Best Creators
              </h1>
              <p className="mt-6 max-w-xl text-lg text-foreground/70">
                Access premium lessons, books, and courses. Pay with crypto or card.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="h-14 rounded-full bg-gold px-8 text-base font-bold text-foreground hover:bg-[#e6ac00]"
                >
                  Start Learning Free
                </button>
                <Link
                  href="/publish"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-forest px-8 text-base font-bold text-forest hover:bg-forest hover:text-white"
                >
                  Become a Creator
                </Link>
              </div>
              <p className="mt-6 text-sm text-foreground/60">
                ✓ No subscription required &nbsp; ✓ Pay per content &nbsp; ✓ Crypto payments
              </p>
            </div>

            <div className="relative hidden h-[420px] lg:block">
              <div className="absolute inset-0 rounded-3xl bg-forest/5" />
              {previewCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.6 }}
                  className={`absolute w-64 rounded-2xl bg-forest p-5 text-cream shadow-lg ${
                    index === 0 ? "left-4 top-8" : "bottom-8 right-4"
                  }`}
                >
                  <div className={`mb-4 flex h-24 items-center justify-center rounded-xl ${contentCoverStyle(card.type)}`}>
                    <span className="text-3xl">{contentCoverEmoji(card.type)}</span>
                  </div>
                  <p className="font-bold">{card.title}</p>
                  <p className="mt-1 text-sm text-cream/70">by {card.creator}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>

        <section className="bg-cream py-12">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-4">
            {[
              { value: platformStats ? formatCount(platformStats.creators) : "—", label: "Creators" },
              { value: platformStats ? formatCount(platformStats.content) : "—", label: "Content Items" },
              { value: platformStats ? formatCount(platformStats.learners) : "—", label: "Learners" },
              { value: platformStats ? `${platformStats.rating}★` : "—", label: "Rating" },
            ].map((stat, index) => (
              <div key={stat.label} className={`text-center ${index > 0 ? "md:border-l md:border-forest/10" : ""}`}>
                {loadingStats ? (
                  <div className="mx-auto h-9 w-20 animate-pulse rounded bg-forest/10" />
                ) : (
                  <p className="font-serif text-3xl font-black text-gold">{stat.value}</p>
                )}
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-foreground/55">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-black text-forest">Why LughaPro</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-2xl">{feature.icon}</span>
                <h3 className="mt-4 font-serif text-xl font-bold text-forest">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-off-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-4xl font-black text-forest">Latest from Our Creators</h2>
              <Link href="/learn" className="text-sm font-bold text-jade hover:underline">
                View all
              </Link>
            </div>
            {loadingContent ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : content.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-bold text-forest">No content published yet — be the first creator!</p>
                <Link href="/publish" className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                  Publish Content
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex gap-6 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
                {content.map((item) => (
                  <div key={item.id} className="min-w-[280px] lg:min-w-0">
                    <ContentCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-4xl font-black text-forest">Meet Our Top Creators</h2>
              <Link href="/tutors" className="rounded-full border-2 border-forest px-5 py-2 text-sm font-bold text-forest hover:bg-forest hover:text-white">
                View All Creators
              </Link>
            </div>
            {loadingCreators ? (
              <div className="mt-8 h-40 animate-pulse rounded-2xl bg-cream" />
            ) : creators.length === 0 ? (
              <p className="mt-8 text-foreground/60">No creators yet. Check back soon.</p>
            ) : (
              <div className="mt-8 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
                {creators.map((tutor) => (
                  <div key={tutor.id} className="min-w-[240px] lg:min-w-0">
                    <CreatorCard tutor={tutor} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3 lg:px-8">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-4xl text-gold">&ldquo;</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-forest text-sm font-bold text-white">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-forest">{item.name}</p>
                    <p className="text-sm text-foreground/60">{item.country}</p>
                    <p className="text-sm text-gold">{"★".repeat(item.rating)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-forest py-16 text-cream">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <h2 className="font-serif text-4xl font-black">Ready to start learning Kiswahili?</h2>
            <p className="mt-4 text-cream/75">Join thousands of learners accessing premium African language content.</p>
            <button
              type="button"
              onClick={handleGetStarted}
              className="mt-8 rounded-full bg-gold px-8 py-4 text-lg font-bold text-foreground hover:bg-[#e6ac00]"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </div>

      <Footer />
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}
