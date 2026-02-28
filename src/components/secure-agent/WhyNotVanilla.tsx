export default function WhyNotVanilla() {
    return (
        <section className="py-32 bg-zinc-950 border-y border-zinc-900 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900/40 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-2xl mx-auto text-center mb-20">
                    <h2 className="text-3xl lg:text-5xl font-semibold text-zinc-100 mb-6 tracking-tight">
                        The problem with DIY agents
                    </h2>
                    <p className="text-lg text-zinc-400 font-light leading-relaxed">
                        Writing your own agent or using random community skills often means exposing your local machine and API keys to unvetted code. It's powerful, but loud and risky.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-zinc-900/60 rounded-3xl p-8 border border-zinc-800/80 shadow-sm flex flex-col h-full">
                        <h3 className="text-zinc-300 text-lg font-medium mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                            Untrusted Community Skills
                        </h3>
                        <p className="text-zinc-500 font-light leading-relaxed mb-8 flex-grow">
                            Pulling random tools means you rarely know what code is actually running under the hood.
                        </p>
                        <div className="px-4 py-3 bg-zinc-800/40 rounded-xl text-zinc-300 text-sm font-medium border border-zinc-700/50">
                            <span className="text-stone-400 mr-2">How we fix this:</span>
                            Verified & sandboxed registry.
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-zinc-900/60 rounded-3xl p-8 border border-zinc-800/80 shadow-sm flex flex-col h-full">
                        <h3 className="text-zinc-300 text-lg font-medium mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                            Exposed Local Credentials
                        </h3>
                        <p className="text-zinc-500 font-light leading-relaxed mb-8 flex-grow">
                            Hardcoded API keys and dotfiles make developer machines prime targets for malware.
                        </p>
                        <div className="px-4 py-3 bg-zinc-800/40 rounded-xl text-zinc-300 text-sm font-medium border border-zinc-700/50">
                            <span className="text-stone-400 mr-2">How we fix this:</span>
                            100% OAuth flow. No local keys.
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-zinc-900/60 rounded-3xl p-8 border border-zinc-800/80 shadow-sm flex flex-col h-full">
                        <h3 className="text-zinc-300 text-lg font-medium mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                            Unsafe Code Execution
                        </h3>
                        <p className="text-zinc-500 font-light leading-relaxed mb-8 flex-grow">
                            Vanilla agents run terminal commands as you. A bad prompt can delete files easily.
                        </p>
                        <div className="px-4 py-3 bg-zinc-800/40 rounded-xl text-zinc-300 text-sm font-medium border border-zinc-700/50">
                            <span className="text-stone-400 mr-2">How we fix this:</span>
                            Ephemeral cloud execution.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
