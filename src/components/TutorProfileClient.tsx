"use client";

import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { ContentCard } from "@/components/ui/ContentCard";
import { ContentPreview } from "@/components/ContentPreview";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { StarRating } from "@/components/ui/StarRating";
import { countryFlag, initials } from "@/lib/content";
import { canAccessContent } from "@/lib/access";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { ContentItem, TutorWithProfile } from "@/types";

type ApiResponse<T> = { data: T | null; error: string | null };

export function TutorProfileClient({ id }: { id: string }) {
  const { address, isConnected } = useAuth();
  const { purchaseIds, recordPurchase } = usePurchases();
  const [tutor, setTutor] = useState<TutorWithProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [tab, setTab] = useState<"books" | "posts" | "about">("books");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/tutors/${id}`).then((response) => response.json() as Promise<ApiResponse<TutorWithProfile>>),
      fetch(`/api/content?author_id=${id}&limit=50`).then((response) => response.json() as Promise<ApiResponse<{ items: ContentItem[] }>>),
    ])
      .then(([tutorResult, contentResult]) => {
        if (!active) return;
        if (tutorResult.error || !tutorResult.data) setError(tutorResult.error ?? "Creator not found");
        else setTutor(tutorResult.data);
        setContent(contentResult.data?.items ?? []);
      })
      .catch(() => active && setError("Unable to load creator profile."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleAccess(item: ContentItem) {
    if (!address) {
      setWalletOpen(true);
      return;
    }
    if (canAccessContent(item, purchaseIds)) {
      await recordPurchase(item);
      if (item.file_url) window.open(item.file_url, "_blank");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="h-96 animate-pulse rounded-3xl bg-cream" />
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <p className="mx-auto max-w-3xl px-5 py-20 text-red-700">{error ?? "Creator not found"}</p>
      </main>
    );
  }

  const name = tutor.profile?.full_name ?? "Creator";
  const country = tutor.profile?.country ?? tutor.location ?? "East Africa";
  const books = content.filter((item) => item.type === "book" || item.type === "lesson");
  const posts = content.filter((item) => item.type === "post");
  const topCreator = Number(tutor.rating) >= 4.8;

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-off-white">
      <NavBar />
        <FadeIn className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <BackButton href="/tutors" />
        </FadeIn>
        <FadeIn>
          <section className="bg-forest px-4 py-14 text-cream sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center">
              {tutor.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tutor.profile.avatar_url}
                  alt={name}
                  loading="lazy"
                  className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-gold/40"
                />
              ) : (
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gold text-3xl font-black text-foreground">
                  {initials(name)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {tutor.is_verified ? <span className="rounded-full bg-jade/20 px-3 py-1 text-xs font-bold">✓ Verified</span> : null}
                  {topCreator ? <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold">★ Top Creator</span> : null}
                </div>
                <h1 className="mt-3 font-serif text-5xl font-black">{name}</h1>
                <p className="mt-2 text-cream/80">{countryFlag(country)} {country}</p>
                <div className="mt-4">
                  <StarRating rating={Number(tutor.rating ?? 0)} />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-4">
                  {[
                    ["Total Content", String(content.length)],
                    ["Total Learners", String(tutor.review_count ?? 0)],
                    ["Rating", Number(tutor.rating ?? 0).toFixed(1)],
                    ["Member Since", new Date(tutor.created_at).getFullYear().toString()],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs text-cream/60">{label}</p>
                      <p className="text-xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 max-w-3xl leading-relaxed text-cream/85">
                  {tutor.bio ?? tutor.profile?.bio ?? "Premium Kiswahili creator."}
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <div className="flex gap-2">
              {[
                ["books", "Books"],
                ["posts", "Posts"],
                ["about", "About"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key as typeof tab)}
                  className={`rounded-full px-5 py-2 text-sm font-bold ${
                    tab === key ? "bg-gold text-foreground" : "bg-white text-forest"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "books" ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {books.length === 0 ? (
                  <p className="text-foreground/60">No books published yet.</p>
                ) : (
                  books.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))
                )}
              </div>
            ) : null}

            {tab === "posts" ? (
              <div className="mt-8 grid gap-4">
                {posts.length === 0 ? (
                  <p className="text-foreground/60">No posts published yet.</p>
                ) : (
                  posts.map((item) => {
                    const unlocked = canAccessContent(item, purchaseIds);
                    return (
                      <article key={item.id} className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-forest">{item.title}</h3>
                        {unlocked ? (
                          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.content}</p>
                        ) : (
                          <ContentPreview
                            item={item}
                            onUnlock={() => {
                              if (!isConnected) setWalletOpen(true);
                              else void handleAccess(item);
                            }}
                          />
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            ) : null}

            {tab === "about" ? (
              <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-black text-forest">About {name}</h2>
                <p className="mt-4 leading-relaxed text-foreground/75">
                  {tutor.profile?.bio ?? tutor.bio ?? "This creator designs Kiswahili content for learners across Africa."}
                </p>
                <p className="mt-4 text-sm font-semibold text-forest">
                  Languages: {(tutor.languages ?? tutor.profile?.languages ?? ["Kiswahili"]).join(", ")}
                </p>
                <p className="mt-2 text-sm text-foreground/60">
                  Teaching focus: {tutor.specialty ?? "General Kiswahili"}
                </p>
              </div>
            ) : null}
          </section>
        </FadeIn>
      <Footer />
        <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
    </ErrorBoundary>
  );
}
