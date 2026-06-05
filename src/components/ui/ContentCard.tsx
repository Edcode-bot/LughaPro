"use client";

import Link from "next/link";
import { categoryColor, categoryTextColor, contentTypeLabel, isFreeContent } from "@/lib/content";
import { ContentItem } from "@/types";

type ContentCardProps = {
  item: ContentItem;
  compact?: boolean;
};

function actionLabel(item: ContentItem): string {
  if (item.type === "video") return "Watch"
  if (item.type === "music") return "Listen"
  if (isFreeContent(item)) return "Read Free"
  return "Get Access"
}

export function ContentCard({ item }: ContentCardProps) {
  const free = isFreeContent(item);
  const creator = item.author?.full_name ?? "Creator";
  const href = `/learn/${item.id}?type=${item.type}`;
  const bg = categoryColor(item.category);
  const fg = categoryTextColor(item.category);

  return (
    <Link
      href={href}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-[#FFBF00]"
    >
      {/* Cover */}
      <div className="relative h-48 w-full overflow-hidden">
        {item.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover_image_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-end p-4"
            style={{ background: bg }}
          >
            <p
              className="line-clamp-2 font-serif text-lg font-black leading-snug"
              style={{ color: fg }}
            >
              {item.title}
            </p>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#171717]">
          {contentTypeLabel(item.type)}
        </span>
        {item.category ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-[#1a4731]">
            {item.category}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {item.cover_image_url ? (
          <h3 className="line-clamp-2 font-bold text-[#171717] group-hover:text-[#1a4731]">{item.title}</h3>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1a4731] text-[10px] font-bold text-white">
            {creator.slice(0, 2).toUpperCase()}
          </span>
          <span className="truncate text-sm text-gray-500">{creator}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className={`text-sm font-black ${free ? "text-[#1a4731]" : "text-[#171717]"}`}>
            {free ? "Free" : `${Number(item.price).toFixed(2)} cUSD`}
          </span>
          <span className="inline-flex rounded-full bg-[#FFBF00] px-4 py-1.5 text-xs font-bold text-[#171717]">
            {actionLabel(item)}
          </span>
        </div>
      </div>
    </Link>
  );
}
