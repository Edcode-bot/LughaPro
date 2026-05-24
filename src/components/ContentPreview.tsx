"use client";

import { Lock } from "lucide-react";
import { previewText } from "@/lib/content";
import { ContentItem } from "@/types";

type ContentPreviewProps = {
  item: ContentItem;
  onUnlock?: () => void;
};

export function ContentPreview({ item, onUnlock }: ContentPreviewProps) {
  if (item.type === "post" && item.content) {
    const preview = previewText(item.content, 0.2);
    return (
      <div className="relative mt-4 overflow-hidden rounded-xl bg-off-white p-4">
        <p className="text-sm leading-relaxed text-foreground/80">{preview}</p>
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent pb-6 pt-16">
          <div className="pointer-events-auto text-center">
            <Lock className="mx-auto h-8 w-8 text-forest" />
            <p className="mt-2 font-bold text-forest">Unlock Full Access</p>
            <p className="text-sm text-foreground/60">${Number(item.price).toFixed(2)}</p>
            <button
              type="button"
              onClick={onUnlock}
              className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground"
            >
              Get Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl bg-off-white p-6 text-center">
      <p className="font-bold text-forest">{item.title}</p>
      <p className="mt-2 text-sm text-foreground/65">{item.description}</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-forest">
        <Lock className="h-4 w-4" />
        Download Full Book — ${Number(item.price).toFixed(2)}
      </div>
      <button type="button" onClick={onUnlock} className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground">
        Unlock Full Access
      </button>
    </div>
  );
}
