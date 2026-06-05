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
import { shortenAddress } from "@/lib/minipay";
import { useAuth } from "@/hooks/useAuth";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { isConnected, displayName, address, role, disconnect } = useAuth();

  const publicLinks = [
    { label: "Learn", href: "/learn" },
    { label: "Find Tutors", href: "/tutors" },
    { label: "About", href: "/about" },
  ];

  const connectedLinks = [
    { label: "Learn", href: "/learn" },
    { label: "My Library", href: "/library" },
    { label: "Find Tutors", href: "/tutors" },
  ];

  const centerLinks = isConnected ? connectedLinks : publicLinks;

  const studentMenu = [
    ["Dashboard", "/dashboard"],
    ["Library", "/library"],
    ["Wallet", "/wallet"],
    ["Settings", "/settings"],
  ] as const;

  const tutorMenu = [
    ["Dashboard", "/dashboard"],
    ["My Content", "/my-content"],
    ["Earnings", "/earnings"],
    ["Settings", "/settings"],
  ] as const;

  const dropdownLinks = role === "tutor" ? tutorMenu : studentMenu;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-forest/10 bg-white shadow-sm">
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="LughaPro"
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-contain"
              priority
            />
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {centerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#171717] hover:text-[#1a4731]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="min-h-11 min-w-11 rounded-full p-2 text-forest hover:bg-off-white"
            >
              <Search className="h-5 w-5" />
            </button>

            {isConnected ? (
              <>
                <NotificationBell />
                <span className="hidden rounded-full bg-off-white px-3 py-1.5 text-xs font-bold text-forest lg:inline">
                  {address ? shortenAddress(address) : ""}
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex min-h-11 items-center gap-2 rounded-full bg-off-white px-3 py-2"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-xs font-bold text-foreground">
                      {initials(displayName)}
                    </span>
                    <ChevronDown className="h-4 w-4 text-forest" />
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-forest/10 bg-white p-2 shadow-lg">
                      {dropdownLinks.map(([label, href]) => (
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
                          setMenuOpen(false);
                          disconnect();
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
                  className="min-h-11 rounded-full px-4 py-2 text-sm font-semibold text-forest hover:bg-off-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="min-h-11 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-foreground hover:bg-[#e6ac00]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {!isConnected ? (
              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="min-h-11 rounded-full bg-gold px-4 py-2 text-xs font-bold text-foreground"
              >
                Connect
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full bg-gold text-xs font-bold text-foreground"
                aria-label="Account menu"
              >
                {initials(displayName)}
              </button>
            )}
            <button
              type="button"
              className="min-h-11 min-w-11 rounded-full p-2"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-forest" />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={clsx(
          "fixed inset-0 z-[110] flex flex-col bg-white transition md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <Image src="/logo.png" alt="LughaPro" width={120} height={40} className="h-8 w-auto object-contain" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="min-h-11 min-w-11 p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {centerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="min-h-11 rounded-xl px-3 py-3 text-lg font-semibold text-forest hover:bg-off-white"
            >
              {link.label}
            </Link>
          ))}
          {isConnected
            ? dropdownLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-xl px-3 py-3 font-semibold text-forest/80 hover:bg-off-white"
                >
                  {label}
                </Link>
              ))
            : null}
          {isConnected ? (
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="min-h-11 rounded-xl px-3 py-3 text-left font-semibold text-foreground/70"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setWalletOpen(true);
              }}
              className="mt-4 min-h-11 rounded-full bg-gold px-6 py-3 font-bold text-foreground"
            >
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
