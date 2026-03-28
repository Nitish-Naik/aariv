"use client";

import Link from "next/link";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-[15px] font-semibold text-white tracking-[-0.01em]">
            CalmPilot
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-200 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="text-[13px] font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-all duration-200 active:scale-[0.97]"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
