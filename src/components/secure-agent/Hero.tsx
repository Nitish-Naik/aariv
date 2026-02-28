import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column - Text & CTA */}
                    <div className="max-w-2xl">
                        <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight text-zinc-100 mb-6 leading-[1.1]">
                            A quieter way <br /><span className="text-stone-400 font-normal">to get work done.</span>
                        </h1>
                        <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg font-light">
                            An intelligent presence that quietly handles your tasks across all your apps without ever demanding your attention or compromising your security.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/login" className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium flex items-center justify-center px-8 py-4 rounded-2xl transition-all">
                                Start your assistant
                            </Link>
                            {/* <Link href="/login" className="bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium flex items-center justify-center px-8 py-4 rounded-2xl transition-colors">
                                Learn more
                            </Link> */}
                        </div>
                    </div>

                    {/* Right Column - Calm Mockup */}
                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                        {/* Background Soft Glow */}
                        <div className="absolute inset-0 bg-stone-500/5 blur-3xl rounded-full"></div>

                        {/* Mockup Card (Calm Timeline instead of flashing console) */}
                        <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-2xl p-8 font-sans">
                            <div className="mb-6">
                                <h3 className="text-zinc-200 font-medium text-lg">Morning Brief</h3>
                                <p className="text-zinc-500 text-sm">Prepared quietly while you slept.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-zinc-800/50 rounded-2xl p-4 flex gap-4 items-start border border-zinc-700/30">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-300 font-medium">Inbox Organized</h4>
                                        <p className="text-zinc-500 text-sm mt-1">12 threads categorized, 4 drafts prepared for your review.</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 rounded-2xl p-4 flex gap-4 items-start border border-zinc-700/30">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-300 font-medium">Notion Summary Created</h4>
                                        <p className="text-zinc-500 text-sm mt-1">Yesterday's Slack engineering discussions have been summarized.</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 rounded-2xl p-4 flex gap-4 items-start border border-zinc-700/30 opacity-70">
                                    <div className="w-10 h-10 rounded-full bg-zinc-700/30 flex items-center justify-center shrink-0 mt-1">
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-400 font-medium">Resting</h4>
                                        <p className="text-zinc-600 text-sm mt-1">Waiting for your next instruction.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
