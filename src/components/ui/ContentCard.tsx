"use client";

import Link from "next/link";
import { contentCoverEmoji, contentCoverStyle, contentTypeLabel, initials, isFreeContent } from "@/lib/content";
import { ContentItem } from "@/types";

type ContentCardProps = {
  item: ContentItem;
  purchased?: boolean;
  onAccess?: (item: ContentItem) => void;
  compact?: boolean;
};

export function ContentCard({ item, purchased = false, onAccess, compact = false }: ContentCardProps) {
  const free = isFreeContent(item)
  const creator = item.author?.full_name ?? "Creator"

  return (
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
          {purchased ? (
            <Link
              href={item.file_url ?? `/learn?content=${item.id}`}
              className="rounded-full bg-jade px-4 py-2 text-xs font-bold text-white"
            >
              {item.type === "book" ? "Read Now" : "Open"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onAccess?.(item)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                free ? "bg-jade text-white" : "bg-gold text-foreground hover:bg-[#e6ac00]"
              }`}
            >
              {free ? "Get Access" : "Get Access"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
