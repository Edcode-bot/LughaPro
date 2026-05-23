import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const marketplaceLinks = [
  { label: "Find Tutors", href: "/search" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

const companyLinks = [
  { label: "For Tutors", href: "/auth/register?role=tutor" },
  { label: "Community", href: "#" },
  { label: "Support", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo.png" alt="LughaPro" width={140} height={42} className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
              Africa&apos;s premium Kiswahili marketplace. Learn with verified tutors, pay your way.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gold">Marketplace</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/75">
              {marketplaceLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-cream">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gold">Company</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/75">
              {companyLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-cream">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gold">Legal</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/75">
              {legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-cream">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-cream/15 pt-8 md:flex-row">
          <div className="flex gap-4">
            {[Globe, Share2, MessageCircle, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social link"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-gold hover:text-forest"
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
