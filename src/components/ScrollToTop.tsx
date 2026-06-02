"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? ("instant" as ScrollBehavior) : "auto" });
  }, [pathname]);

  return null;
}
