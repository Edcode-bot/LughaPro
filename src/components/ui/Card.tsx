"use client";

import clsx from "clsx";
import { ReactNode } from "react";

type CardProps = {
  cream?: boolean;
  className?: string;
  children: ReactNode;
};

export function Card({ className, cream = false, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-forest/10 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        cream ? "bg-cream" : "bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
