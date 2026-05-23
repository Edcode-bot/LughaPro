"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Find Tutors", href: "/search" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Become a Tutor", href: "/#connect" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { isConnected, displayName, disconnect } = useAuth();

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
          {isConnected ? <Link href="/dashboard" className="text-sm font-semibold text-forest/75 transition hover:text-jade">Dashboard</Link> : null}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {isConnected ? (
            <>
              <span className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-forest">{displayName}</span>
              <Button size="sm" variant="secondary" onClick={() => disconnect()}>Disconnect</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setWalletOpen(true)}>Connect Wallet</Button>
          )}
        </div>
        <button aria-label="Toggle menu" className="rounded-full border border-forest/10 p-2 text-forest md:hidden" onClick={() => setOpen((value) => !value)}>
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
          {isConnected ? <Link href="/dashboard" className="font-semibold text-forest" onClick={() => setOpen(false)}>Dashboard</Link> : null}
          {isConnected ? <Button size="sm" variant="secondary" onClick={() => disconnect()}>Disconnect {displayName}</Button> : <Button size="sm" onClick={() => setWalletOpen(true)}>Connect Wallet</Button>}
        </div>
      </div>
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
}
