import Link from "next/link";
import { Logo } from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 relative text-zinc-500">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5" />
              <span className="text-sm font-semibold text-white tracking-[-0.01em]">
                CalmPilot
              </span>
            </div>
            <p className="text-[13px] text-zinc-500 max-w-[200px] leading-relaxed">
              Your AI works overnight. You just review.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600 font-semibold mb-3">
              Product
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/integrations" className="hover:text-white transition-colors duration-200">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors duration-200">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600 font-semibold mb-3">
              Connect
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/nitishnaik2022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@calmpilot.app"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600 font-semibold mb-3">
              Legal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors duration-200">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-[11px] text-zinc-600">
          <p>© {year} CalmPilot. All rights reserved.</p>
          <p>Built for calm, focused work.</p>
        </div>
      </div>
    </footer>
  );
}
