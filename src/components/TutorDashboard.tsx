"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { useAuth } from "@/hooks/useAuth";
import { EarningsWithdraw } from "@/components/web3/EarningsWithdraw";
import { shortenAddress } from "@/lib/minipay";
import { EarningsSummary, TutorContentItem, TutorDashboardStats } from "@/types";

export function TutorDashboard() {
  const { displayName, address } = useAuth();
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [content, setContent] = useState<TutorContentItem[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      fetch("/api/content/mine", { headers: { "x-wallet-address": address } }).then((r) => r.json()),
      fetch("/api/earnings", { headers: { "x-wallet-address": address } }).then((r) => r.json()),
    ])
      .then(([contentRes, earningsRes]) => {
        const items: TutorContentItem[] = contentRes.data?.items ?? [];
        const summary: EarningsSummary = earningsRes.data ?? { total_earned: 0, monthly: [], recent: [] };
        setContent(items.slice(0, 3));
        setEarnings(summary);
        setStats({
          total_content: items.length,
          total_learners: new Set(summary.recent.map((row) => row.buyer_wallet)).size,
          total_earned: summary.total_earned,
          rating: 4.9,
        });
      })
      .finally(() => setLoading(false));
  }, [address]);

  const statCards = [
    ["Total Content", stats?.total_content ?? 0],
    ["Total Learners", stats?.total_learners ?? 0],
    ["Total Earned (cUSD)", stats?.total_earned ?? 0],
    ["Rating", stats?.rating ?? 0],
  ] as const;

  return (
    <DashboardLayout role="tutor">
      <ErrorBoundary>
        <FadeIn>
          <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">Habari, {displayName} 👋</h1>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)
              : statCards.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-foreground/55">{label}</p>
                    <p className="mt-2 text-3xl font-black text-forest">{value}</p>
                  </div>
                ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-black text-forest">My Recent Content</h2>
                <Link href="/my-content" className="text-sm font-bold text-jade">View all</Link>
              </div>
              {content.length === 0 ? (
                <p className="mt-4 text-sm text-foreground/60">No content published yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {content.map((item) => (
                    <div key={item.id} className="rounded-xl bg-off-white p-4">
                      <p className="font-bold text-forest">{item.title}</p>
                      <p className="text-xs text-foreground/55">
                        {item.type} · {item.view_count ?? 0} views · {item.purchase_count ?? 0} purchases
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-black text-forest">Recent Earnings</h2>
              {earnings?.recent.length ? (
                <div className="mt-4 space-y-3">
                  {earnings.recent.slice(0, 5).map((row, index) => (
                    <div key={`${row.buyer_wallet}-${index}`} className="flex justify-between text-sm">
                      <span className="text-foreground/70">{shortenAddress(row.buyer_wallet)} · {row.content_title}</span>
                      <span className="font-bold text-forest">{row.amount} cUSD</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-foreground/60">No purchases yet.</p>
              )}
            </div>
          </section>

          <section className="mt-8 flex flex-wrap gap-3">
            <Link href="/publish?tab=book" className="rounded-full bg-gold px-6 py-3 font-bold text-foreground">New Book</Link>
            <Link href="/publish?tab=post" className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest">New Post</Link>
          </section>

          <EarningsWithdraw compact />

          <section className="mt-8 rounded-2xl border border-dashed border-forest/20 bg-cream p-8 text-center">
            <p className="font-semibold text-forest">Detailed analytics coming soon</p>
            <p className="mt-2 text-sm text-foreground/60">Performance charts and cohort insights will appear here.</p>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
