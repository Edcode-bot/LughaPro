"use client";

import {
  Award,
  CalendarDays,
  Home,
  LogOut,
  Search,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { WalletWidget } from "@/components/WalletWidget";
import { useAuth } from "@/hooks/useAuth";
import { shortenAddress } from "@/lib/minipay";
import { BookingWithDetails, Notification } from "@/types";

const nav = [
  [Home, "Overview", "/dashboard"],
  [CalendarDays, "My Sessions", "/dashboard#sessions"],
  [Search, "Find Tutors", "/search"],
  [Wallet, "Wallet", "/dashboard#wallet"],
  [Award, "Certificates", "/dashboard#certificates"],
  [Settings, "Settings", "/settings"],
] as const;

const mobileNav = [
  [Home, "Home", "/dashboard"],
  [CalendarDays, "Sessions", "/dashboard#sessions"],
  [Wallet, "Wallet", "/dashboard#wallet"],
  [Settings, "Profile", "/settings"],
] as const;

type DashboardStats = {
  total_sessions: number;
  hours_learned: number;
  amount_spent: number;
  referral_count: number;
  upcoming_sessions: BookingWithDetails[];
  recent_activity: { id: string; label: string; timestamp: string }[];
};

type ApiResponse<T> = { data: T | null; error: string | null };

function initials(name: string) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function tutorLabel(booking: BookingWithDetails) {
  return booking.tutor?.profile?.full_name ?? "Tutor";
}

export function DashboardClient() {
  const { address, displayName, disconnect } = useAuth();
  const [activeNav, setActiveNav] = useState("Overview");
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
    return () => {
      active = false;
    };
  }, []);

  async function confirmOnChainCompletion(bookingId: string) {
    setActionMessage(`On-chain completion coming soon. Contract not yet deployed. Booking: ${bookingId}`);
  }

  const statCards = [
    { label: "Total Sessions", value: stats?.total_sessions ?? 0, trend: "+2" },
    { label: "Hours Learned", value: stats?.hours_learned ?? 0, trend: "+4h" },
    { label: "cUSD Spent", value: stats?.amount_spent ?? 0, trend: "—" },
    { label: "Referrals", value: stats?.referral_count ?? 0, trend: "+1" },
  ];

  const truncatedAddress = address ? shortenAddress(address) : "Not connected";

  return (
    <main className="min-h-screen bg-off-white pb-24 text-foreground lg:pb-0 lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-forest p-6 text-cream lg:flex">
        <Link href="/">
          <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-8 w-auto brightness-0 invert" />
        </Link>

        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-sm font-black text-foreground">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold">{displayName}</p>
            <p className="truncate text-xs text-cream/60">{truncatedAddress}</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map(([Icon, label, href]) => {
            const isActive = activeNav === label;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setActiveNav(label)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-l-4 border-gold bg-white/10 pl-3 text-gold"
                    : "text-cream/75 hover:bg-white/10 hover:text-cream"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => disconnect()}
          className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cream/75 transition hover:bg-white/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      <FadeIn className="px-5 py-8 lg:px-10">
        <div>
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">
            Habari, {displayName} 👋
          </h1>
          <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-forest shadow-sm ring-1 ring-forest/10">
            {truncatedAddress}
          </span>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>
        ) : null}
        {actionMessage ? (
          <p className="mt-6 rounded-2xl bg-cream p-4 text-sm font-semibold text-jade">{actionMessage}</p>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))
            : statCards.map((card) => (
                <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-foreground/55">{card.label}</p>
                    <TrendingUp className="h-4 w-4 text-jade" />
                  </div>
                  <p className="mt-2 text-3xl font-black text-forest">{card.value}</p>
                  <p className="mt-1 text-xs font-semibold text-jade">{card.trend}</p>
                </div>
              ))}
        </section>

        <section id="sessions" className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-black text-forest">Upcoming Sessions</h2>
            <div className="mt-6 grid gap-4">
              {loading ? (
                <div className="h-28 animate-pulse rounded-2xl bg-off-white" />
              ) : bookings.length === 0 ? (
                <div className="rounded-2xl bg-off-white py-12 text-center">
                  <p className="text-5xl">📅</p>
                  <p className="mt-4 font-bold text-forest">No sessions yet</p>
                  <p className="mt-2 text-sm text-foreground/60">Book your first tutor to start learning.</p>
                  <Link
                    href="/search"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gold px-6 font-bold text-foreground hover:bg-[#e6ac00]"
                  >
                    Find a Tutor
                  </Link>
                </div>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-2xl bg-off-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-jade text-sm font-bold text-white">
                        {initials(tutorLabel(booking))}
                      </div>
                      <div>
                        <p className="font-bold text-forest">{tutorLabel(booking)}</p>
                        <p className="text-sm text-foreground/60">
                          {new Date(booking.scheduled_at).toLocaleString()} · {booking.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-forest">
                        {booking.status}
                      </span>
                      <button
                        type="button"
                        className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-foreground"
                      >
                        Join
                      </button>
                      {booking.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() => void confirmOnChainCompletion(booking.id)}
                          className="rounded-full border-2 border-forest px-4 py-2 text-xs font-bold text-forest hover:bg-forest hover:text-white"
                        >
                          Confirm
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <section id="wallet">
            <WalletWidget />
          </section>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-black text-forest">Recent Activity</h2>
            <div className="mt-4 grid gap-3">
              {stats?.recent_activity?.length ? (
                stats.recent_activity.map((item) => (
                  <p key={item.id} className="rounded-xl bg-off-white p-3 text-sm font-semibold text-forest">
                    {item.label} · {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                ))
              ) : (
                <p className="text-sm text-foreground/60">No activity yet.</p>
              )}
            </div>
          </div>
          <div id="certificates" className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-black text-forest">Notifications</h2>
            <p className="mt-2 text-sm text-foreground/60">{notifications.length} unread notifications</p>
          </div>
        </section>
      </FadeIn>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-forest/10 bg-white px-2 py-2 shadow-lg lg:hidden">
        {mobileNav.map(([Icon, label, href]) => (
          <Link
            key={label}
            href={href}
            className="grid place-items-center gap-1 rounded-xl py-2 text-xs font-bold text-forest/70"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
