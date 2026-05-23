import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "About",
    links: [
      { label: "Our Story", href: "#" },
      { label: "Mission", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Content Library", href: "/learn" },
      { label: "Free Content", href: "/learn?price=free" },
      { label: "Certificates", href: "/dashboard" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Find Creators", href: "/tutors" },
      { label: "Become a Creator", href: "/publish" },
      { label: "Creator Guidelines", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/">
              <Image src="/logo.png" alt="LughaPro" width={140} height={42} className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
              Africa&apos;s Kiswahili content marketplace. Learn from creators. Pay your way.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-gold">
              Powered by Celo blockchain
            </span>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-bold text-gold">{column.title}</h3>
              <div className="mt-4 grid gap-3 text-sm text-cream/75">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-cream">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-cream/15 pt-8 md:flex-row">
          <div className="flex gap-4">
            {[Globe, Share2, MessageCircle, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold hover:text-forest"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-sm text-cream/60">© {new Date().getFullYear()} LughaPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
