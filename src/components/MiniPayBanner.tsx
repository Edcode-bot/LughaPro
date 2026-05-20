"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { isMiniPay } from "@/lib/minipay";

const MINIPAY_URL = "https://minipay.opera.com/";

export function MiniPayBanner() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const dismissed = sessionStorage.getItem("lughapro-minipay-banner-dismissed") === "true";
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    return !dismissed && mobile && !isMiniPay();
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      const dismissed = sessionStorage.getItem("lughapro-minipay-banner-dismissed") === "true";
      setShow(!dismissed && media.matches && !isMiniPay());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function dismiss() {
    sessionStorage.setItem("lughapro-minipay-banner-dismissed", "true");
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="fixed inset-x-0 top-0 z-[70] bg-gold px-4 py-3 text-forest shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <p className="flex-1 text-sm font-black">Get the best experience — open LughaPro in MiniPay</p>
            <a href={MINIPAY_URL} className="rounded-full bg-forest px-4 py-2 text-xs font-black text-cream">Open in MiniPay</a>
            <button onClick={dismiss} aria-label="Dismiss MiniPay banner"><X className="h-5 w-5" /></button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
