"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { ContentCard } from "@/components/ui/ContentCard";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { initials } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { ContentItem, PlatformStats, TutorWithProfile } from "@/types";

const CATEGORIES = [
  {
    icon: "🗣️",
    name: "Language",
    slug: "language",
    description: "Learn African languages from native speakers — Kiswahili, Yoruba, Amharic, and more",
  },
  {
    icon: "🎵",
    name: "Music",
    slug: "music",
    description: "Traditional songs, instruments, and contemporary African sounds",
  },
  {
    icon: "🏺",
    name: "Arts & Crafts",
    slug: "arts",
    description: "Authentic handmade goods and digital art from African artisans",
  },
  {
    icon: "📖",
    name: "Literature",
    slug: "literature",
    description: "Books, poetry, and stories from African writers",
  },
  {
    icon: "🎬",
    name: "Video",
    slug: "video",
    description: "Documentaries, lessons, and cultural storytelling",
  },
  {
    icon: "✈️",
    name: "Experiences",
    slug: "experience",
    description: "Live virtual sessions and guided cultural journeys",
  },
];

const TESTIMONIALS = [
  {
    name: "Grace Mwangi",
    country: "Kenya",
    quote: "LughaPro feels like a real platform built for us. I bought two books and started learning immediately.",
    rating: 5,
  },
  {
    name: "Samuel Okello",
    country: "Uganda",
    quote: "The content library is excellent. Clear pricing, beautiful cards, and easy wallet sign-in.",
    rating: 5,
  },
  {
    name: "Asha Hassan",
    country: "Tanzania",
    quote: "Finally a marketplace that respects African learners and creators equally.",
    rating: 5,
  },
];

const FALLBACK_STATS = [
  { value: "10+", label: "Creators" },
  { value: "50+", label: "Content Items" },
  { value: "4.8★", label: "Avg Rating" },
  { value: "8", label: "Languages" },
];

const FEATURES = [
  { icon: "🗣️", title: "Language Learning", desc: "Kiswahili · Luganda · Yoruba · 31 more" },
  { icon: "🎙️", title: "Live Tutor Sessions", desc: "2,100+ native speakers · Book now" },
  { icon: "🏺", title: "Cultural Marketplace", desc: "Crafts · Textiles · Literature · Art" },
  { icon: "🥁", title: "Music & Folklore Hub", desc: "4,200 tracks · 1,800 folktales" },
  { icon: "🏅", title: "NFT Credentials", desc: "On-chain · CELO · Verifiable globally" },
  { icon: "🤝", title: "For Enterprises", desc: "Corporate training · UN agencies · API access" },
];

type CategoryCounts = Record<string, number>;

export function HomeClient() {
  const { isConnected, login } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [creators, setCreators] = useState<TutorWithProfile[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = new URLSearchParams(window.location.search).get("ref")?.toLowerCase();
    if (ref && isAddress(ref)) localStorage.setItem("lugha_referrer", ref);
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((result: { data?: PlatformStats }) => setPlatformStats(result.data ?? null))
      .catch(() => setPlatformStats(null))
      .finally(() => setLoadingStats(false));

    fetch("/api/content?limit=6")
      .then((r) => r.json())
      .then((result: { data?: { items: ContentItem[] } }) => setContent(result.data?.items ?? []))
      .catch(() => setContent([]))
      .finally(() => setLoadingContent(false));

    fetch("/api/tutors?limit=4&filter=featured")
      .then((r) => r.json())
      .then((result: { data?: { items: TutorWithProfile[] } }) => setCreators(result.data?.items ?? []))
      .catch(() => setCreators([]))
      .finally(() => setLoadingCreators(false));

    fetch("/api/stats/categories")
      .then((r) => r.json())
      .then((result: { data?: CategoryCounts }) => setCategoryCounts(result.data ?? {}))
      .catch(() => setCategoryCounts({}))
      .finally(() => setLoadingCategories(false));
  }, []);

  const stats = [
    { value: platformStats?.creators ? String(platformStats.creators) : FALLBACK_STATS[0].value, label: "Creators" },
    { value: platformStats?.content  ? String(platformStats.content)  : FALLBACK_STATS[1].value, label: "Content Items" },
    { value: platformStats?.rating   ? `${platformStats.rating}★`    : FALLBACK_STATS[2].value, label: "Avg Rating" },
    { value: platformStats?.learners ? String(platformStats.learners) : FALLBACK_STATS[3].value, label: "Learners" },
  ];

  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-[#171717] flex flex-col items-center justify-center overflow-hidden">
        {/* Navbar gradient helper — ensures nav links visible against dark hero */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#FFBF00]/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#1a4731]/30 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#FFBF00]/5 blur-[80px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-[#FFBF00] animate-pulse" />
            <span className="text-[#FFBF00] text-sm font-semibold">Powered by Celo Blockchain</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
            Learn.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBF00] to-[#e6ac00]">
              Discover.
            </span>
            {" "}Preserve.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Where Africa&apos;s languages, arts, music, and wisdom are alive — and open to the world.
          </p>

          <p className="mt-3 text-base text-white/40 max-w-xl mx-auto">
            Learn from native tutors. Discover authentic crafts. Stream traditional music. Every purchase supports African creators directly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/explore"
              className="rounded-full bg-[#FFBF00] px-8 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition-all hover:scale-105 shadow-lg shadow-[#FFBF00]/25"
            >
              Start Exploring ↗
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Browse Marketplace
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/30 text-sm">
            <span>✓ Pay with cUSD, CELO, or USDT</span>
            <span className="hidden md:block">·</span>
            <span>✓ Creator royalties on-chain</span>
            <span className="hidden md:block">·</span>
            <span>✓ Blockchain-verified certificates</span>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8f4ef" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#f8f4ef] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                {loadingStats ? (
                  <div className="mx-auto h-14 w-28 animate-pulse rounded bg-gray-200" />
                ) : (
                  <div className="font-serif text-5xl md:text-6xl font-black text-[#1a4731]">{stat.value}</div>
                )}
                <div className="mt-2 text-sm font-semibold uppercase tracking-widest text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-[#171717]">Everything African Culture</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">One platform. Every form of African expression.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-[#FFBF00] hover:shadow-xl hover:shadow-[#FFBF00]/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFBF00]/0 to-[#FFBF00]/0 group-hover:from-[#FFBF00]/5 group-hover:to-transparent transition-all duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <h3 className="font-bold text-[#1a4731] text-xl">{cat.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{cat.description}</p>
                  <div className="mt-4 text-sm font-bold text-[#FFBF00]">
                    {loadingCategories ? (
                      <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
                    ) : (categoryCounts[cat.slug] ?? 0) > 0 ? (
                      `${categoryCounts[cat.slug]} item${categoryCounts[cat.slug] === 1 ? "" : "s"}`
                    ) : (
                      "Be the first to publish"
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST CONTENT ── */}
      <section className="bg-[#f8f4ef] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <h2 className="font-serif text-4xl font-black text-[#171717]">Latest from Our Creators</h2>
            <Link href="/explore" className="text-sm font-bold text-[#1a4731] hover:underline">
              View All →
            </Link>
          </div>
          {loadingContent ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : content.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <p className="font-bold text-[#171717]">No content published yet — be the first creator!</p>
              <Link href="/publish" className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
                Publish Content
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CREATOR SPOTLIGHT ── */}
      <section className="relative bg-[#171717] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#1a4731]/40 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFBF00]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-white">Meet Our Creators</h2>
            <p className="mt-4 text-lg text-white/50">Verified African creators earning royalties on every sale.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCreators
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/10" />
                ))
              : creators.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/tutor/${creator.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all hover:border-[#FFBF00]/40 hover:bg-white/10"
                  >
                    <div className="h-14 w-14 rounded-full bg-[#FFBF00] flex items-center justify-center font-black text-[#171717] text-xl mb-4">
                      {initials(creator.profile?.full_name ?? "C")}
                    </div>
                    <div className="font-bold text-white">{creator.profile?.full_name ?? "Creator"}</div>
                    <div className="text-sm text-white/50 mt-1">{creator.specialty ?? "African Content"}</div>
                    {creator.rating > 0 && (
                      <div className="mt-3 text-xs font-semibold text-[#FFBF00]">★ {creator.rating.toFixed(1)}</div>
                    )}
                    <div className="mt-3 text-xs font-bold text-[#FFBF00]/70 group-hover:text-[#FFBF00] transition-colors">View Profile →</div>
                  </Link>
                ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/creators"
              className="inline-flex rounded-full border border-[#FFBF00]/40 px-8 py-3 font-semibold text-[#FFBF00] hover:bg-[#FFBF00] hover:text-[#171717] transition-all"
            >
              Find All Creators →
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,0 C480,80 960,0 1440,60 L1440,80 L0,80 Z" fill="#fdf6e3" />
          </svg>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="bg-[#fdf6e3] py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-[#171717]">Africa&apos;s Mother Tongue Platform</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">One platform. Every form of African expression.</p>
          </div>

          {/* Mission + Vision */}
          <div className="mb-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 border-l-4 border-[#FFBF00]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-[#FFBF00]/20 flex items-center justify-center text-lg">🎯</div>
                <h3 className="font-serif text-2xl font-black text-[#1a4731]">Our Mission</h3>
              </div>
              <p className="leading-relaxed text-[#171717]/70">
                Making Africa&apos;s cultural heritage accessible and affordable — because Africa&apos;s languages, arts, music, and wisdom deserve to be alive and open to the world. We put verified creators, cultural authenticity, and fair pay at the heart of every lesson, every track, every craft, and every credential we deliver.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 border-l-4 border-[#1a4731]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-[#1a4731]/10 flex items-center justify-center text-lg">🌍</div>
                <h3 className="font-serif text-2xl font-black text-[#1a4731]">Our Vision</h3>
              </div>
              <p className="leading-relaxed text-[#171717]/70">
                An Africa where every learner accesses world-class native language education on their terms — through live native tutors, AI-powered practice, a thriving cultural marketplace, and blockchain-verified credentials that open doors globally. A future where every creator is rewarded for the heritage they share, and African culture is not just preserved — but celebrated, streamed, sold, and studied worldwide.
              </p>
            </div>
          </div>

          {/* Features grid */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-[#FFBF00] hover:shadow-lg hover:shadow-[#FFBF00]/10 hover:-translate-y-0.5"
              >
                <div className="h-10 w-10 rounded-full bg-[#f8f4ef] flex items-center justify-center mb-3 text-xl">{f.icon}</div>
                <h4 className="mb-1 font-bold text-[#171717]">{f.title}</h4>
                <p className="text-sm text-[#171717]/60">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* For Learners / Creators / Enterprises */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-[#1a4731] p-6 text-white">
              <h4 className="mb-3 font-serif text-xl font-black">For Learners</h4>
              <p className="text-sm leading-relaxed text-white/70">
                Live native tutors, AI coaching, offline downloads, and verified credentials — in one culturally grounded platform.
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFBF00] p-6 text-[#171717]">
              <h4 className="mb-3 font-serif text-xl font-black">For Creators</h4>
              <p className="text-sm leading-relaxed text-[#171717]/70">
                Keep 85% of every sale. Reach 80,000+ learners. Get paid fairly — in cUSD — for your heritage.
              </p>
            </div>
            <div className="rounded-2xl bg-[#171717] p-6 text-white">
              <h4 className="mb-3 font-serif text-xl font-black">For Enterprises</h4>
              <p className="text-sm leading-relaxed text-white/70">
                Corporate language training for multinationals, UN agencies &amp; governments. Custom credentials, SDG reporting, API access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-black text-[#171717] text-center mb-12">What learners say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-[#FFBF00] hover:shadow-lg hover:shadow-[#FFBF00]/10">
                <p className="text-5xl font-black leading-none text-[#FFBF00]">&ldquo;</p>
                <p className="mt-2 leading-relaxed text-gray-600">{item.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a4731] text-sm font-bold text-white flex-shrink-0">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#171717]">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.country}</p>
                    <p className="text-sm text-[#FFBF00]">{"★".repeat(item.rating)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative bg-[#1a4731] py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFBF00]/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFBF00]/5 blur-[60px]" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="font-serif text-4xl md:text-6xl font-black text-white max-w-3xl mx-auto leading-tight">
            Africa&apos;s culture deserves to be heard.
          </h2>
          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
            Join thousands of creators and learners on LughaPro.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isConnected ? (
              <Link
                href="/explore"
                className="rounded-full bg-[#FFBF00] px-10 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition-all hover:scale-105"
              >
                Get Started ↗
              </Link>
            ) : (
              <button
                type="button"
                onClick={login}
                className="rounded-full bg-[#FFBF00] px-10 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition-all hover:scale-105"
              >
                Get Started ↗
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
