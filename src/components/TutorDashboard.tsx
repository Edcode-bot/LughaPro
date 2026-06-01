"use client";

import clsx from "clsx";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { NavBar } from "@/components/ui/NavBar";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/content";
import { shortenAddress } from "@/lib/minipay";
import { TutorContentItem } from "@/types";

const tutorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/my-content", label: "My Content", icon: FileText },
  { href: "/publish", label: "Publish Content", icon: PenSquare },
  { href: "/earnings", label: "Earnings", icon: BarChart3 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TutorDashboard() {
  const pathname = usePathname();
  const { displayName, address, disconnect } = useAuth();
  const [content, setContent] = useState<TutorContentItem[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      fetch("/api/content/mine", { headers: { "x-wallet-address": address } }).then((r) => r.json()),
      fetch("/api/earnings", { headers: { "x-wallet-address": address } }).then((r) => r.json()),
    ])
      .then(([contentRes, earningsRes]) => {
        const items: TutorContentItem[] = contentRes.data?.items ?? [];
        const summary = earningsRes.data ?? { total_earned: 0, recent: [] };
        setContentCount(items.length);
        setContent(items.slice(0, 3));
        setTotalEarned(summary.total_earned ?? 0);
        setTotalLearners(new Set((summary.recent ?? []).map((row: { buyer_wallet: string }) => row.buyer_wallet)).size);
      })
      .finally(() => setLoading(false));
  }, [address]);

  const statCards = [
    ["My Content", loading ? "—" : contentCount],
    ["Total Learners", totalLearners],
    ["Earnings (cUSD)", totalEarned],
  ] as const;

  return (
    <div className="min-h-screen bg-off-white">
      <NavBar />
      <div className="lg:flex">
        <aside className="hidden w-72 shrink-0 flex-col bg-forest p-6 text-cream lg:flex lg:min-h-[calc(100vh-72px)]">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gold text-sm font-black text-foreground">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{displayName}</p>
              <p className="truncate text-xs text-cream/60">{address ? shortenAddress(address) : ""}</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {tutorLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    active ? "border-l-4 border-gold bg-white/10 pl-3 text-gold" : "text-cream/75 hover:bg-white/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => disconnect()}
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cream/75 hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            Disconnect
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 pb-28 lg:px-10 lg:pb-10">
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">
            Habari, {displayName} 👋 — Creator Dashboard
          </h1>

          <Link
            href="/publish"
            className="mt-6 inline-flex w-full max-w-md items-center justify-center rounded-full bg-gold px-8 py-4 text-lg font-black text-foreground hover:bg-[#e6ac00] sm:w-auto"
          >
            Publish Your First Content
          </Link>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {statCards.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground/55">{label}</p>
                <p className="mt-2 text-3xl font-black text-forest">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-forest">My Recent Content</h2>
              <Link href="/my-content" className="text-sm font-bold text-jade">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-off-white" />
            ) : content.length === 0 ? (
              <div className="mt-6 rounded-xl bg-cream p-8 text-center">
                <p className="text-foreground/65">You haven&apos;t published anything yet.</p>
                <Link href="/publish" className="mt-4 inline-flex rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-white">
                  Go to Publish →
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {content.map((item) => (
                  <div key={item.id} className="rounded-xl bg-off-white p-4">
                    <p className="font-bold text-forest">{item.title}</p>
                    <p className="text-xs text-foreground/55">
                      {item.type} · ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
