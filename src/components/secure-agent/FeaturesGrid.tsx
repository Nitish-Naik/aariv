export default function FeaturesGrid() {
    const features = [
        {
            title: "Multi-channel presence",
            description: "Chat with your agent wherever you are—Telegram, WhatsApp, Discord, or Slack (soon).",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        },
        {
            title: "Hundreds of integrations",
            description: "Quietly connects with Gmail, GitHub, Notion, Figma, Jira, Linear and many more.",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: "OAuth-only design",
            description: "Never type a password. We use seamless OAuth so you can grant and revoke access anytime.",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            title: "Zero friction setup",
            description: "No dealing with API keys, config files, or cloning repos. It's ready when you are.",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            title: "Works while you rest",
            description: "Set tasks to run periodically. Wake up to prepared summaries and handled emails.",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Sandboxed execution",
            description: "Code runs thoughtfully in isolated cloud environments. Your local machine is unbothered.",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-24 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl p-8 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-medium text-zinc-100 mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
