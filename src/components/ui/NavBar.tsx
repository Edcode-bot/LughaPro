"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = ["Find Tutors", "How it Works", "Pricing"];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-off-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="font-serif text-2xl font-black tracking-tight text-forest">
          Lugha<span className="text-gold">Pro</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link}
              href={link === "Find Tutors" ? "#tutors" : link === "Pricing" ? "#pricing" : "#how-it-works"}
              className="text-sm font-semibold text-forest/75 transition hover:text-jade"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="hidden md:block">
          {mounted ? <ConnectButton /> : <div className="h-10 w-36 rounded-full bg-gold/20" />}
        </div>
        <button
          aria-label="Toggle menu"
          className="rounded-full border border-forest/10 p-2 text-forest md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      <div className={clsx("border-t border-forest/10 bg-off-white px-5 py-4 md:hidden", open ? "block" : "hidden")}>
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link}
              href={link === "Find Tutors" ? "#tutors" : link === "Pricing" ? "#pricing" : "#how-it-works"}
              className="font-semibold text-forest"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
          {mounted ? <ConnectButton /> : <div className="h-10 w-36 rounded-full bg-gold/20" />}
        </div>
      </div>
    </header>
  );
}
