"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentCard } from "@/components/ui/ContentCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { Certificate, ContentItem, PurchaseWithContent, StudentDashboardStats } from "@/types";

export function StudentDashboard() {
  const { displayName, address } = useAuth();
  const { purchases, purchaseIds } = usePurchases();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [recent, setRecent] = useState<PurchaseWithContent[]>([]);
  const [recommended, setRecommended] = useState<ContentItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      fetch(`/api/dashboard/stats?user=${address}`).then((r) => r.json()),
      fetch(`/api/purchases/recent?user=${address}&limit=3`).then((r) => r.json()),
      fetch("/api/content?limit=3").then((r) => r.json()),
      fetch(`/api/certificates/mine?user=${address}`, { headers: { "x-wallet-address": address } }).then((r) => r.json()),
    ])
      .then(([statsRes, recentRes, contentRes, certRes]) => {
        const booksRead = (recentRes.data?.items ?? []).filter(
          (p: PurchaseWithContent) => p.progress_status === "completed" || p.content_type === "book",
        ).length;
        setStats({
          content_accessed: statsRes.data?.content_accessed ?? purchases.length,
          books_read: booksRead,
          cusd_spent: statsRes.data?.cusd_spent ?? 0,
          certificates_earned: (certRes.data?.items ?? []).length,
        });
        setRecent(recentRes.data?.items ?? []);
        setRecommended(contentRes.data?.items ?? []);
        setCertificates(certRes.data?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [address, purchases.length]);

  const statCards = [
    ["Content Accessed", stats?.content_accessed ?? 0],
    ["Books Read", stats?.books_read ?? 0],
    ["cUSD Spent", stats?.cusd_spent ?? 0],
    ["Certificates Earned", stats?.certificates_earned ?? 0],
  ] as const;

  return (
    <DashboardLayout role="student">
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

          <section className="mt-10">
            <h2 className="font-serif text-2xl font-black text-forest">Continue Learning</h2>
            {recent.length === 0 ? (
              <p className="mt-4 text-foreground/60">No recent content. Start browsing the library.</p>
            ) : (
              <div className="mt-4 grid gap-4">
                {recent.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-forest">{item.content.title}</p>
                        <p className="text-sm text-foreground/60">{item.content.author?.full_name}</p>
                      </div>
                      <span className="text-xs font-bold capitalize text-jade">{item.progress_status ?? "reading"}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-off-white">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${item.progress_percent ?? (item.progress_status === "completed" ? 100 : 35)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-black text-forest">Recommended for You</h2>
              <Link href="/learn" className="text-sm font-bold text-jade">See all</Link>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              {recommended.map((item) => (
                <ContentCard key={item.id} item={item} purchased={purchaseIds.includes(item.id)} purchaseIds={purchaseIds} />
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-black text-forest">Your Certificates</h2>
              <Link href="/certificates" className="text-sm font-bold text-jade">View all</Link>
            </div>
            {certificates.length === 0 ? (
              <p className="mt-4 text-sm text-foreground/60">No certificates yet. Complete a course to earn your first NFT certificate.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {certificates.slice(0, 2).map((cert) => (
                  <div key={cert.id} className="rounded-xl bg-cream p-4">
                    <p className="font-bold text-forest">{cert.course_name}</p>
                    <p className="text-sm text-foreground/60">{cert.creator_name} · {cert.level}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 flex flex-wrap gap-3">
            <Link href="/learn" className="rounded-full bg-gold px-6 py-3 font-bold text-foreground">Browse Content</Link>
            <Link href="/library" className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest">My Library</Link>
            <Link href="/wallet" className="rounded-full border-2 border-forest px-6 py-3 font-bold text-forest">Add Funds</Link>
          </section>
        </FadeIn>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
