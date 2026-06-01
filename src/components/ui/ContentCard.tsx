"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { isAddress } from "viem";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { PurchaseFlow } from "@/components/web3/PurchaseFlow";
import { contentCoverEmoji, contentCoverStyle, contentTypeLabel, initials, isFreeContent } from "@/lib/content";
import { canAccessContent } from "@/lib/access";
import { ContentItem } from "@/types";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHasPurchased } from "@/hooks/useContracts";

type ContentCardProps = {
  item: ContentItem;
  purchased?: boolean;
  purchaseIds?: string[];
  onAccess?: (item: ContentItem) => void;
  onPurchaseSuccess?: (item: ContentItem) => void | Promise<void>;
  compact?: boolean;
};

function getCreatorWallet(item: ContentItem): `0x${string}` | null {
  const wallet = item.author?.wallet_address?.toLowerCase();
  if (wallet && isAddress(wallet)) return wallet as `0x${string}`;
  return null;
}

export function ContentCard({
  item,
  purchased = false,
  purchaseIds = [],
  onAccess,
  onPurchaseSuccess,
  compact = false,
}: ContentCardProps) {
  const { address, isConnected } = useAuth();
  const [walletOpen, setWalletOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [localPurchased, setLocalPurchased] = useState(false);

  const { data: onChainPurchased } = useHasPurchased(
    address as `0x${string}` | undefined,
    item.id,
  );

  const free = isFreeContent(item);
  const hasPurchased =
    purchased ||
    localPurchased ||
    canAccessContent(item, purchaseIds) ||
    onChainPurchased === true;

  const creator = item.author?.full_name ?? "Creator";
  const creatorWallet = getCreatorWallet(item);

  function handleClick() {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }
    if (free || hasPurchased) {
      onAccess?.(item);
      return;
    }
    if (!creatorWallet) return;
    setPurchaseOpen(true);
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
        <div className="relative overflow-hidden rounded-t-2xl">
          {item.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image_url}
              alt={item.title}
              loading="lazy"
              className="h-40 w-full object-cover rounded-t-2xl"
            />
          ) : (
            <div className={`flex h-40 w-full items-center justify-center rounded-t-2xl ${contentCoverStyle(item.type)}`}>
              <span className="text-4xl">{contentCoverEmoji(item.type)}</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-forest">
            {contentTypeLabel(item.type)}
          </span>
          {onChainPurchased && !free ? (
            <span className="absolute right-3 top-3 rounded-full bg-jade/90 px-2.5 py-1 text-[10px] font-bold text-white">
              On-chain ✓
            </span>
          ) : null}
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
              <button
                type="button"
                onClick={handleClick}
                disabled={isConnected && !free && !hasPurchased && !creatorWallet}
                className={`rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50 ${buttonClass}`}
              >
                {!creatorWallet && isConnected && !free && !hasPurchased ? "Unavailable" : buttonLabel}
              </button>
            )}
          </div>
        </div>
      </article>

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />

      <AnimatePresence>
        {purchaseOpen && creatorWallet ? (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPurchaseOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPurchaseOpen(false)}
                className="absolute -right-1 -top-1 z-10 rounded-full bg-white p-2 text-forest shadow"
              >
                <X className="h-4 w-4" />
              </button>
              <PurchaseFlow
                contentId={item.id}
                contentTitle={item.title}
                contentType={item.type}
                creatorAddress={creatorWallet}
                priceUSD={Number(item.price)}
                onSuccess={() => {
                  setLocalPurchased(true);
                  void onPurchaseSuccess?.(item);
                  setPurchaseOpen(false);
                  onAccess?.(item);
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
