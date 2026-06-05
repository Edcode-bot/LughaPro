"use client";

import Link from "next/link";
import { contentTypeLabel, initials, isFreeContent } from "@/lib/content";
import { ContentItem } from "@/types";

type ContentCardProps = {
  item: ContentItem;
  compact?: boolean;
};

export function ContentCard({ item }: ContentCardProps) {
  const free = isFreeContent(item);
  const creator = item.author?.full_name ?? "Creator";
  const href = `/learn/${item.id}?type=${item.type}`;

  return (
    <Link
      href={href}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
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
          <div
            className="h-40 w-full rounded-t-2xl"
            style={{
              background:
                item.type === "post"
                  ? "linear-gradient(135deg, #FFBF00, #e6ac00)"
                  : "linear-gradient(135deg, #1a4731, #2d6a4f)",
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-forest">
          {contentTypeLabel(item.type)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold text-forest group-hover:text-jade">{item.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">
            {initials(creator)}
          </span>
          <span className="truncate text-sm text-foreground/60">{creator}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className={`text-sm font-bold ${free ? "text-jade" : "text-forest"}`}>
            {free ? "Free" : `$${Number(item.price).toFixed(2)}`}
          </span>
          <span className="inline-flex min-h-11 items-center rounded-full bg-gold px-4 py-2 text-xs font-bold text-foreground">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
