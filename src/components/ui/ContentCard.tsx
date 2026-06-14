"use client";

import Link from "next/link";
import { isFreeContent } from "@/lib/content";
import { ContentItem } from "@/types";

type ContentCardProps = {
  item: ContentItem;
  compact?: boolean;
};

function actionLabel(item: ContentItem): string {
  if (item.type === "video") return "Watch";
  if (item.type === "music") return "Listen";
  if (isFreeContent(item)) return "Read Free";
  return "Get Access";
}

function getCategoryBg(category: string): string {
  const map: Record<string, string> = {
    language: "bg-[#1a4731]",
    music: "bg-[#171717]",
    arts: "bg-[#FFBF00]",
    literature: "bg-[#2d6a4f]",
    video: "bg-[#171717]",
    experience: "bg-[#1a4731]",
  };
  return map[category] ?? "bg-[#171717]";
}

export function ContentCard({ item }: ContentCardProps) {
  const free = isFreeContent(item);
  const creator = item.author?.full_name ?? "Creator";
  const href = `/learn/${item.id}?type=${item.type}`;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-300 hover:border-[#FFBF00] hover:shadow-xl hover:shadow-[#FFBF00]/10 hover:-translate-y-1">
      {/* Cover */}
      <div className={`h-48 w-full relative overflow-hidden ${!item.cover_image_url ? getCategoryBg(item.category ?? "") : ""}`}>
        {item.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover_image_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-end p-4">
            <span className="text-white font-bold text-lg line-clamp-2">{item.title}</span>
          </div>
        )}
        {/* Price badge overlay */}
        <div className="absolute top-3 right-3">
          {free ? (
            <span className="rounded-full bg-[#1a4731] px-3 py-1 text-xs font-bold text-white">Free</span>
          ) : (
            <span className="rounded-full bg-[#171717]/80 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
              {Number(item.price).toFixed(2)} cUSD
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-[#f8f4ef] px-2.5 py-0.5 text-xs font-semibold text-[#1a4731] capitalize">{item.type}</span>
          {item.category && (
            <span className="rounded-full bg-[#f8f4ef] px-2.5 py-0.5 text-xs font-semibold text-gray-500 capitalize">{item.category}</span>
          )}
        </div>
        <h3 className="font-bold text-[#171717] line-clamp-2 leading-snug">{item.title}</h3>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#1a4731] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {creator.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm text-gray-500 truncate">{creator}</span>
        </div>
        <Link
          href={href}
          className="mt-4 block w-full rounded-full bg-[#FFBF00] py-2.5 text-center text-sm font-black text-[#171717] hover:bg-[#e6ac00] transition-colors"
        >
          {actionLabel(item)}
        </Link>
      </div>
    </div>
  );
}
