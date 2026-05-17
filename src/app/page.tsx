import { BookOpen, CreditCard, Gift, Search, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { TutorCard } from "@/components/ui/TutorCard";
import { tutors } from "@/lib/mock-data";

const filters = ["All", "Online Now", "cUSD Accepted", "Top Rated", "Under $15/hr"];
const stats = ["500+ Tutors", "12,000+ Students", "4.9 Average Rating"];
const plans = [
  { name: "Starter", price: "Free", perks: ["Browse tutors", "Community lessons", "Wallet-ready profile"] },
  { name: "Explorer", price: "$19/mo", perks: ["2 premium lessons", "Priority booking", "Progress tracking"] },
  { name: "Pro", price: "$49/mo", perks: ["6 premium lessons", "Certificate paths", "Concierge matching"] },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <FadeIn>
        <section className="african-pattern relative overflow-hidden bg-gradient-to-br from-forest via-jade to-forest text-cream">
          <div className="absolute right-8 top-28 hidden rounded-full border border-gold/30 bg-cream/10 px-5 py-3 text-sm font-bold text-gold shadow-2xl backdrop-blur md:block">
            Now accepting cUSD & CELO payments
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-32">
            <div>
              <Badge tone="cusd" className="mb-6">Premium Kiswahili marketplace</Badge>
              <h1 className="max-w-4xl font-serif text-5xl font-black leading-tight tracking-tight md:text-7xl">Learn Kiswahili from Africa&apos;s Best Tutors</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-cream/82 md:text-xl">Pay with crypto or card. Book in minutes. Learn from anywhere.</p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button size="lg">Find a Tutor</Button>
                <Button size="lg" variant="ghost">Become a Tutor</Button>
              </div>
            </div>
            <Card className="bg-cream/95 p-5">
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-center gap-4"><Avatar name="Amina Nyerere" online size="xl" /><div><p className="font-serif text-3xl font-black text-forest">Amina Nyerere</p><p className="text-forest/65">Top tutor  Dar es Salaam</p></div></div>
                <div className="mt-6 grid grid-cols-3 gap-3">{["Kiswahili", "cUSD", "4.9"].map((item) => <div key={item} className="rounded-2xl bg-off-white p-4 text-center font-bold text-forest">{item}</div>)}</div>
              </div>
            </Card>
          </div>
        </section>
      </FadeIn>
      <section className="bg-cream py-8"><div className="mx-auto grid max-w-5xl gap-4 px-5 text-center md:grid-cols-3">{stats.map((stat) => <div key={stat} className="text-2xl font-black text-jade">{stat}</div>)}</div></section>
      <section id="tutors" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-bold uppercase tracking-[0.25em] text-gold">Marketplace</p><h2 className="mt-3 font-serif text-4xl font-black text-forest md:text-5xl">Featured Tutors</h2></div><div className="relative w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest/45" /><input className="h-13 w-full rounded-full border border-forest/10 bg-white pl-12 pr-5 text-forest outline-none ring-gold/30 transition focus:ring-4" placeholder="Search by name, specialty, price..." /></div></div>
        <div className="mt-8 flex flex-wrap gap-3">{filters.map((filter, index) => <Badge key={filter} tone={index === 0 ? "top" : "default"}>{filter}</Badge>)}</div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)}</div>
      </section>
      <section id="how-it-works" className="bg-forest py-20 text-cream"><div className="mx-auto max-w-7xl px-5 lg:px-8"><h2 className="text-center font-serif text-4xl font-black md:text-5xl">How it Works</h2><div className="relative mt-12 grid gap-6 md:grid-cols-3"><div className="absolute left-1/4 right-1/4 top-12 hidden h-px bg-gold/40 md:block" />{[[Search, "Find Your Tutor", "Filter by style, budget, ratings, and payment method."], [CreditCard, "Book & Pay", "Use cUSD, CELO, or card with transparent pricing."], [BookOpen, "Start Learning", "Join your session and track fluency progress."]].map(([Icon, title, text]) => <Card key={String(title)} className="relative bg-cream text-forest"><Icon className="h-10 w-10 text-gold" /><h3 className="mt-5 text-xl font-black">{title as string}</h3><p className="mt-3 text-forest/70">{text as string}</p></Card>)}</div></div></section>
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><h2 className="text-center font-serif text-4xl font-black text-forest md:text-5xl">Pricing Plans</h2><div className="mt-12 grid gap-6 md:grid-cols-3">{plans.map((plan, index) => <Card key={plan.name} cream={index === 1} className={index === 1 ? "border-gold ring-4 ring-gold/20" : ""}>{index === 1 ? <Badge tone="top">Most Popular</Badge> : null}<h3 className="mt-5 text-2xl font-black text-forest">{plan.name}</h3><p className="mt-4 font-serif text-5xl font-black text-jade">{plan.price}</p><div className="mt-6 grid gap-3">{plan.perks.map((perk) => <p key={perk} className="flex items-center gap-2 text-forest/75"><ShieldCheck className="h-4 w-4 text-mint" />{perk}</p>)}</div><p className="mt-6 rounded-2xl bg-gold/15 p-3 text-sm font-bold text-forest">Pay with cUSD and save 10%</p></Card>)}</div></section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="rounded-3xl bg-gold p-8 text-forest shadow-luxury md:flex md:items-center md:justify-between"><div><Gift className="h-10 w-10" /><h2 className="mt-4 font-serif text-3xl font-black">Refer a friend, earn 5 cUSD on-chain</h2></div><Button className="mt-6 bg-forest text-cream hover:bg-jade md:mt-0">Get Referral Link</Button></div></section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><h2 className="font-serif text-4xl font-black text-forest">Loved by global learners</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{[["Maya Chen", "", "I learned travel Kiswahili in four weeks and paid smoothly with cUSD."], ["Kwame Mensah", "", "Premium tutors, warm culture, and Web3 payments that actually feel simple."], ["Elena Rossi", "", "The lessons felt polished, personal, and deeply connected to East Africa."]].map(([name, flag, quote]) => <Card key={name}><div className="flex items-center gap-3"><Avatar name={name} /><div><p className="font-bold text-forest">{name} {flag}</p><p className="text-sm text-forest/55">Verified student</p></div></div><p className="mt-5 text-forest/75">&ldquo;{quote}&rdquo;</p></Card>)}</div></section>
      <Footer />
    </main>
  );
}
