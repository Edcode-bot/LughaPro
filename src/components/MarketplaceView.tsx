"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentCard } from "@/components/ui/ContentCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { filterContent, isFreeContent, sortContent } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { ContentItem } from "@/types";

function MarketplaceGrid() {
  const { address, isConnected, profile } = useAuth();
  const { purchaseIds, recordPurchase } = usePurchases();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [level, setLevel] = useState("all");
  const [price, setPrice] = useState("all");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (type !== "all") params.set("type", type);
    if (level !== "all") params.set("level", level);
    if (price !== "all") params.set("price", price);
    if (language !== "all") params.set("language", language);
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/content?${params.toString()}`)
      .then((response) => response.json())
      .then((result: { data?: { items: ContentItem[] }; error?: string }) => {
        if (result.error) setError(result.error);
        setItems(result.data?.items ?? []);
      })
      .catch(() => setError("Unable to load content."))
      .finally(() => setLoading(false));
  }, [type, level, price, language, search]);

  const visible = useMemo(
    () => sortContent(filterContent(items, { type, level, price, language }), sort),
    [items, type, level, price, language, sort],
  );

  async function handleAccess(item: ContentItem) {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }
    if (isFreeContent(item)) {
      await recordPurchase(item);
      if (item.file_url) window.open(item.file_url, "_blank");
      return;
    }
    if (purchaseIds.includes(item.id) && item.file_url) {
      window.open(item.file_url, "_blank");
    }
  }

  async function handlePurchaseSuccess(item: ContentItem) {
    await recordPurchase(item);
  }

  const sidebar = (
    <aside className="space-y-6 rounded-2xl bg-white p-5 shadow-sm">
      <FilterGroup title="Content type" value={type} onChange={setType} options={[["all", "All"], ["book", "Books"], ["post", "Posts"], ["lesson", "Lessons"]]} />
      <FilterGroup title="Level" value={level} onChange={setLevel} options={[["all", "All"], ["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]} />
      <FilterGroup title="Price" value={price} onChange={setPrice} options={[["all", "All"], ["free", "Free"], ["paid", "Paid"]]} />
      <FilterGroup title="Language" value={language} onChange={setLanguage} options={[["all", "All"], ["kiswahili", "Kiswahili"], ["english", "English"], ["bilingual", "Bilingual"]]} />
    </aside>
  );

  const header = (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-forest md:text-4xl">Browse Content</h1>
          <p className="mt-1 text-sm text-foreground/65">
            {visible.length} item{visible.length === 1 ? "" : "s"} · Books, lessons & posts from creators
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles..."
              className="h-10 w-full rounded-full border border-forest/15 bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold">
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low–High</option>
            <option value="free_first">Free first</option>
          </select>
          <button type="button" className="rounded-full border border-forest/15 bg-white p-2 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">{sidebar}</div>
        <section>
          {error ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-5xl">📚</p>
              <h2 className="mt-4 font-serif text-xl font-black text-forest">No content yet</h2>
              <p className="mt-2 text-sm text-foreground/60">Creators can publish books and posts from Upload Content.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <ContentCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  purchaseIds={purchaseIds}
                  onAccess={(content) => void handleAccess(content)}
                  onPurchaseSuccess={(content) => void handlePurchaseSuccess(content)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 bg-forest/50 lg:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-off-white p-5" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      ) : null}

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );

  return header;
}

export function MarketplaceView() {
  const { isConnected, profile, role } = useAuth();
  const inApp = isConnected && profile?.onboarding_completed;

  const grid = (
    <ErrorBoundary>
      <FadeIn>
        <MarketplaceGrid />
      </FadeIn>
    </ErrorBoundary>
  );

  if (inApp) {
    return (
      <AuthGuard>
        <DashboardLayout role={role === "tutor" ? "tutor" : "student"}>{grid}</DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">{grid}</div>
      <Footer />
    </main>
  );
}

function FilterGroup({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <p className="text-sm font-bold text-forest">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${value === key ? "bg-gold text-foreground" : "bg-off-white text-forest"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
