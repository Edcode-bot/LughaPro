"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Tutor, TutorCard } from "@/components/ui/TutorCard";
import { TutorWithProfile } from "@/types";

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-off-white"><NavBar /><section className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="h-96 animate-pulse rounded-3xl bg-cream" /></section></main>}>
      <SearchClient />
    </Suspense>
  );
}

type TutorsApi = { data: { items: TutorWithProfile[]; total: number } | null; error: string | null };

function toCardTutor(tutor: TutorWithProfile): Tutor {
  return {
    id: tutor.id,
    name: tutor.profile.full_name,
    location: tutor.location ?? "East Africa",
    rating: Number(tutor.rating ?? 0),
    price: Number(tutor.hourly_rate ?? 0),
    languages: tutor.languages ?? ["Kiswahili"],
    payments: [tutor.accepts_cusd ? "cUSD" : null, tutor.accepts_celo ? "CELO" : null, tutor.accepts_fiat ? "Fiat" : null].filter(Boolean) as Tutor["payments"],
    online: Boolean(tutor.is_online),
    bio: tutor.bio ?? tutor.specialty ?? "Premium Kiswahili tutor.",
    image: tutor.profile.avatar_url ?? undefined,
    topTutor: Number(tutor.rating ?? 0) >= 4.7,
  };
}

function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const filter = searchParams.get("filter") ?? "";
  const [query, setQuery] = useState(q);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (filter && filter !== "under_15") params.set("filter", filter);
    if (filter === "under_15") params.set("max_price", "15");
    params.set("limit", "24");
    return params.toString();
  }, [q, filter]);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/tutors?${apiQuery}`)
      .then((response) => response.json() as Promise<TutorsApi>)
      .then((result) => {
        if (!active) return;
        if (result.error) {
          setError("Could not load tutors. Try refreshing.");
          setTutors([]);
          return;
        }
        setTutors((result.data?.items ?? []).map(toCardTutor));
        setTotal(result.data?.total ?? 0);
      })
      .catch(() => active && setError("Could not load tutors. Try refreshing."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiQuery]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl(query, filter);
  }

  function updateUrl(nextQ: string, nextFilter: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextFilter) params.set("filter", nextFilter);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-off-white text-forest">
      <NavBar />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <h1 className="font-serif text-5xl font-black">Find your perfect Kiswahili tutor</h1>
        <p className="mt-3 max-w-2xl text-forest/65">Filter by price, rating, availability, and payment method.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-black">Filters</h2><div className="mt-5 grid gap-3 text-sm font-semibold text-forest/70">{[["", "All tutors"], ["online", "Online now"], ["cusd", "cUSD accepted"], ["top_rated", "Top rated"], ["under_15", "Under $15/hr"]].map(([value, label]) => <button key={value} onClick={() => updateUrl(q, value)} className={`rounded-2xl border p-3 text-left transition ${filter === value ? "border-gold bg-gold/15 text-forest" : "border-forest/10 hover:border-jade"}`}>{label}</button>)}</div></aside>
          <section><form onSubmit={submit} className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-full border border-forest/10 bg-white pl-12 pr-5 outline-none ring-gold/30 focus:ring-4" placeholder="Search by tutor, specialty, or location" /></form><p className="mt-5 text-sm font-bold text-forest/60">Showing {tutors.length} of {total} tutors</p>{error ? <div className="mt-5 rounded-3xl bg-white p-8 text-center font-bold text-red-700 shadow-sm">{error}</div> : null}<div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) : tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)}</div>{!loading && !error && tutors.length === 0 ? <div className="mt-5 rounded-3xl bg-white p-8 text-center shadow-sm"><p className="text-5xl">🌍</p><h2 className="mt-4 font-serif text-3xl font-black">No tutors found for your search</h2><p className="mt-2 text-forest/65">Try a different keyword or filter.</p></div> : null}</section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
