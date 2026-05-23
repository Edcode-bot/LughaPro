"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const links = [
  { label: "Find Tutors", href: "/search" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Become a Tutor", href: "/auth/register?role=tutor" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((response) => {
        if (active) setHasSession(response.ok);
      })
      .catch(() => {
        if (active) setHasSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-off-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="inline-flex items-center">
          <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-9 w-auto" priority />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-semibold text-forest/75 transition hover:text-jade">
              {link.label}
            </Link>
          ))}
          {hasSession || isConnected ? <Link href="/dashboard" className="text-sm font-semibold text-forest/75 transition hover:text-jade">Dashboard</Link> : null}
        </div>
        <div className="hidden md:block">
          <ConnectButton />
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
            <Link key={link.label} href={link.href} className="font-semibold text-forest" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {hasSession || isConnected ? <Link href="/dashboard" className="font-semibold text-forest" onClick={() => setOpen(false)}>Dashboard</Link> : null}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

