"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-forest hover:bg-off-white"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
