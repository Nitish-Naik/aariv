import Link from "next/link";
import { Logo } from "./Logo";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-zinc-950/70 border-b border-zinc-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-xl font-semibold text-white tracking-tight flex items-center gap-2.5 group hover:text-zinc-200 transition-colors">
                        <Logo className="w-7 h-7 transition-transform group-hover:scale-110" />
                        YourProxy
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    {/* <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                        Sign in
                    </Link> */}
                    <Link href="/login" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2.5 rounded-full font-medium transition-all text-sm border border-zinc-700">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
