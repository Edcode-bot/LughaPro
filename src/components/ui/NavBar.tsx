"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Find Tutors", href: "/search" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { isConnected, displayName, disconnect } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-white">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center">
          <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-9 w-auto" priority />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-forest/80 transition hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isConnected ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-forest/80 hover:text-forest">
                Dashboard
              </Link>
              <span className="rounded-full bg-off-white px-4 py-2 text-sm font-bold text-forest">{displayName}</span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-sm font-semibold text-forest/70 hover:text-forest"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-foreground transition hover:bg-[#e6ac00]"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-full border border-forest/10 p-2 text-forest md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={clsx(
          "overflow-hidden border-t border-forest/10 bg-white transition-all duration-300 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-col gap-4 px-5 py-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-semibold text-forest"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isConnected ? (
            <>
              <Link href="/dashboard" className="font-semibold text-forest" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-left font-semibold text-forest/70"
              >
                Disconnect {displayName}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setWalletOpen(true);
              }}
              className="rounded-full bg-gold px-6 py-3 font-bold text-foreground"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
}
