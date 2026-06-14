"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { initials, countryFlag } from "@/lib/content";
import { TutorWithProfile } from "@/types";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Online", value: "online" },
  { label: "cUSD Accepted", value: "cusd" },
  { label: "Top Rated", value: "top_rated" },
];

export default function CreatorsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [creators, setCreators] = useState<TutorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ limit: "24" });
    if (query) p.set("search", query);
    if (filter) p.set("filter", filter);
    fetch(`/api/tutors?${p.toString()}`)
      .then((r) => r.json())
      .then((result: { data?: { items: TutorWithProfile[] } }) => setCreators(result.data?.items ?? []))
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, [query, filter]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      {/* Hero */}
      <section className="relative bg-[#171717] pt-16 pb-20 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#FFBF00]/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-[#1a4731]/30 blur-[100px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#FFBF00] animate-pulse" />
            <span className="text-[#FFBF00] text-sm font-semibold">Verified African Creators</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-black text-white">Africa&apos;s Creators</h1>
          <p className="mt-4 max-w-xl text-white/60 text-lg">
            Educators, musicians, artists, and storytellers sharing their culture with the world.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Search */}
        <form onSubmit={onSubmit} className="relative mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators by name or specialty…"
            className="h-14 w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-[#FFBF00] focus:ring-2 focus:ring-[#FFBF00]/30"
          />
        </form>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === f.value
                  ? "border-[#FFBF00] bg-[#FFBF00] text-[#171717]"
                  : "border-gray-200 text-gray-500 hover:border-[#171717]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
              ))
            : creators.map((creator) => (
                <article
                  key={creator.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-[#FFBF00] hover:shadow-xl hover:shadow-[#FFBF00]/10 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#1a4731] text-lg font-black text-white">
                      {initials(creator.profile?.full_name ?? "C")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#171717] truncate">{creator.profile?.full_name ?? "Creator"}</p>
                      <p className="text-sm text-gray-500">
                        {countryFlag(creator.profile?.country)} {creator.profile?.country ?? "Africa"}
                      </p>
                      {creator.specialty ? (
                        <span className="mt-1 inline-block rounded-full bg-[#f8f4ef] px-2.5 py-0.5 text-xs font-semibold text-[#1a4731]">
                          {creator.specialty}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex gap-3">
                      {creator.accepts_cusd ? (
                        <span className="rounded-full border border-[#FFBF00]/40 px-2 py-0.5 font-semibold text-[#1a4731]">
                          cUSD
                        </span>
                      ) : null}
                      {creator.rating > 0 ? (
                        <span className="text-[#FFBF00] font-bold">★ {creator.rating.toFixed(1)}</span>
                      ) : null}
                    </span>
                    <Link
                      href={`/tutor/${creator.id}`}
                      className="font-bold text-[#FFBF00] hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </article>
              ))}
        </div>

        {!loading && creators.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-bold text-[#171717]">
              {query || filter ? 'No creators match your search.' : 'No creators yet — be the first!'}
            </p>
            {!query && !filter ? (
              <a
                href="/publish"
                className="mt-4 inline-flex rounded-full bg-[#FFBF00] px-6 py-3 font-black text-[#171717]"
              >
                Become a Creator
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}
