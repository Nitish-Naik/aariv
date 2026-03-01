"use client";

import { Check, Cloud } from "lucide-react";
import { useState } from "react";

export default function ReviewPage() {
    const [items, setItems] = useState([
        {
            id: "1",
            source: "GMAIL",
            time: "12 MIN AGO",
            content: "Sarah wants to reschedule Thursday's 1-on-1 to Friday. Should I confirm?",
            priority: "normal",
        },
        {
            id: "2",
            source: "AWS",
            time: "1 HOUR AGO",
            content: "Your AWS bill this month is 23% higher than last month. Want me to investigate?",
            priority: "high",
        }
    ]);

    const handleAction = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="flex-1 min-h-screen bg-[var(--bg-base)]">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col items-start min-h-full">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full mt-32 text-center">
                        <Cloud size={48} className="text-[#a1a1aa] mb-6 stroke-[1.5]" />
                        <h2 className="text-xl font-serif text-[var(--text-primary)] mb-2 tracking-tight">Nothing needs your judgment</h2>
                        <p className="text-[15px] font-medium text-[var(--text-muted)]">I&apos;ve processed everything. You&apos;re clear.</p>
                    </div>
                ) : (
                    <div className="w-full animate-fade-in-up">
                        <header className="mb-10">
                            <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-2 tracking-tight">Review</h1>
                            <p className="text-[15px] font-medium text-[var(--text-muted)]">
                                {items.length} {items.length === 1 ? 'item needs' : 'items need'} your judgment
                            </p>
                        </header>

                        <div className="space-y-4 w-full">
                            {items.map((item) => (
                                <div key={item.id} className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-2xl p-6 shadow-sm transition-all hover:bg-[rgba(255,255,255,0.03)] w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                                            {item.source} • {item.time}
                                        </span>
                                        {item.priority === "high" && (
                                            <span className="px-3 py-1 bg-[#2C2114] border border-[#4B371E] text-[#D8934A] text-[11px] font-semibold tracking-wide rounded-full shadow-sm">
                                                Needs attention
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[15px] font-medium text-[var(--text-primary)] mb-6 leading-relaxed">
                                        {item.content}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleAction(item.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors shadow-sm"
                                        >
                                            <Check size={16} />
                                            Yes, do it
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.id)}
                                            className="px-4 py-2 bg-transparent hover:bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors"
                                        >
                                            Not now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
