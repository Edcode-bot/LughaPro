"use client";

import { BookOpen, CreditCard, Gift, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { Tutor, TutorCard } from "@/components/ui/TutorCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { isMiniPay } from "@/lib/minipay";
import { TutorWithProfile } from "@/types";

const filters = [{ label: "All", value: "" }, { label: "Online Now", value: "online" }, { label: "cUSD Accepted", value: "cusd" }, { label: "Top Rated", value: "top_rated" }, { label: "Under $15/hr", value: "under_15" }];
const stats = ["500+ Tutors", "12,000+ Students", "4.9★ Average Rating"];
const plans = [
  { name: "Starter", price: "Free", perks: ["Browse tutors", "Community lessons", "Wallet-ready profile"] },
  { name: "Explorer", price: "$19/mo", perks: ["2 premium lessons", "Priority booking", "Progress tracking"] },
  { name: "Pro", price: "$49/mo", perks: ["6 premium lessons", "Certificate paths", "Concierge matching"] },
];

type TutorsApi = { data: { items: TutorWithProfile[] } | null; error: string | null };

const fallbackTutors: Tutor[] = [
  { id: "1", name: "Amina Nyerere", location: "Dar es Salaam", rating: 4.9, price: 15, languages: ["Kiswahili"], online: true, payments: ["cUSD", "Fiat"], bio: "Native Kiswahili speaker with 5 years teaching experience", topTutor: true },
  { id: "2", name: "Baraka Omondi", location: "Nairobi", rating: 4.8, price: 12, languages: ["Kiswahili", "English"], online: true, payments: ["cUSD", "Fiat"], bio: "Certified language instructor specializing in conversational Kiswahili", topTutor: true },
  { id: "3", name: "Zawadi Kimani", location: "Mombasa", rating: 4.7, price: 18, languages: ["Kiswahili"], online: false, payments: ["Fiat"], bio: "Academic Kiswahili tutor with university-level teaching experience", topTutor: true },
  { id: "4", name: "Jabari Mwangi", location: "Kampala", rating: 4.9, price: 20, languages: ["Kiswahili", "Luganda"], online: true, payments: ["cUSD", "Fiat"], bio: "East African language expert, helps learners reach fluency fast", topTutor: true },
  { id: "5", name: "Fatuma Hassan", location: "Zanzibar", rating: 5.0, price: 22, languages: ["Kiswahili"], online: true, payments: ["cUSD", "Fiat"], bio: "Zanzibar-born native speaker. Coastal dialect specialist", topTutor: true },
  { id: "6", name: "Tendai Mutasa", location: "Nairobi", rating: 4.6, price: 10, languages: ["Kiswahili", "Sheng"], online: false, payments: ["Fiat"], bio: "Young dynamic tutor focused on modern spoken Kiswahili" },
];

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

export function HomeClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [showingFallback, setShowingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [miniPay] = useState(() => isMiniPay());

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/tutors?limit=6")
      .then((response) => response.json() as Promise<TutorsApi>)
      .then((result) => {
        if (!active) return;
        if (result.error) {
          setError("Could not load tutors. Try refreshing.");
          return;
        }
        const items = (result.data?.items ?? []).map(toCardTutor);
        setShowingFallback(items.length === 0);
        setTutors(items.length > 0 ? items : fallbackTutors);
      })
      .catch(() => {
        if (!active) return;
        setShowingFallback(true);
        setTutors(fallbackTutors);
        setError("Could not load live tutors. Showing sample tutors.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function selectFilter(value: string) {
    const params = new URLSearchParams();
    if (value) params.set("filter", value);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <FadeIn>
        <section className="african-pattern relative overflow-hidden bg-gradient-to-br from-forest via-jade to-forest text-cream">
          <div className="absolute right-8 top-28 hidden rounded-full border border-gold/30 bg-cream/10 px-5 py-3 text-sm font-bold text-gold shadow-2xl backdrop-blur md:block">Now accepting cUSD & CELO payments</div>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-32">
            <div><Badge tone="cusd" className="mb-6">Premium Kiswahili marketplace</Badge><h1 className="max-w-4xl font-serif text-5xl font-black leading-tight tracking-tight md:text-7xl">Learn Kiswahili from Africa&apos;s Best Tutors</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-cream/82 md:text-xl">Pay with crypto or card. Book in minutes. Learn from anywhere.</p><div className="mt-9 flex flex-col gap-4 sm:flex-row"><Link href="/search"><Button size="lg">Find a Tutor</Button></Link><Link href="/auth/register?role=tutor"><Button size="lg" variant="ghost">Become a Tutor</Button></Link></div></div>
            <Card className="bg-cream/95 p-5"><div className="rounded-2xl bg-white p-6"><div className="flex items-center gap-4"><Avatar name="Amina Nyerere" online size="xl" /><div><p className="font-serif text-3xl font-black text-forest">Amina Nyerere</p><p className="text-forest/65">Top tutor · Dar es Salaam</p></div></div><div className="mt-6 grid grid-cols-3 gap-3">{["Kiswahili", "cUSD", "4.9★"].map((item) => <div key={item} className="rounded-2xl bg-off-white p-4 text-center font-bold text-forest">{item}</div>)}</div></div></Card>
          </div>
        </section>
      </FadeIn>
      <section className="bg-cream py-8"><div className="mx-auto grid max-w-5xl gap-4 px-5 text-center md:grid-cols-3">{stats.map((stat) => <div key={stat} className="text-2xl font-black text-jade">{stat}</div>)}</div></section>
      <section id="tutors" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-bold uppercase tracking-[0.25em] text-gold">Marketplace</p><h2 className="mt-3 font-serif text-4xl font-black text-forest md:text-5xl">Featured Tutors</h2>{miniPay ? <p className="mt-3 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-black text-forest">Pay with MiniPay</p> : null}</div><form onSubmit={submitSearch} className="relative w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-13 w-full rounded-full border border-forest/10 bg-white pl-12 pr-5 text-forest outline-none ring-gold/30 transition focus:ring-4" placeholder="Search by name, specialty, price..." /></form></div><div className="mt-8 flex gap-3 overflow-x-auto pb-2 md:flex-wrap">{filters.map((item) => <button key={item.label} onClick={() => selectFilter(item.value)} className="shrink-0 py-2"><Badge>{item.label}</Badge></button>)}</div>{showingFallback ? <div className="mt-8 rounded-3xl bg-gold/20 p-5 text-center font-bold text-forest">Showing sample tutors — be the first to join!</div> : null}{error ? <div className="mt-8 rounded-3xl bg-white p-8 text-center text-forest shadow-sm"><p className="font-bold text-red-700">{error}</p></div> : null}<div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) : tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} href={showingFallback ? "/search" : undefined} />)}</div></section>
      {!miniPay ? <div className="fixed inset-x-4 bottom-4 z-50 rounded-full bg-forest p-3 text-center text-sm font-black text-cream shadow-luxury md:hidden">Connect MiniPay to start learning</div> : null}
      <section id="how-it-works" className="bg-forest py-20 text-cream"><div className="mx-auto max-w-7xl px-5 lg:px-8"><h2 className="text-center font-serif text-4xl font-black md:text-5xl">How it Works</h2><div className="relative mt-12 grid gap-6 md:grid-cols-3"><div className="absolute left-1/4 right-1/4 top-12 hidden h-px bg-gold/40 md:block" />{[[Search, "Find Your Tutor", "Filter by style, budget, ratings, and payment method."], [CreditCard, "Book & Pay", "Use cUSD, CELO, or card with transparent pricing."], [BookOpen, "Start Learning", "Join your session and track fluency progress."]].map(([Icon, title, text]) => <Card key={String(title)} className="relative bg-cream text-forest"><Icon className="h-10 w-10 text-gold" /><h3 className="mt-5 text-xl font-black">{title as string}</h3><p className="mt-3 text-forest/70">{text as string}</p></Card>)}</div></div></section>
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><h2 className="text-center font-serif text-4xl font-black text-forest md:text-5xl">Pricing Plans</h2><div className="mt-12 grid gap-6 md:grid-cols-3">{plans.map((plan, index) => <Card key={plan.name} cream={index === 1} className={index === 1 ? "border-gold ring-4 ring-gold/20" : ""}>{index === 1 ? <Badge tone="top">Most Popular</Badge> : null}<h3 className="mt-5 text-2xl font-black text-forest">{plan.name}</h3><p className="mt-4 font-serif text-5xl font-black text-jade">{plan.price}</p><div className="mt-6 grid gap-3">{plan.perks.map((perk) => <p key={perk} className="flex items-center gap-2 text-forest/75"><ShieldCheck className="h-4 w-4 text-mint" />{perk}</p>)}</div><p className="mt-6 rounded-2xl bg-gold/15 p-3 text-sm font-bold text-forest">Pay with cUSD and save 10%</p></Card>)}</div></section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="rounded-3xl bg-gold p-8 text-forest shadow-luxury md:flex md:items-center md:justify-between"><div><Gift className="h-10 w-10" /><h2 className="mt-4 font-serif text-3xl font-black">Refer a friend, earn 5 cUSD on-chain</h2></div><Button className="mt-6 bg-forest text-cream hover:bg-jade md:mt-0">Get Referral Link</Button></div></section>
      <Footer />
    </main>
  );
}

