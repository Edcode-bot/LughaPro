import { Mail, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Explore Content", href: "/explore" },
      { label: "Free Content", href: "/explore?price=free" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Language", href: "/explore?category=language" },
      { label: "Music", href: "/explore?category=music" },
      { label: "Arts & Crafts", href: "/explore?category=arts" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Find Creators", href: "/creators" },
      { label: "Become a Creator", href: "/publish" },
      { label: "Creator Guidelines", href: "/guidelines" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Help Center", href: "/help" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#171717] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="LughaPro"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Learn. Discover. Preserve. — Where Africa&apos;s languages, arts, music, and wisdom are alive — and open to the world.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#FFBF00]/40 px-3 py-1 text-xs font-bold text-[#FFBF00]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFBF00] animate-pulse" />
              Powered by Celo blockchain
            </span>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://t.me/+IhLI-wvf8aNkMTZk" target="_blank" rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2.5 hover:bg-[#FFBF00] hover:text-[#171717] text-white transition-colors" title="Telegram">
                <Send className="h-4 w-4" />
              </a>
              <a href="https://x.com/LughaPro?s=20" target="_blank" rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2.5 hover:bg-[#FFBF00] hover:text-[#171717] text-white transition-colors" title="X (Twitter)">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="mailto:lughapro3@gmail.com"
                className="rounded-full bg-white/10 p-2.5 hover:bg-[#FFBF00] hover:text-[#171717] text-white transition-colors" title="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">{column.title}</h3>
              <div className="mt-4 grid gap-3 text-sm text-white/60">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-end border-t border-white/10 pt-8">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} LughaPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
