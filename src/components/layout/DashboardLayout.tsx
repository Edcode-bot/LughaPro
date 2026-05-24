"use client";

import clsx from "clsx";
import {
  Award,
  BarChart3,
  BookOpen,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { NavBar } from "@/components/ui/NavBar";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/content";
import { shortenAddress } from "@/lib/minipay";
import { UserRole } from "@/types";

const studentLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/library", label: "My Library", icon: BookOpen },
  { href: "/learn", label: "Browse Content", icon: Home },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
];

const tutorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/my-content", label: "My Content", icon: FileText },
  { href: "/publish", label: "Publish", icon: PenSquare },
  { href: "/earnings", label: "Earnings", icon: BarChart3 },
  { href: "/students", label: "My Students", icon: Users },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({
  children,
  role: roleOverride,
}: {
  children: ReactNode;
  role?: UserRole;
}) {
  const pathname = usePathname();
  const { displayName, address, role: authRole, disconnect } = useAuth();
  const role = roleOverride ?? authRole;
  const links = role === "tutor" || role === "admin" ? tutorLinks : studentLinks;

  return (
    <div className="min-h-screen bg-off-white">
      <NavBar />
      <div className="lg:flex">
        <aside className="hidden w-72 shrink-0 flex-col bg-forest p-6 text-cream lg:flex lg:min-h-[calc(100vh-72px)]">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gold text-sm font-black text-foreground">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{displayName}</p>
              <p className="truncate text-xs text-cream/60">{address ? shortenAddress(address) : ""}</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    active ? "border-l-4 border-gold bg-white/10 pl-3 text-gold" : "text-cream/75 hover:bg-white/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => disconnect()}
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cream/75 hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            Disconnect
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 pb-28 lg:px-10 lg:pb-10">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
