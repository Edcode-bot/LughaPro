"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { BackButton } from "@/components/ui/BackButton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { PurchaseFlow } from "@/components/web3/PurchaseFlow";
import { canAccessContent } from "@/lib/access";
import { contentTypeLabel, initials, isFreeContent } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { useHasPurchased } from "@/hooks/useContracts";
import { usePurchases } from "@/hooks/usePurchases";
import { useToast } from "@/components/ui/Toast";
import { ContentItem } from "@/types";

type ApiResponse = { data?: ContentItem; error?: string | null };

export function LearnDetailClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const { address, isConnected } = useAuth();
  const { purchaseIds, recordPurchase } = usePurchases();
  const { toast } = useToast();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { data: onChainPurchased } = useHasPurchased(
    address as `0x${string}` | undefined,
    id,
  );

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
          setItem(null);
        } else {
          setItem(result.data);
        }
      })
      .catch(() => setError("Unable to load content."))
      .finally(() => setLoading(false));
  }, [id, typeParam]);

  const free = item ? isFreeContent(item) : false;
  const hasAccess =
    item &&
    (free ||
      canAccessContent(item, purchaseIds) ||
      onChainPurchased === true);

  const creator = item?.author?.full_name ?? "Creator";
  const creatorWallet = item?.author?.wallet_address?.toLowerCase();
  const validCreator =
    creatorWallet && isAddress(creatorWallet) ? (creatorWallet as `0x${string}`) : null;

  async function handleReadNow() {
    if (!item) return;
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }
    if (item.type === "post") {
      setShowContent(true);
      await recordPurchase(item);
      return;
    }
    if (item.file_url) {
      await recordPurchase(item);
      window.open(item.file_url, "_blank", "noopener,noreferrer");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-8 w-32 rounded bg-forest/10" />
          <div className="mt-6 aspect-video rounded-2xl bg-forest/10" />
          <div className="mt-6 h-10 w-2/3 rounded bg-forest/10" />
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
            Back to library
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-off-white">
        <NavBar />
        <FadeIn className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
          <BackButton href="/learn" />

          <div className="relative mt-6 w-full overflow-hidden rounded-2xl" style={{ maxHeight: 400 }}>
            {item.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="max-h-[400px] w-full object-cover"
                style={{ maxHeight: 400 }}
              />
            ) : (
              <div
                className="flex h-56 w-full items-center justify-center text-6xl sm:h-72"
                style={{
                  background:
                    item.type === "post"
                      ? "linear-gradient(135deg, #FFBF00, #ff8c00)"
                      : "linear-gradient(135deg, #1a4731, #2d6a4f)",
                }}
              >
                {item.type === "post" ? "📝" : "📚"}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-foreground">
              {contentTypeLabel(item.type)}
            </span>
            {item.level ? (
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
                {item.level}
              </span>
            ) : null}
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                free ? "bg-jade text-white" : "bg-off-white text-forest ring-1 ring-forest/15"
              }`}
            >
              {free ? "Free" : `$${Number(item.price).toFixed(2)}`}
            </span>
          </div>

          <h1 className="mt-6 font-serif text-3xl font-black text-forest sm:text-4xl">{item.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            {item.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.author.avatar_url}
                alt={creator}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-sm font-bold text-white">
                {initials(creator)}
              </span>
            )}
            <div>
              <p className="font-bold text-forest">{creator}</p>
              {item.author_id ? (
                <Link href={`/tutor/${item.author_id}`} className="text-sm font-semibold text-jade hover:underline">
                  View creator profile
                </Link>
              ) : null}
            </div>
          </div>

          {item.description ? (
            <p className="mt-6 leading-relaxed text-foreground/75">{item.description}</p>
          ) : null}

          <div className="mt-8">
            {free || hasAccess ? (
              <div className="space-y-4">
                {item.type === "post" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleReadNow()}
                      className="flex min-h-11 w-full items-center justify-center rounded-full bg-jade px-6 py-3 font-bold text-white"
                    >
                      Read Now
                    </button>
                    {showContent && item.content ? (
                      <article className="prose max-w-none rounded-2xl bg-white p-6 shadow-sm">
                        <div className="whitespace-pre-wrap text-foreground/85">{item.content}</div>
                      </article>
                    ) : null}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleReadNow()}
                    disabled={!item.file_url}
                    className="flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-6 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {item.file_url ? "Download" : "File not available"}
                  </button>
                )}
              </div>
            ) : validCreator ? (
              <PurchaseFlow
                contentId={item.id}
                contentTitle={item.title}
                contentType={item.type}
                creatorAddress={validCreator}
                priceUSD={Number(item.price)}
                onSuccess={() => {
                  void recordPurchase(item);
                  toast({ title: "Purchase complete!", type: "success" });
                  if (item.type === "post") setShowContent(true);
                }}
              />
            ) : (
              <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Creator wallet unavailable for purchases.</p>
            )}

            {!isConnected && !free ? (
              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full border-2 border-forest font-bold text-forest"
              >
                Connect wallet to purchase
              </button>
            ) : null}
          </div>
        </FadeIn>
        <Footer />
        <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </main>
    </ErrorBoundary>
  );
}
