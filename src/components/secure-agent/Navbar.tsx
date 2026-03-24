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
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2.5 group hover:text-foreground/90 transition-colors">
                        <Logo className="w-7 h-7 transition-transform group-hover:scale-110" />
                        CalmPilot
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="sm" onClick={scrollToWaitlist} className="h-9 px-4 text-sm font-medium border-border text-foreground bg-background hover:bg-muted hover:text-foreground transition-all">
                        Join Waitlist
                    </Button>
                </div>
            </div>
        </nav>
    );
}
