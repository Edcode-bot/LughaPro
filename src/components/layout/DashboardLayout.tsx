"use client";

import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  Settings,
  Shield,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { shortenAddress } from "@/lib/minipay";

const ADMIN_WALLETS = [
  "0xe38a456433fff7814e40998cf0cbbbd2c885b513",
];

const allLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/library", label: "My Library", icon: BookOpen },
  { href: "/my-content", label: "My Content", icon: FileText },
  { href: "/publish", label: "Publish", icon: PenSquare },
  { href: "/earnings", label: "Earnings", icon: BarChart3 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/explore": "Explore",
  "/library": "My Library",
  "/my-content": "My Content",
  "/publish": "Publish Content",
  "/earnings": "Earnings",
  "/wallet": "Wallet",
  "/certificates": "Certificates",
  "/leaderboard": "Leaderboard",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
};

export function DashboardLayout({ children }: { children: ReactNode; role?: string }) {
  const pathname = usePathname();
  const { displayName, address, disconnect } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = address && ADMIN_WALLETS.includes(address.toLowerCase());

  useEffect(() => {
    const refresh = () => {
      try {
        const stored = localStorage.getItem("lugha_profile");
        if (stored)
          setAvatarUrl(
            (JSON.parse(stored) as Record<string, unknown>).avatar_url as string | null ?? null,
          );
      } catch { /* ignore */ }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("lugha_profile_updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("lugha_profile_updated", refresh);
    };
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";

  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image src="/logo.png" alt="LughaPro" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
        <div>
          <div className="font-serif font-black text-white text-lg leading-none">LughaPro</div>
          <div className="text-white/40 text-xs mt-0.5">Learn. Discover. Preserve.</div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#FFBF00] flex items-center justify-center font-black text-[#171717] text-sm flex-shrink-0">
              {(displayName ?? "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">{displayName ?? "User"}</div>
            <div className="text-white/50 text-xs font-mono truncate">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-[#FFBF00] text-[#171717] font-black"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              pathname === "/admin"
                ? "bg-[#FFBF00] text-[#171717] font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            Admin
          </Link>
        )}
      </nav>

      {/* Disconnect */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => disconnect()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Disconnect
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8f4ef]">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a4731] to-[#0f2a1e] flex flex-col shadow-2xl z-40 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1a4731] to-[#0f2a1e] flex flex-col shadow-2xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 p-2 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar — solid white so text is always readable */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-5 py-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-[#171717]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-xl font-black text-[#171717] lg:text-2xl">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-[#FFBF00]" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#1a4731] flex items-center justify-center text-white text-sm font-black">
                {(displayName ?? "U").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-5 pb-28 lg:p-8 lg:pb-10">
          {children}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
