"use client";

import Link from "next/link";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { contentCoverEmoji, contentCoverStyle, contentTypeLabel, initials, isFreeContent } from "@/lib/content";
import { canAccessContent } from "@/lib/access";
import { ContentItem } from "@/types";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type ContentCardProps = {
  item: ContentItem;
  purchased?: boolean;
  purchaseIds?: string[];
  onAccess?: (item: ContentItem) => void;
  compact?: boolean;
};

export function ContentCard({
  item,
  purchased = false,
  purchaseIds = [],
  onAccess,
  compact = false,
}: ContentCardProps) {
  const { isConnected } = useAuth();
  const [walletOpen, setWalletOpen] = useState(false);
  const free = isFreeContent(item);
  const hasPurchased = purchased || canAccessContent(item, purchaseIds);
  const creator = item.author?.full_name ?? "Creator";

  function handleClick() {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }
    onAccess?.(item);
  }

  let buttonLabel = "Connect Wallet";
  let buttonClass = "bg-off-white text-forest ring-1 ring-forest/15";

  if (isConnected) {
    if (free) {
      buttonLabel = "Read Free";
      buttonClass = "bg-jade text-white";
    } else if (hasPurchased) {
      buttonLabel = item.type === "book" ? "Read Now" : "Open";
      buttonClass = "bg-forest text-white";
    } else {
      buttonLabel = `Get Access - $${Number(item.price).toFixed(2)}`;
      buttonClass = "bg-gold text-foreground hover:bg-[#e6ac00]";
    }
  }

  return (
    <>
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className={`relative ${compact ? "h-32" : "h-[150px]"} overflow-hidden`}>
          {item.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.cover_image_url} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full items-center justify-center ${contentCoverStyle(item.type)}`}>
              <span className="text-4xl">{contentCoverEmoji(item.type)}</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-forest">
            {contentTypeLabel(item.type)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-bold text-forest">{item.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">
              {initials(creator)}
            </span>
            <span className="text-sm text-foreground/60">{creator}</span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className={`text-sm font-bold ${free ? "text-jade" : "text-forest"}`}>
              {free ? "Free" : `$${Number(item.price).toFixed(2)}`}
            </span>
            {isConnected && hasPurchased && item.file_url ? (
              <Link href={item.file_url} target="_blank" className={`rounded-full px-4 py-2 text-xs font-bold ${buttonClass}`}>
                {buttonLabel}
              </Link>
            ) : (
              <button type="button" onClick={handleClick} className={`rounded-full px-4 py-2 text-xs font-bold ${buttonClass}`}>
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      </article>
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
