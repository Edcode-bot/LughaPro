"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { PurchaseFlow } from "@/components/web3/PurchaseFlow";
import { initials, isFreeContent } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { ContentItem } from "@/types";

type ApiResponse = { data?: ContentItem; error?: string | null };
type CheckResponse = {
  purchased: boolean
  tx_hash: string | null
  payment_method: string | null
  purchased_at: string | null
};

/** First N sentences of a string */
function excerpt(text: string, sentences = 2) {
  const parts = text.match(/[^.!?]+[.!?]+/g) ?? []
  return parts.slice(0, sentences).join(" ").trim() || text.slice(0, 200)
}

export function LearnDetailClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const { address, isConnected } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  // null = still checking, false = not purchased, true = purchased
  const [purchased, setPurchased] = useState<boolean | null>(null);
  const [purchaseTxHash, setPurchaseTxHash] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  // Load content
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (typeParam) params.set("type", typeParam);
    fetch(`/api/content/${id}?${params.toString()}`)
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((result) => {
        if (result.error || !result.data) {
          setError(result.error ?? "Content not found");
        } else {
          setItem(result.data);
        }
      })
      .catch(() => setError("Unable to load content."))
      .finally(() => setLoading(false));
  }, [id, typeParam]);

  // Check purchase status whenever address or item changes
  useEffect(() => {
    if (!item) return;
    const free = isFreeContent(item);
    if (free) {
      setPurchased(true);
      setShowFullContent(true);
      return;
    }
    if (!address) {
      setPurchased(false);
      return;
    }
    fetch(`/api/purchases/check?content_id=${item.id}&wallet=${address}`)
      .then((r) => r.json() as Promise<CheckResponse>)
      .then((result) => {
        setPurchased(result.purchased);
        if (result.purchased) {
          setPurchaseTxHash(result.tx_hash);
          setShowFullContent(true);
        }
      })
      .catch(() => setPurchased(false));
  }, [item, address]);

  function handlePurchaseSuccess(txHash?: string) {
    setPurchased(true);
    if (txHash) setPurchaseTxHash(txHash);
    setShowFullContent(true);
    toast({ title: "Access granted! ✓", type: "success" });
  }

  async function handleDownload() {
    if (!item?.file_url) return;
    window.open(item.file_url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-5 w-32 rounded bg-forest/10" />
          <div className="mt-6 h-72 w-full rounded-2xl bg-forest/10" />
          <div className="mt-6 h-10 w-2/3 rounded bg-forest/10" />
          <div className="mt-3 h-4 w-1/2 rounded bg-forest/10" />
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-red-700">{error ?? "Content not found"}</p>
          <Link href="/learn" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-6 py-3 font-bold text-foreground">
            Back to Library
          </Link>
        </div>
      </main>
    );
  }

  const free = isFreeContent(item);
  const creator = item.author?.full_name ?? "Creator";
  const creatorWallet = item.author?.wallet_address?.toLowerCase();
  const validCreator =
    creatorWallet && isAddress(creatorWallet) ? (creatorWallet as `0x${string}`) : null;
  const hasAccess = purchased === true || showFullContent;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <FadeIn className="mx-auto max-w-3xl px-4 py-8 pb-20 sm:px-6 lg:px-8">

          {/* Clean back link — no big badge */}
          <Link href="/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-forest/60 hover:text-forest">
            ← Back to Content
          </Link>

          {/* Cover image */}
          <div className="mt-5 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
            {item.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    item.type === "post"
                      ? "linear-gradient(135deg, #FFBF00, #e6ac00)"
                      : "linear-gradient(135deg, #1a4731, #2d6a4f)",
                }}
              />
            )}
          </div>

          {/* Badges row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-foreground capitalize">
              {item.type}
            </span>
            {item.level ? (
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
                {item.level}
              </span>
            ) : null}
            {hasAccess ? (
              <span className="rounded-full bg-jade px-3 py-1 text-xs font-bold text-white">
                ✓ Purchased
              </span>
            ) : free ? (
              <span className="rounded-full bg-jade px-3 py-1 text-xs font-bold text-white">
                Free
              </span>
            ) : (
              <span className="rounded-full bg-off-white px-3 py-1 text-xs font-bold text-forest ring-1 ring-forest/15">
                {Number(item.price).toFixed(2)} cUSD
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-5 font-serif text-3xl font-black text-forest sm:text-4xl">{item.title}</h1>

          {/* Creator */}
          <div className="mt-4 flex items-center gap-3">
            {item.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.author.avatar_url}
                alt={creator}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-sm font-bold text-white">
                {initials(creator)}
              </span>
            )}
            <div>
              <p className="font-bold text-forest">{creator}</p>
              {item.author_id ? (
                <Link href={`/tutor/${item.author_id}`} className="text-sm font-semibold text-jade hover:underline">
                  View profile →
                </Link>
              ) : null}
            </div>
          </div>

          {/* Celoscan tx link — shown after purchase */}
          {hasAccess && purchaseTxHash ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-jade/10 px-4 py-2">
              <span className="text-sm font-semibold text-jade">Transaction confirmed on Celo blockchain ✓</span>
              <a
                href={`https://celoscan.io/tx/${purchaseTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-forest underline"
              >
                View on Celoscan ↗
              </a>
            </div>
          ) : null}

          {/* ——— LOCKED PREVIEW (paid, not purchased) ——— */}
          {!hasAccess && !free ? (
            <div className="mt-6">
              {/* Description / excerpt */}
              {item.description ? (
                <p className="leading-relaxed text-foreground/70">
                  {item.description.slice(0, 150)}{item.description.length > 150 ? "…" : ""}
                </p>
              ) : null}

              {/* Post preview: first 2 sentences, then blur */}
              {item.type === "post" && item.content ? (
                <div className="relative mt-4 overflow-hidden rounded-xl bg-white p-5">
                  <p className="text-foreground/80">{excerpt(item.content, 2)}</p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
                </div>
              ) : null}

              {/* Purchase gate */}
              <div className="mt-6">
                {!isConnected ? (
                  <div className="rounded-2xl border-2 border-forest/10 bg-white p-6 text-center">
                    <p className="font-serif text-lg font-bold text-forest">Connect your wallet to unlock this content</p>
                    <button
                      type="button"
                      onClick={() => setWalletOpen(true)}
                      className="mt-4 inline-flex rounded-full bg-gold px-8 py-3 font-black text-foreground"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : validCreator ? (
                  <PurchaseFlow
                    contentId={item.id}
                    contentTitle={item.title}
                    contentType={item.type}
                    creatorAddress={validCreator}
                    priceUSD={Number(item.price)}
                    onSuccess={handlePurchaseSuccess}
                  />
                ) : (
                  <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                    Creator wallet unavailable — cannot process purchase.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* ——— FULL CONTENT (free or purchased) ——— */}
          {hasAccess ? (
            <div className="mt-6">
              {item.description && !item.content ? (
                <p className="leading-relaxed text-foreground/75">{item.description}</p>
              ) : null}

              {item.type === "post" && item.content ? (
                <article className="prose prose-forest max-w-none rounded-2xl bg-white p-6 shadow-sm">
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/85">{item.content}</div>
                </article>
              ) : null}

              {(item.type === "book" || item.type === "lesson") ? (
                <div className="mt-2 rounded-2xl bg-white p-6 shadow-sm">
                  {item.description ? (
                    <p className="leading-relaxed text-foreground/75">{item.description}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    disabled={!item.file_url}
                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {item.file_url ? "⬇ Download Book" : "File not available"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

        </FadeIn>
        <Footer />
        <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </main>
    </ErrorBoundary>
  );
}
