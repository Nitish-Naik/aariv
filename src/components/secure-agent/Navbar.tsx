"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "./Logo";

export default function Navbar() {
    function scrollToWaitlist(e: React.MouseEvent) {
        e.preventDefault();
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/80 border-b border-white/[0.08]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-xl font-semibold text-white tracking-tight flex items-center gap-2.5 group hover:text-zinc-200 transition-colors">
                        <Logo className="w-7 h-7 transition-transform group-hover:scale-110" />
                        CalmPilot
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="sm" onClick={scrollToWaitlist} className="h-9 px-4 text-sm font-medium border-white/10 text-white bg-black hover:bg-neutral-900 hover:text-white transition-all">
                        Join Waitlist
                    </Button>
                </div>
            </div>
        </nav>
    );
}
