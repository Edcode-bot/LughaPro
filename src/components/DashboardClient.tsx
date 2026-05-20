"use client";

import { Award, CalendarDays, Home, LogOut, MessageCircle, Search, Settings, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Hex, keccak256, stringToHex } from "viem";
import { useAccount } from "wagmi";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { SkeletonStat } from "@/components/ui/Skeleton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { WalletWidget } from "@/components/WalletWidget";
import { useBookingEscrow, useCertificates } from "@/hooks/useContracts";
import { shortenAddress } from "@/lib/minipay";
import { BookingWithDetails, Notification } from "@/types";

const nav = [[Home, "Overview"], [CalendarDays, "My Sessions"], [Search, "Find Tutors"], [Wallet, "Wallet"], [Award, "Certificates"], [Settings, "Settings"]];
const mobileNav = [[Home, "Home"], [CalendarDays, "Sessions"], [Wallet, "Wallet"], [User, "Profile"]];

type DashboardStats = { total_sessions: number; hours_learned: number; amount_spent: number; referral_count: number; upcoming_sessions: BookingWithDetails[]; recent_activity: { id: string; label: string; timestamp: string }[] };
type ApiResponse<T> = { data: T | null; error: string | null };

export function DashboardClient() {
  const { address } = useAccount();
  const escrow = useBookingEscrow();
  const certificates = useCertificates(address);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/dashboard/stats").then((response) => response.json() as Promise<ApiResponse<DashboardStats>>),
      fetch("/api/bookings").then((response) => response.json() as Promise<ApiResponse<BookingWithDetails[]>>),
      fetch("/api/notifications").then((response) => response.json() as Promise<ApiResponse<Notification[]>>),
    ])
      .then(([statsResult, bookingsResult, notificationsResult]) => {
        if (!active) return;
        if (statsResult.error) setError(statsResult.error);
        setStats(statsResult.data);
        setBookings(bookingsResult.data ?? []);
        setNotifications(notificationsResult.data ?? []);
      })
      .catch(() => active && setError("Unable to load dashboard."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function confirmOnChainCompletion(bookingId: string) {
    setActionMessage(null);
    try {
      const hash = await escrow.confirmCompletion(keccak256(stringToHex(bookingId)) as Hex);
      setActionMessage(`Completion confirmed on-chain: ${hash}`);
    } catch (caught) {
      setActionMessage(caught instanceof Error ? caught.message : "Unable to confirm completion.");
    }
  }

  const statCards = [["Total Sessions", stats?.total_sessions ?? 0], ["Hours Learned", stats?.hours_learned ?? 0], ["cUSD Spent", stats?.amount_spent ?? 0], ["Referrals", stats?.referral_count ?? 0]];

  return (
    <NetworkGuard>
      <main className="min-h-screen bg-off-white pb-24 text-forest lg:pb-0 lg:pl-80">
        <aside className="fixed inset-y-0 left-0 hidden w-80 flex-col border-r border-forest/10 bg-forest p-6 text-cream lg:flex"><div className="flex items-center gap-3"><Avatar name="LughaPro Student" online /><div><p className="font-bold">LughaPro Student</p><p className="text-sm text-cream/60">{address ? shortenAddress(address) : "Wallet not connected"}</p></div></div><nav className="mt-10 grid gap-2">{nav.map(([Icon, label], index) => <a key={String(label)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${index === 0 ? "bg-gold text-forest" : "text-cream/78 hover:bg-white/10"}`} href="#"><Icon className="h-5 w-5" />{label as string}</a>)}</nav><button className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-cream/78 hover:bg-white/10"><LogOut className="h-5 w-5" />Logout</button></aside>
        <FadeIn className="px-5 py-8 lg:px-10"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge tone="cusd">Student Dashboard</Badge><h1 className="mt-4 font-serif text-4xl font-black md:text-5xl">Habari</h1><p className="mt-2 text-forest/65">{address ? shortenAddress(address) : "Wallet not connected"}</p></div><Button>Add Funds</Button></div>{error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}{actionMessage ? <p className="mt-6 rounded-2xl bg-cream p-4 text-sm font-semibold text-jade">{actionMessage}</p> : null}<section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{loading ? Array.from({ length: 4 }).map((_, index) => <SkeletonStat key={index} />) : statCards.map(([label, value]) => <Card key={String(label)} className="p-5"><p className="text-sm font-semibold text-forest/55">{label}</p><p className="mt-2 text-3xl font-black text-jade">{value}</p></Card>)}</section><section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]"><Card><h2 className="font-serif text-3xl font-black">Upcoming Sessions</h2><div className="mt-6 grid gap-4">{bookings.slice(0, 3).map((booking) => <div key={booking.id} className="flex flex-col gap-4 rounded-2xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Avatar name={booking.tutor.profile.full_name} /><div><p className="font-bold">{booking.tutor.profile.full_name}</p><p className="text-sm text-forest/60">{new Date(booking.scheduled_at).toLocaleString()}  {booking.duration_minutes}min  {booking.status}</p></div></div><div className="flex gap-2"><Button size="sm">Join</Button>{booking.status === "completed" ? <Button size="sm" variant="secondary" loading={escrow.isLoading} onClick={() => confirmOnChainCompletion(booking.id)}>Confirm Completion</Button> : null}</div></div>)}</div></Card><WalletWidget /></section><section className="mt-8 grid gap-6 xl:grid-cols-3"><Card><h2 className="font-serif text-2xl font-black">Recent Activity</h2><div className="mt-5 grid gap-4 text-sm text-forest/70">{(stats?.recent_activity ?? []).map((item) => <p key={item.id} className="rounded-2xl bg-off-white p-3">{new Date(item.timestamp).toLocaleString()}  {item.label}</p>)}</div></Card><Card><h2 className="font-serif text-2xl font-black">Certificates</h2><div className="mt-5 grid gap-4 text-sm text-forest/70">{certificates.certificates.length > 0 ? certificates.certificates.map((tokenId) => <p key={tokenId.toString()} className="rounded-2xl bg-off-white p-3">On-chain certificate #{tokenId.toString()}</p>) : <p className="rounded-2xl bg-off-white p-3">No on-chain certificates yet.</p>}</div></Card><Card><h2 className="font-serif text-2xl font-black">Notifications</h2><div className="mt-5 grid gap-4">{notifications.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-off-white p-3"><MessageCircle className="h-5 w-5 text-gold" /><span className="text-sm font-semibold text-forest/75">{item.title}</span></div>)}</div></Card></section></FadeIn>
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-forest/10 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">{mobileNav.map(([Icon, label]) => <a key={String(label)} href="#" className="grid place-items-center gap-1 rounded-2xl py-2 text-xs font-bold text-forest/70"><Icon className="h-5 w-5" />{label as string}</a>)}</nav>
      </main>
    </NetworkGuard>
  );
}
