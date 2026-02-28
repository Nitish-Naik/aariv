export default function ComparisonTable() {
    const rows = [
        { label: "Setup Time", ours: "2 minutes", theirs: "Hours to Days" },
        { label: "Credentials", ours: "OAuth ONLY (Zero-Trust)", theirs: "Local .env / Hardcoded keys" },
        { label: "Code Execution", ours: "Isolated Sandboxes", theirs: "Your Local Machine" },
        { label: "Integrations", ours: "100+ Pre-built", theirs: "Custom Scripts / Debugging" },
        { label: "Skill Security", ours: "Verified Tools", theirs: "Untrusted Packages" },
        { label: "Audit Trails", ours: "Full Dashboard Logs", theirs: "Messy Terminal Sessions" },
        { label: "Revocation", ours: "1-Click Global Revoke", theirs: "Manual Key Rotations" },
    ];

    return (
        <section className="py-24 bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-semibold text-zinc-100 mb-6 tracking-tight">
                        A simpler way to scale.
                    </h2>
                    <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto">
                        A head-to-head look at how a managed, secure agent transforms the developer experience compared to DIY setups.
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 shadow-xl">
                    <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/60 p-6 lg:p-8">
                        <div className="font-medium text-zinc-500">Capability</div>
                        <div className="font-semibold text-zinc-200 text-lg">SecureAgent</div>
                        <div className="font-medium text-zinc-500">Vanilla Agent Setup</div>
                    </div>

                    <div className="divide-y divide-zinc-800/50">
                        {rows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-3 p-6 lg:p-8 hover:bg-zinc-800/30 transition-colors">
                                <div className="flex items-center text-zinc-400 font-medium">
                                    {row.label}
                                </div>
                                <div className="flex items-center text-zinc-200 font-medium flex-wrap gap-2">
                                    <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {row.ours}
                                </div>
                                <div className="flex items-center text-zinc-500 flex-wrap gap-2">
                                    <svg className="w-5 h-5 text-zinc-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {row.theirs}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
