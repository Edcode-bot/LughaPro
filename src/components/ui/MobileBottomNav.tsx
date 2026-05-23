"use client";

import clsx from "clsx";
import { BookOpen, Home, Library, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
  { href: "/wallet", label: "Wallet", icon: Wallet },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isConnected } = useAuth()

  if (!isConnected) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-forest/10 bg-white px-2 py-2 shadow-lg lg:hidden">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "grid place-items-center gap-1 rounded-xl py-2 text-xs font-bold",
                active ? "text-gold" : "text-foreground/50",
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
