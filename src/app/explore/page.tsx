"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ContentCard } from "@/components/ui/ContentCard";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ContentItem } from "@/types";

const CATEGORY_TABS = [
  { label: "All", value: "" },
  { label: "Language", value: "language" },
  { label: "Music", value: "music" },
  { label: "Arts & Crafts", value: "arts" },
  { label: "Literature", value: "literature" },
  { label: "Video", value: "video" },
  { label: "Experiences", value: "experience" },
];

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Books", value: "book" },
  { label: "Posts", value: "post" },
  { label: "Videos", value: "video" },
  { label: "Music", value: "music" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const priceFilter = searchParams.get("price") ?? "";

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    // type=free/paid goes to price param
    if (key === "type" && (value === "free" || value === "paid")) {
      p.set("price", value);
      p.delete("type");
    } else if (key === "type") {
      p.delete("price");
    }
    router.push(`/explore?${p.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ limit: "24" });
    if (category) p.set("category", category);
    if (typeFilter && typeFilter !== "free" && typeFilter !== "paid") p.set("type", typeFilter);
    if (priceFilter) p.set("price", priceFilter);

    fetch(`/api/content?${p.toString()}`)
      .then((r) => r.json())
      .then((result: { data?: { items: ContentItem[]; total: number } }) => {
        setItems(result.data?.items ?? []);
        setTotal(result.data?.total ?? 0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, typeFilter, priceFilter]);

  // Active type tab: combine type + price into one control
  const activeTypeTab = priceFilter || typeFilter || "";

  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="font-serif text-4xl font-black text-[#171717] md:text-5xl">
          Explore African Culture
        </h1>
        <p className="mt-2 text-gray-500">
          Books, music, videos, and more — directly from African creators.
        </p>
        <p className="mt-1 text-sm font-semibold text-[#1a4731]">
          {loading ? "Loading…" : `Showing ${items.length} of ${total} items`}
        </p>

        {/* Category tabs — sticky, horizontal scroll */}
        <div className="sticky top-[72px] z-30 -mx-4 mt-6 overflow-x-auto bg-white px-4 pb-3 pt-2 sm:-mx-6 sm:px-6">
          <div className="flex min-w-max gap-6 border-b border-gray-100">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setParam("category", tab.value)}
                className={`whitespace-nowrap pb-2 text-sm font-semibold transition ${
                  category === tab.value
                    ? "border-b-2 border-[#FFBF00] text-[#FFBF00]"
                    : "text-gray-400 hover:text-[#171717]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type/price filter row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => {
            const val = f.value;
            const isActive = val === "" ? activeTypeTab === "" : val === priceFilter || val === typeFilter;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setParam("type", f.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#FFBF00] bg-[#FFBF00] text-[#171717]"
                    : "border-gray-200 text-gray-500 hover:border-[#171717]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>

        {!loading && items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-bold text-[#171717]">No content found.</p>
            <p className="mt-2 text-gray-500">Try a different category or filter.</p>
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </main>
    }>
      <ExploreContent />
    </Suspense>
  );
}
