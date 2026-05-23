"use client";

import { BookOpen, CreditCard, Search, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Tutor, TutorCard } from "@/components/ui/TutorCard";
import { TutorWithProfile } from "@/types";

const filters = [
  { label: "All", value: "" },
  { label: "Online Now", value: "online" },
  { label: "cUSD Accepted", value: "cusd" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Under $15/hr", value: "under_15" },
];

const stats = [
  { value: "500+", label: "Tutors" },
  { value: "12,000+", label: "Students" },
  { value: "4.9★", label: "Average Rating" },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    perks: ["Browse tutors", "Community lessons", "Wallet-ready profile"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Explorer",
    price: "$19/mo",
    perks: ["2 premium lessons", "Priority booking", "Progress tracking"],
    cta: "Start Exploring",
    featured: true,
  },
  {
    name: "Pro",
    price: "$49/mo",
    perks: ["6 premium lessons", "Certificate paths", "Concierge matching"],
    cta: "Go Pro",
    featured: false,
  },
];

const steps = [
  {
    number: "1",
    icon: Search,
    title: "Find Your Tutor",
    text: "Filter by style, budget, ratings, and payment method.",
  },
  {
    number: "2",
    icon: CreditCard,
    title: "Book & Pay",
    text: "Reserve a session in minutes with transparent pricing.",
  },
  {
    number: "3",
    icon: BookOpen,
    title: "Start Learning",
    text: "Join live sessions and track your fluency progress.",
  },
];

const testimonials = [
  {
    name: "Grace Mwangi",
    country: "Kenya",
    quote: "LughaPro made it easy to find a tutor who understood my goals. Booking took minutes.",
    initials: "GM",
  },
  {
    name: "Samuel Okello",
    country: "Uganda",
    quote: "The tutors are professional and patient. My Kiswahili confidence has grown fast.",
    initials: "SO",
  },
  {
    name: "Asha Hassan",
    country: "Tanzania",
    quote: "Finally a platform built for African learners. Clean, simple, and trustworthy.",
    initials: "AH",
  },
];

type TutorsApi = { data: { items: TutorWithProfile[] } | null; error: string | null };

const fallbackTutors: Tutor[] = [
  { id: "1", name: "Amina Nyerere", location: "Dar es Salaam", rating: 4.9, price: 15, languages: ["Kiswahili"], online: true, payments: ["cUSD", "Card"], bio: "Native Kiswahili speaker with 5 years teaching experience", topTutor: true },
  { id: "2", name: "Baraka Omondi", location: "Nairobi", rating: 4.8, price: 12, languages: ["Kiswahili", "English"], online: true, payments: ["cUSD", "CELO", "Card"], bio: "Certified language instructor specializing in conversational Kiswahili", topTutor: true },
  { id: "3", name: "Zawadi Kimani", location: "Mombasa", rating: 4.7, price: 18, languages: ["Kiswahili"], online: false, payments: ["Card"], bio: "Academic Kiswahili tutor with university-level teaching experience", topTutor: true },
  { id: "4", name: "Jabari Mwangi", location: "Kampala", rating: 4.9, price: 20, languages: ["Kiswahili", "Luganda"], online: true, payments: ["cUSD", "CELO", "Card"], bio: "East African language expert, helps learners reach fluency fast", topTutor: true },
  { id: "5", name: "Fatuma Hassan", location: "Zanzibar", rating: 5.0, price: 22, languages: ["Kiswahili"], online: true, payments: ["cUSD", "Card"], bio: "Zanzibar-born native speaker. Coastal dialect specialist", topTutor: true },
  { id: "6", name: "Tendai Mutasa", location: "Nairobi", rating: 4.6, price: 10, languages: ["Kiswahili", "Sheng"], online: false, payments: ["Card"], bio: "Young dynamic tutor focused on modern spoken Kiswahili" },
];

function toCardTutor(tutor: TutorWithProfile): Tutor {
  return {
    id: tutor.id,
    name: tutor.profile.full_name,
    location: tutor.location ?? "East Africa",
    rating: Number(tutor.rating ?? 0),
    price: Number(tutor.hourly_rate ?? 0),
    languages: tutor.languages ?? ["Kiswahili"],
    payments: [tutor.accepts_cusd ? "cUSD" : null, tutor.accepts_celo ? "CELO" : null, tutor.accepts_fiat ? "Card" : null].filter(Boolean) as Tutor["payments"],
    online: Boolean(tutor.is_online),
    bio: tutor.bio ?? tutor.specialty ?? "Premium Kiswahili tutor.",
    image: tutor.profile.avatar_url ?? undefined,
    topTutor: Number(tutor.rating ?? 0) >= 4.7,
  };
}

export function HomeClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [showingFallback, setShowingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setActiveFilter(value);
    const params = new URLSearchParams();
    if (value) params.set("filter", value);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      <FadeIn>
        <section className="african-pattern relative flex min-h-screen items-center overflow-hidden bg-forest text-cream">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
            <div>
              <h1 className="max-w-2xl font-serif text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
                Learn Kiswahili from Africa&apos;s Best Tutors
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-cream/90 md:text-xl">
                Pay with crypto or card. Book in minutes. Learn from anywhere across Africa.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/search"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-8 text-base font-bold text-foreground transition hover:bg-[#e6ac00]"
                >
                  Find a Tutor
                </Link>
                <Link
                  href="/auth/register?role=tutor"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white px-8 text-base font-bold text-white transition hover:bg-white hover:text-forest"
                >
                  Become a Tutor
                </Link>
              </div>
              <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-foreground shadow-lg lg:mt-16">
                <span>🌍</span>
                <span>Now accepting cUSD &amp; CELO payments</span>
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-4 lg:grid">
              {fallbackTutors.map((tutor, index) => (
                <div
                  key={tutor.id}
                  className={`rounded-2xl bg-white/95 p-4 shadow-lg ${index % 2 === 0 ? "animate-float" : "animate-float-delayed"}`}
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jade text-sm font-bold text-white">
                        {tutor.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </div>
                      {tutor.online ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-jade" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-serif text-sm font-bold text-forest">{tutor.name}</p>
                      <p className="text-xs text-foreground/60">{tutor.location}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-gold">${tutor.price}/hr · {tutor.rating}★</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <section className="border-b border-forest/10 bg-white py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center ${index > 0 ? "md:border-l md:border-forest/10" : ""}`}
            >
              <p className="font-serif text-4xl font-black text-forest">
                <span className="border-b-4 border-gold">{stat.value}</span>
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tutors" className="bg-off-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-serif text-4xl font-black text-forest md:text-5xl">Featured Tutors</h2>

          <form onSubmit={submitSearch} className="relative mt-8">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-forest/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-14 w-full rounded-full border border-forest/10 bg-white pl-14 pr-5 text-forest outline-none ring-gold/30 transition focus:ring-4"
              placeholder="Search tutors..."
            />
          </form>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {filters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => selectFilter(item.value)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition ${
                  activeFilter === item.value
                    ? "bg-gold text-foreground"
                    : "border border-forest/15 bg-white text-forest hover:border-gold"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {showingFallback ? (
            <div className="mt-8 rounded-2xl bg-cream p-5 text-center font-bold text-forest">
              Showing sample tutors — be the first to join!
            </div>
          ) : null}
          {error ? (
            <div className="mt-8 rounded-2xl bg-red-50 p-5 text-center font-semibold text-red-700">{error}</div>
          ) : null}

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} href={showingFallback ? "/search" : undefined} />
                ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-forest py-20 text-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-black md:text-5xl">How It Works</h2>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-[20%] right-[20%] top-10 hidden border-t-2 border-dashed border-gold/40 md:block" />
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-xl font-black text-foreground">
                  {step.number}
                </div>
                <step.icon className="mx-auto mt-6 h-10 w-10 text-gold" />
                <h3 className="mt-4 font-serif text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/80">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-black text-forest md:text-5xl">Pricing Plans</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  plan.featured ? "bg-forest text-cream" : "border border-forest/10 bg-white text-forest"
                }`}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-foreground">
                    Most Popular
                  </span>
                ) : null}
                <h3 className="font-serif text-2xl font-bold">{plan.name}</h3>
                <p className={`mt-4 font-serif text-5xl font-black ${plan.featured ? "text-gold" : "text-forest"}`}>
                  {plan.price}
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <UserCheck className={`h-4 w-4 shrink-0 ${plan.featured ? "text-gold" : "text-jade"}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <p className={`mt-4 text-xs font-semibold ${plan.featured ? "text-cream/70" : "text-foreground/60"}`}>
                  Crypto payments coming soon 🌍
                </p>
                <button
                  type="button"
                  className={`mt-6 h-12 rounded-full font-bold transition ${
                    plan.featured
                      ? "bg-gold text-foreground hover:bg-[#e6ac00]"
                      : "border-2 border-forest text-forest hover:bg-forest hover:text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-black text-forest">What Learners Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-4xl font-serif text-gold">&ldquo;</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gold text-sm font-bold text-foreground">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-bold text-forest">{item.name}</p>
                    <p className="text-sm text-foreground/60">{item.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
