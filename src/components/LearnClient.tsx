"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

export function LearnClient() {
  const { address } = useAuth();
  const { hasAccess, recordPurchase } = usePurchases();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

    fetch(`/api/content?${params.toString()}`)
      .then((response) => response.json())
      .then((result: { data?: { items: ContentItem[] }; error?: string }) => {
        if (result.error) setError(result.error);
        setItems(result.data?.items ?? []);
      })
      .catch(() => setError("Unable to load content."))
      .finally(() => setLoading(false));
  }, [type, level, price, language]);

  const visible = useMemo(() => sortContent(filterContent(items, { type, level, price, language }), sort), [items, type, level, price, language, sort]);

  async function handleAccess(item: ContentItem) {
    if (!address) return;
    if (isFreeContent(item) || hasAccess(item.id, item.type)) {
      await recordPurchase(item);
      if (item.file_url) window.open(item.file_url, "_blank");
      return;
    }
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

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <FadeIn className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-serif text-4xl font-black text-forest md:text-5xl">Content Library</h1>
              <p className="mt-2 text-foreground/65">Books, posts, and lessons from Africa&apos;s best Kiswahili creators.</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold">
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low-High</option>
                <option value="free_first">Free First</option>
              </select>
              <button type="button" className="rounded-full border border-forest/15 bg-white p-2 lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="hidden lg:block">{sidebar}</div>
            <section>
              {error ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                  <p className="text-5xl">📚</p>
                  <h2 className="mt-4 font-serif text-2xl font-black text-forest">No content matches your filters</h2>
                  <p className="mt-2 text-foreground/60">Try adjusting filters or check back when creators publish.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => (
                    <ContentCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      purchased={hasAccess(item.id, item.type)}
                      onAccess={(content) => void handleAccess(content)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </FadeIn>

        {filtersOpen ? (
          <div className="fixed inset-0 z-50 bg-forest/50 lg:hidden" onClick={() => setFiltersOpen(false)}>
            <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-off-white p-5" onClick={(event) => event.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        ) : null}

        <Footer />
      </main>
    </ErrorBoundary>
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
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              value === key ? "bg-gold text-foreground" : "bg-off-white text-forest"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
