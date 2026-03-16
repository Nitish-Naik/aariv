import Link from "next/link";
import { Logo } from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-white/10 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide text-zinc-200">
                CalmPilot
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm">
              Your AI-powered digital proxy for 1000+ apps.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Resources
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="hover:text-white transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Social
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/nitishnaik2022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  X / Twitter
                </a>
              </li>
              {/* <li>
                <a
                  href="https://www.linkedin.com/company/calmpilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li> */}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Support & Legal
            </p>
            <ul className="space-y-2 text-sm">
              {/* <li>
                                <a href="mailto:support@calmpilot.app" className="hover:text-white transition-colors">Contact support</a>
                            </li> */}
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-zinc-500">
          <p>© {year} CalmPilot. All rights reserved.</p>
          <p>Built for calm, focused work.</p>
        </div>
      </div>
    </footer>
  );
}
