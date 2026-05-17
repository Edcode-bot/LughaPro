"use client";

import { Award, CalendarDays, CreditCard, Home, LogOut, MessageCircle, Search, Settings, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";

const nav = [[Home, "Overview"], [CalendarDays, "My Sessions"], [Search, "Find Tutors"], [Wallet, "Wallet"], [Award, "Certificates"], [Settings, "Settings"]];
const stats = [["Total Sessions", "18"], ["Hours Learned", "24.5"], ["cUSD Spent", "142"], ["Referrals", "6"]];
const sessions = [["Amina Nyerere", "Today · 18:00 EAT", "Business greetings"], ["Brian Otieno", "Fri · 10:30 EAT", "Nairobi conversation"], ["Zawadi Mushi", "Mon · 14:00 EAT", "Tourism Kiswahili"]];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-off-white text-forest lg:pl-80">
      <aside className="fixed inset-y-0 left-0 hidden w-80 flex-col border-r border-forest/10 bg-forest p-6 text-cream lg:flex">
        <div className="flex items-center gap-3"><Avatar name="Nia Thompson" online /><div><p className="font-bold">Nia Thompson</p><p className="text-sm text-cream/60">0x1234...abcd</p></div></div>
        <nav className="mt-10 grid gap-2">{nav.map(([Icon, label], index) => <a key={String(label)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${index === 0 ? "bg-gold text-forest" : "text-cream/78 hover:bg-white/10"}`} href="#"><Icon className="h-5 w-5" />{label as string}</a>)}</nav>
        <button className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-cream/78 hover:bg-white/10"><LogOut className="h-5 w-5" />Logout</button>
      </aside>
      <FadeIn className="px-5 py-8 lg:px-10">
        <div className="lg:hidden"><div className="mb-6 rounded-3xl bg-forest p-5 text-cream"><div className="flex items-center gap-3"><Avatar name="Nia Thompson" online /><div><p className="font-bold">Nia Thompson</p><p className="text-sm text-cream/60">0x1234...abcd</p></div></div></div></div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge tone="cusd">Student Dashboard</Badge><h1 className="mt-4 font-serif text-4xl font-black md:text-5xl">Habari, Nia 👋</h1><p className="mt-2 text-forest/65">Your Kiswahili learning command center.</p></div><Button>Add Funds</Button></div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm font-semibold text-forest/55">{label}</p><p className="mt-2 text-3xl font-black text-jade">{value}</p></Card>)}</section>
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <Card><h2 className="font-serif text-3xl font-black">Upcoming Sessions</h2><div className="mt-6 grid gap-4">{sessions.map(([name, time, topic]) => <div key={name} className="flex flex-col gap-4 rounded-2xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Avatar name={name} /><div><p className="font-bold">{name}</p><p className="text-sm text-forest/60">{time} · {topic}</p></div></div><Button size="sm">Join</Button></div>)}</div></Card>
          <Card cream><h2 className="font-serif text-3xl font-black">Wallet Balance</h2><div className="mt-6 grid gap-3"><div className="rounded-2xl bg-white p-4"><p className="text-sm text-forest/55">cUSD</p><p className="text-3xl font-black">86.40</p></div><div className="rounded-2xl bg-white p-4"><p className="text-sm text-forest/55">CELO</p><p className="text-3xl font-black">12.8</p></div></div><Button className="mt-6 w-full">Add Funds</Button></Card>
        </section>
        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <Card><h2 className="font-serif text-2xl font-black">Recent Activity</h2><div className="mt-5 grid gap-4 text-sm text-forest/70">{["2h ago · Booked Amina for Thursday", "1d ago · Earned 5 cUSD referral reward", "3d ago · Completed coastal greetings lesson", "5d ago · Added 40 cUSD to wallet"].map((item) => <p key={item} className="rounded-2xl bg-off-white p-3">{item}</p>)}</div></Card>
          <Card><h2 className="font-serif text-2xl font-black">Continue Learning</h2><div className="mt-5 grid gap-4">{[["Travel Basics", "72%"], ["Business Kiswahili", "44%"]].map(([title, progress]) => <div key={title}><div className="flex justify-between text-sm font-bold"><span>{title}</span><span>{progress}</span></div><div className="mt-2 h-3 rounded-full bg-cream"><div className="h-3 rounded-full bg-mint" style={{ width: progress }} /></div></div>)}</div></Card>
          <Card><h2 className="font-serif text-2xl font-black">Notifications</h2><div className="mt-5 grid gap-4">{[[CalendarDays, "Session reminder in 2 hours"], [CreditCard, "Referral reward settled on-chain"], [MessageCircle, "New message from Brian"]].map(([Icon, text]) => <div key={String(text)} className="flex items-center gap-3 rounded-2xl bg-off-white p-3"><Icon className="h-5 w-5 text-gold" /><span className="text-sm font-semibold text-forest/75">{text as string}</span></div>)}</div></Card>
        </section>
      </FadeIn>
    </main>
  );
}
