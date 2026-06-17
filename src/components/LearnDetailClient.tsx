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
import { categoryColor, initials, isFreeContent } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { ContentItem } from "@/types";

function getEmbedUrl(url: string): string {
  if (!url) return ''
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

type ApiResponse = { data?: ContentItem; error?: string | null };
type CheckResponse = {
  purchased: boolean
  tx_hash: string | null
  payment_method: string | null
  purchased_at: string | null
};

/** Render markdown images ![alt](url) as <img> elements, rest as text */
function renderContent(content: string) {
  const parts = content.split(/(\!\[.*?\]\(.*?\))/g)
  return parts.map((part, i) => {
    const imgMatch = part.match(/\!\[(.*?)\]\((.*?)\)/)
    if (imgMatch) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="my-4 w-full rounded-xl object-cover max-h-96" />
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}

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
  const [copied, setCopied] = useState(false);

  // Load content — type param is a hint for search order; API falls through all tables if not found
  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = typeParam
      ? `/api/content/${id}?type=${encodeURIComponent(typeParam)}`
      : `/api/content/${id}`;
    fetch(url)
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
  // Support both flat (detail API) and nested (legacy) shape
  const creator = item.creator_name ?? item.author?.full_name ?? "Creator";
  const rawWallet = item.creator_wallet_address ?? item.author?.wallet_address;
  const creatorWallet = rawWallet?.toLowerCase();
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

          {/* Cover image / solid color placeholder */}
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
                className="flex h-full w-full items-end p-6"
                style={{ background: categoryColor(item.category) }}
              >
                <p className="font-serif text-2xl font-black text-white">{item.title}</p>
              </div>
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
              {(item.author_id ?? item.creator_id) ? (
                <Link href={`/tutor/${item.author_id ?? item.creator_id}`} className="text-sm font-semibold text-jade hover:underline">
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

          {/* ——— SOCIAL SHARE ——— */}
          {(() => {
            const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
            const shareText = `Check out "${item.title}" on LughaPro`
            const shareLinks = {
              whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
              twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
              facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            }
            return (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-2">Share</span>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                  className="rounded-full bg-gray-100 hover:bg-green-100 p-2 transition-colors" title="Share on WhatsApp">
                  <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A7.85 7.85 0 0012.04 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 003.84.98h.003a7.94 7.94 0 007.93-7.93 7.9 7.9 0 00-2.37-5.63zm-5.56 12.2h-.003a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 01-1.01-3.5 6.6 6.6 0 016.6-6.6 6.55 6.55 0 014.67 1.94 6.55 6.55 0 011.93 4.67 6.6 6.6 0 01-6.6 6.6z"/></svg>
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="rounded-full bg-gray-100 hover:bg-blue-100 p-2 transition-colors" title="Share on X">
                  <svg className="h-4 w-4 text-[#171717]" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="rounded-full bg-gray-100 hover:bg-blue-100 p-2 transition-colors" title="Share on Facebook">
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="rounded-full bg-gray-100 hover:bg-amber-100 p-2 transition-colors" title="Copy link">
                  {copied ? (
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  )}
                </button>
                {copied && <span className="text-xs text-green-600 font-semibold">Copied!</span>}
              </div>
            )
          })()}

          {/* ——— LOCKED PREVIEW (paid, not yet purchased) ——— */}
          {!hasAccess && !free ? (
            <div className="mt-6">
              {/* Description only — never show actual content here */}
              {item.description && item.type !== "post" ? (
                <p className="leading-relaxed text-foreground/70">
                  {item.description.slice(0, 150)}{item.description.length > 150 ? "…" : ""}
                </p>
              ) : null}

              {/* Post preview: first 3 paragraphs fading out */}
              {item.type === "post" && item.content ? (
                <div className="relative mt-4 max-h-64 overflow-hidden rounded-xl bg-white p-5">
                  <div className="leading-relaxed text-foreground/80 space-y-3">
                    {item.content.split('\n').slice(0, 3).map((para, i) => (
                      <p key={i}>{para || ' '}</p>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent" />
                </div>
              ) : null}

              {/* Video locked state */}
              {item.type === "video" ? (
                <div className="relative mt-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[#171717]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <span className="text-3xl text-white">▶</span>
                  </div>
                  <div className="absolute inset-0 bg-[#171717]/50" />
                  <span className="absolute bottom-4 right-4 rounded-full border border-white/30 px-3 py-1 text-xs font-bold text-white">🔒 Locked</span>
                </div>
              ) : null}

              {/* Music locked state */}
              {item.type === "music" ? (
                <div className="relative mt-4 flex items-center gap-4 rounded-xl bg-[#171717] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-xl">♪</div>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-white/10" />
                    <p className="mt-2 text-xs text-white/40">🔒 Purchase to listen</p>
                  </div>
                </div>
              ) : null}

              {/* Unlock card */}
              <div className="mt-2 rounded-2xl border-2 border-[#FFBF00]/30 bg-[#fdf6e3] p-6 text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-serif text-xl font-black text-[#171717]">Unlock Full Access</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Continue reading &ldquo;{item.title}&rdquo; and support {creator}
                </p>
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => setWalletOpen(true)}
                    className="inline-flex rounded-full bg-[#FFBF00] px-8 py-3 font-black text-[#171717]"
                  >
                    Connect Wallet
                  </button>
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
                  <div className="leading-relaxed text-foreground/85">{renderContent(item.content)}</div>
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
                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1a4731] px-6 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {item.file_url ? "⬇ Download Book" : "File not available"}
                  </button>
                </div>
              ) : null}

              {/* Video player — supports both video_url (legacy) and file_url (new API) */}
              {item.type === "video" && (item.video_url ?? item.file_url) ? (
                <div className="mt-2 rounded-2xl overflow-hidden bg-black aspect-video">
                  {(() => {
                    const src = item.video_url ?? item.file_url ?? ''
                    return src.includes("youtube.com") || src.includes("youtu.be") || src.includes("vimeo.com") ? (
                      <iframe
                        src={getEmbedUrl(src)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={item.title}
                      />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video src={src} controls className="w-full h-full" />
                    )
                  })()}
                </div>
              ) : item.type === "video" ? (
                <p className="mt-4 text-foreground/60">Video file not available.</p>
              ) : null}

              {/* Audio player — supports both audio_url (legacy) and file_url (new API) */}
              {item.type === "music" && (item.audio_url ?? item.file_url) ? (
                <div className="mt-2 rounded-2xl bg-white p-6 shadow-sm">
                  {item.description ? (
                    <p className="mb-4 leading-relaxed text-foreground/75">{item.description}</p>
                  ) : null}
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio
                    src={item.audio_url ?? item.file_url ?? ''}
                    controls
                    className="w-full accent-[#FFBF00]"
                  />
                </div>
              ) : item.type === "music" ? (
                <p className="mt-4 text-foreground/60">Audio file not available.</p>
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
