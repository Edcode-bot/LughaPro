"use client";

import clsx from "clsx";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { SearchOverlay } from "@/components/ui/SearchOverlay";
import { initials } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";

const publicLinks = [
  { label: "Learn", href: "/learn" },
  { label: "Find Tutors", href: "/tutors" },
  { label: "How It Works", href: "/#how-it-works" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { isConnected, displayName, disconnect } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-forest/10 bg-white shadow-sm">
        <nav className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image src="/logo.png" alt="LughaPro" width={140} height={40} className="h-10 w-auto" priority />
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-semibold text-forest/80 hover:text-forest">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-forest hover:bg-off-white"
            >
              <Search className="h-5 w-5" />
            </button>

            {isConnected ? (
              <>
                <Link href="/library" className="text-sm font-semibold text-forest/80 hover:text-forest">
                  Library
                </Link>
                <NotificationBell />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-full bg-off-white px-3 py-2"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-xs font-bold text-foreground">
                      {initials(displayName)}
                    </span>
                    <ChevronDown className="h-4 w-4 text-forest" />
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-forest/10 bg-white p-2 shadow-lg">
                      {[
                        ["Dashboard", "/dashboard"],
                        ["Wallet", "/wallet"],
                        ["Settings", "/settings"],
                      ].map(([label, href]) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-forest hover:bg-off-white"
                        >
                          {label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          disconnect()
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground/70 hover:bg-off-white"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-forest hover:bg-off-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-foreground hover:bg-[#e6ac00]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-forest" />
          </button>
        </nav>
      </header>

      <div
        className={clsx(
          "fixed inset-0 z-[110] bg-white transition md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-5">
          <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-9 w-auto" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-semibold text-forest">
              {link.label}
            </Link>
          ))}
          {isConnected ? (
            <>
              <Link href="/library" onClick={() => setOpen(false)}>Library</Link>
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/wallet" onClick={() => setOpen(false)}>Wallet</Link>
            </>
          ) : (
            <button type="button" onClick={() => { setOpen(false); setWalletOpen(true) }} className="rounded-full bg-gold px-6 py-3 font-bold text-foreground">
              Get Started
            </button>
          )}
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
