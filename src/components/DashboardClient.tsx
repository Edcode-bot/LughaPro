"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentCard } from "@/components/ui/ContentCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { useAuth } from "@/hooks/useAuth";
import { ContentItem, DashboardStats, PurchaseWithContent } from "@/types";

export function DashboardClient() {
  const { displayName, address } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<PurchaseWithContent[]>([]);
  const [recommended, setRecommended] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      fetch(`/api/dashboard/stats?user=${address}`).then((r) => r.json()),
      fetch(`/api/purchases/recent?user=${address}&limit=3`).then((r) => r.json()),
      fetch("/api/content?limit=3").then((r) => r.json()),
    ])
      .then(([statsResult, recentResult, contentResult]) => {
        setStats(statsResult.data ?? null);
        setRecent(recentResult.data?.items ?? []);
        setRecommended(contentResult.data?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [address]);

  const statCards = [
    { label: "Content Accessed", value: stats?.content_accessed ?? 0 },
    { label: "Books in Library", value: stats?.books_in_library ?? 0 },
    { label: "cUSD Spent", value: stats?.cusd_spent ?? 0 },
  ];

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">
            Habari, {displayName} 👋
          </h1>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />
                ))
              : statCards.map((card) => (
                  <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-foreground/55">{card.label}</p>
                    <p className="mt-2 text-3xl font-black text-forest">{card.value}</p>
                  </div>
                ))}
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-2xl font-black text-forest">Recently Accessed</h2>
            {recent.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-foreground/60">No content accessed yet.</p>
                <Link href="/learn" className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-foreground">
                  Browse Content
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {recent.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                    <div>
                      <p className="font-bold text-forest">{purchase.content.title}</p>
                      <p className="text-sm text-foreground/60">
                        {purchase.content.author?.full_name} · {new Date(purchase.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href="/library" className="rounded-full bg-jade px-4 py-2 text-xs font-bold text-white">
                      Read Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-black text-forest">Recommended for you</h2>
              <Link href="/learn" className="text-sm font-bold text-jade">
                See all
              </Link>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              {recommended.map((item) => (
                <ContentCard key={item.id} item={item} purchased />
              ))}
            </div>
          </section>

          <section className="mt-10 flex flex-wrap gap-3">
            <Link href="/learn" className="rounded-full bg-gold px-6 py-3 font-bold text-foreground hover:bg-[#e6ac00]">
              Browse Content
            </Link>
            <Link href="/library" className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest hover:bg-forest hover:text-white">
              My Library
            </Link>
            <Link href="/wallet" className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest hover:bg-forest hover:text-white">
              Add Funds
            </Link>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
