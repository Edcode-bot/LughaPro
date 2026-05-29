"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { countryFlag, initials } from "@/lib/content";
import { TutorWithProfile } from "@/types";
import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";

const filters = [
  { label: "All", value: "" },
  { label: "Online", value: "online" },
  { label: "cUSD Accepted", value: "cusd" },
  { label: "Top Rated", value: "top_rated" },
];

export function TutorsClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [tutors, setTutors] = useState<TutorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "24" });
    if (query) params.set("search", query);
    if (filter) params.set("filter", filter);

    fetch(`/api/tutors?${params.toString()}`)
      .then((response) => response.json())
      .then((result: { data?: { items: TutorWithProfile[] } }) => setTutors(result.data?.items ?? []))
      .catch(() => setTutors([]))
      .finally(() => setLoading(false));
  }, [query, filter]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <FadeIn className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">Find Your Kiswahili Teacher</h1>
          <form onSubmit={submit} className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creators by name or specialty..."
              className="h-14 w-full rounded-full border border-forest/10 bg-white pl-12 pr-4 outline-none ring-gold/30 focus:ring-4"
            />
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === item.value ? "bg-gold text-foreground" : "border border-forest/15 bg-white text-forest"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-bold text-forest">No creators yet — be the first to join!</p>
              <Link href="/publish" className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                Become a Creator
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {tutors.map((tutor) => (
                <CreatorListCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )}
        </FadeIn>
        <Footer />
      </main>
    </ErrorBoundary>
  );
}

function CreatorListCard({ tutor }: { tutor: TutorWithProfile & { content_count?: number } }) {
  const name = tutor.profile?.full_name ?? "Creator";
  const country = tutor.profile?.country ?? tutor.location ?? "East Africa";
  const avatar = tutor.profile?.avatar_url;
  const wallet = tutor.profile?.wallet_address;
  const specialties: string[] = Array.isArray(tutor.specialty)
    ? tutor.specialty
    : typeof tutor.specialty === "string" && tutor.specialty
      ? [tutor.specialty]
      : [];
  const topCreator = Number(tutor.rating) >= 4.8;
  const contentCount = tutor.content_count ?? 0;

  return (
    <article className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:flex-row md:items-center">
      <div className="relative shrink-0">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-forest text-2xl font-bold text-white">
            {initials(name)}
          </div>
        )}
        {tutor.is_online ? <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-gold" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-2xl font-bold text-forest">{name}</h2>
          {tutor.is_verified ? <span className="text-xs font-bold text-jade">✓ Verified Creator</span> : null}
          {topCreator ? <span className="text-xs font-bold text-gold">★ Top Creator</span> : null}
        </div>
        <p className="mt-1 text-sm text-foreground/60">{countryFlag(country)} {country}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {specialties.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full bg-off-white px-3 py-1 text-xs font-semibold text-forest">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <StarRating rating={Number(tutor.rating ?? 0)} size={14} />
          <span className="text-sm text-foreground/55">{contentCount} published item{contentCount === 1 ? '' : 's'}</span>
          {wallet ? <span className="font-mono text-xs text-foreground/45">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span> : null}
        </div>
        <div className="mt-2 flex gap-2 text-xs font-semibold text-foreground/55">
          {tutor.accepts_cusd ? <span>cUSD</span> : null}
          {tutor.accepts_celo ? <span>CELO</span> : null}
          {tutor.accepts_fiat ? <span>Card</span> : null}
        </div>
      </div>
      <Link href={`/tutor/${tutor.id}`} className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gold px-6 font-bold text-foreground hover:bg-[#e6ac00]">
        View Profile
      </Link>
    </article>
  );
}
