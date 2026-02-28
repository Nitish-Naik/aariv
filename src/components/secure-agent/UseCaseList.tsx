export default function UseCaseList() {
    const prompts = [
        "Check Gmail for unread customer emails and quietly draft thoughtful replies.",
        "Summarize the last 24 hours of messages in the #product-feedback channel.",
        "Draft a set of organized release notes in Notion based on closed Jira tickets.",
        "Analyze the Mixpanel 'Trial Drop-off' events table and prepare a brief on friction points.",
        "Draft polite rejections to the candidates in the 'Declined' column in Linear."
    ];

    return (
        <section className="py-32 bg-zinc-950 border-y border-zinc-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-semibold text-zinc-100 mb-6 tracking-tight">
                        Prepared, never rushed.
                    </h2>
                    <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto">
                        Provide a natural language prompt, and the agent quietly orchestrates the workflow across your tools while you focus on deeper work.
                    </p>
                </div>

                <div className="space-y-4">
                    {prompts.map((prompt, idx) => (
                        <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-start gap-4 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all shadow-sm">
                            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-stone-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <p className="text-zinc-300 font-light leading-relaxed mt-1">
                                &quot;{prompt}&quot;
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
