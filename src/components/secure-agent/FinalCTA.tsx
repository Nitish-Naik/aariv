import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="py-32 bg-zinc-950 text-center relative overflow-hidden">
            {/* Background Soft Glow */}
            <div className="absolute inset-0 bg-stone-500/5 blur-[120px] rounded-full max-w-4xl mx-auto"></div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h2 className="text-4xl lg:text-6xl font-semibold text-zinc-100 mb-6 tracking-tight">
                    A calm, intelligent presence.
                </h2>
                <p className="text-xl text-zinc-400 mb-10 font-light">
                    Your AI is waiting. Turn it on in seconds.
                </p>
                <Link href="/login" className="inline-block bg-zinc-100 hover:bg-white text-zinc-900 font-medium px-10 py-4 rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-lg border border-transparent">
                    Get Started
                </Link>
            </div>
        </section>
    );
}
