"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ContentCard } from "@/components/ui/ContentCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { filterContent, sortContent } from "@/lib/content";
import { ContentItem } from "@/types";

const typePills = [
  ["all", "All"],
  ["book", "Books"],
  ["post", "Posts"],
] as const;

const pricePills = [
  ["all", "All"],
  ["free", "Free"],
  ["paid", "Paid"],
] as const;

const levelPills = [
  ["all", "All"],
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
] as const;

function FilterPills({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition min-h-11 ${
            value === key
              ? "border-gold bg-gold text-foreground"
              : "border-forest/15 bg-white text-forest"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LearnClient() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [level, setLevel] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "50" });
    if (type !== "all") params.set("type", type);
    if (level !== "all") params.set("level", level);
    if (price !== "all") params.set("price", price);

    fetch(`/api/content?${params.toString()}`)
      .then((response) => response.json())
      .then((result: { data?: { items: ContentItem[] }; error?: string }) => {
        if (result.error) setError(result.error);
        setItems(result.data?.items ?? []);
      })
      .catch(() => setError("Unable to load content."))
      .finally(() => setLoading(false));
  }, [type, level, price]);

  const visible = useMemo(
    () => sortContent(filterContent(items, { type, level, price, language: "all" }), sort),
    [items, type, level, price, sort],
  );

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <FadeIn className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-black text-forest sm:text-4xl md:text-5xl">
                Content Library
              </h1>
              <p className="mt-1 text-sm text-foreground/60">
                Showing {visible.length} item{visible.length === 1 ? "" : "s"}
              </p>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-11 w-full rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold sm:w-auto"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="free_first">Free First</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            <FilterPills options={typePills} value={type} onChange={setType} />
            <FilterPills options={pricePills} value={price} onChange={setPrice} />
            <FilterPills options={levelPills} value={level} onChange={setLevel} />
          </div>

          <section className="mt-8">
            {error ? (
              <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
            ) : null}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <p className="text-6xl">📚</p>
                <h2 className="mt-4 font-serif text-2xl font-black text-forest">No content yet</h2>
                <p className="mt-2 text-foreground/60">Be the first to publish on LughaPro.</p>
                <Link
                  href="/publish"
                  className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-8 py-3 font-bold text-foreground"
                >
                  Be the first to publish
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((item) => (
                  <ContentCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </section>
        </FadeIn>
        <Footer />
      </main>
    </ErrorBoundary>
  );
}
