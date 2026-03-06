import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="py-32 bg-[#050505] text-center relative overflow-hidden">
            {/* Background glow */}
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[400px] bg-indigo-500/8 rounded-[100%] blur-[120px]" />
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h2 className="text-4xl lg:text-6xl font-semibold text-zinc-100 mb-5 tracking-tight leading-tight">
                    Stop context-switching.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                        Start delegating.
                    </span>
                </h2>
                <p className="text-xl text-zinc-400 mb-10 font-light max-w-lg mx-auto leading-relaxed">
                    Your AI is ready. Connect your first app and watch it work.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold px-10 py-4 rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                >
                    Start free — connect in 60 seconds
                </Link>
                <p className="mt-4 text-sm text-zinc-600">No credit card required</p>
            </div>
        </section>
    );
}
