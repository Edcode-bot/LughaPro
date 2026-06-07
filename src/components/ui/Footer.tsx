import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";
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
            <span className="mt-4 inline-flex rounded-full border border-[#FFBF00]/40 px-3 py-1 text-xs font-bold text-[#FFBF00]">
              Powered by Celo blockchain
            </span>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-bold text-[#FFBF00]">{column.title}</h3>
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

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex gap-4">
            {[Globe, Share2, MessageCircle, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-[#FFBF00] hover:text-[#171717]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-sm text-white/40">© {new Date().getFullYear()} LughaPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
