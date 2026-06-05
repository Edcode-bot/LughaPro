"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { ContentCard } from "@/components/ui/ContentCard";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { initials } from "@/lib/content";
import { formatCount } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { ContentItem, PlatformStats, TutorWithProfile } from "@/types";

const MARQUEE_ITEMS = [
  "🗣️ Language",
  "🎵 Music",
  "🏺 Arts & Crafts",
  "📖 Literature",
  "🎬 Video",
  "✈️ Experiences",
  "🥁 Instruments",
  "🌍 Culture",
  "🎨 Visual Arts",
  "🎤 Spoken Word",
];

const CATEGORIES = [
  {
    icon: "🗣️",
    name: "Language",
    slug: "language",
    desc: "Learn Kiswahili and other African languages from native speakers",
  },
  {
    icon: "🎵",
    name: "Music",
    slug: "music",
    desc: "Traditional songs, instruments, and contemporary African sounds",
  },
  {
    icon: "🏺",
    name: "Arts & Crafts",
    slug: "arts",
    desc: "Authentic handmade goods and digital art from African artisans",
  },
  {
    icon: "📖",
    name: "Literature",
    slug: "literature",
    desc: "Books, poetry, and stories from African writers",
  },
  {
    icon: "🎬",
    name: "Video",
    slug: "video",
    desc: "Documentaries, lessons, and cultural storytelling",
  },
  {
    icon: "✈️",
    name: "Experiences",
    slug: "experience",
    desc: "Live virtual sessions and guided cultural journeys",
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

type CategoryCounts = Record<string, number>;

export function HomeClient() {
  const { isConnected } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [creators, setCreators] = useState<TutorWithProfile[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({});

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
      .catch(() => setCategoryCounts({}));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#171717] px-4 text-center">
        <div className="relative z-10 flex max-w-4xl flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/60">
            🌍 Africa&apos;s cultural content platform
          </span>
          <h1 className="font-serif text-6xl font-black leading-none tracking-tight text-white md:text-8xl">
            Learn. Discover.<br />Preserve.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/60 md:text-2xl">
            Where Africa&apos;s languages, arts, music, and wisdom are alive — and open to the world.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="rounded-full bg-[#FFBF00] px-8 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition"
            >
              Start Exploring
            </Link>
            <Link
              href="/publish"
              className="rounded-full border border-white/30 px-8 py-4 text-lg font-semibold text-white hover:border-white/60 transition"
            >
              Become a Creator
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/40">
            ✓ Pay with cUSD &nbsp;·&nbsp; ✓ Creator royalties on-chain &nbsp;·&nbsp; ✓ Powered by Celo
          </p>
        </div>

        {/* Marquee strip */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/10 py-4">
          <div className="flex w-max animate-marquee gap-6">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-t border-gray-100 bg-white py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4 lg:px-8">
          {[
            { value: platformStats ? formatCount(platformStats.creators) : "—", label: "Creators" },
            { value: platformStats ? formatCount(platformStats.content) : "—", label: "Content Items" },
            { value: platformStats ? formatCount(platformStats.learners) : "—", label: "Learners" },
            { value: platformStats ? `${platformStats.rating}★` : "—", label: "Avg Rating" },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center ${i > 0 ? "md:border-l md:border-gray-100" : ""}`}>
              {loadingStats ? (
                <div className="mx-auto h-12 w-24 animate-pulse rounded bg-gray-100" />
              ) : (
                <p className="font-serif text-5xl font-black text-[#1a4731]">{stat.value}</p>
              )}
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-[#f8f4ef] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-black text-[#171717]">Everything African Culture</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            One platform. Every form of African expression.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                className="group rounded-2xl border border-gray-100 bg-white p-8 transition hover:-translate-y-1 hover:border-[#FFBF00] hover:shadow-sm"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="mt-3 text-xl font-bold text-[#1a4731]">{cat.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{cat.desc}</p>
                {categoryCounts[cat.slug] !== undefined ? (
                  <p className="mt-4 text-sm font-bold text-[#FFBF00]">
                    {categoryCounts[cat.slug]} items
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST CONTENT ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl font-black text-[#171717]">Latest from Our Creators</h2>
            <Link href="/explore" className="text-sm font-bold text-[#1a4731] hover:underline">
              View All Content →
            </Link>
          </div>
          {loadingContent ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : content.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <p className="font-bold text-[#171717]">No content published yet — be the first creator!</p>
              <Link href="/publish" className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-bold text-[#171717]">
                Publish Content
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CREATOR SPOTLIGHT ── */}
      <section className="bg-[#171717] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-black text-white">Meet Our Creators</h2>
          <p className="mt-3 text-white/60">
            Verified African creators earning royalties on every sale.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loadingCreators
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/10" />
                ))
              : creators.map((tutor) => (
                  <Link
                    key={tutor.id}
                    href={`/tutor/${tutor.id}`}
                    className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 hover:border-[#FFBF00] transition"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBF00] font-black text-[#171717]">
                      {initials(tutor.profile?.full_name ?? "C")}
                    </div>
                    <div>
                      <p className="font-bold text-white">{tutor.profile?.full_name ?? "Creator"}</p>
                      <p className="mt-0.5 text-sm text-white/50">{tutor.specialty ?? "African Content"}</p>
                    </div>
                    <p className="text-sm font-bold text-[#FFBF00]">View Profile →</p>
                  </Link>
                ))}
          </div>
          <div className="mt-8">
            <Link
              href="/creators"
              className="inline-flex rounded-full bg-[#FFBF00] px-8 py-3 font-bold text-[#171717] hover:bg-[#e6ac00] transition"
            >
              Find All Creators
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#fdf6e3] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-black text-[#171717]">What learners say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="rounded-2xl bg-white p-6">
                <p className="text-6xl font-black leading-none text-[#FFBF00]">&ldquo;</p>
                <p className="mt-2 leading-relaxed text-gray-600">{item.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a4731] text-sm font-bold text-white">
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
      <section className="bg-[#1a4731] py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-serif text-5xl font-black text-white">
            Africa&apos;s culture deserves to be heard.
          </h2>
          <p className="mt-4 text-xl text-white/70">
            Join thousands of creators and learners on LughaPro.
          </p>
          {isConnected ? (
            <Link
              href="/explore"
              className="mt-8 inline-flex rounded-full bg-[#FFBF00] px-8 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition"
            >
              Get Started
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="mt-8 inline-flex rounded-full bg-[#FFBF00] px-8 py-4 text-lg font-black text-[#171717] hover:bg-[#e6ac00] transition"
            >
              Get Started
            </button>
          )}
        </div>
      </section>

      <Footer />
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}
