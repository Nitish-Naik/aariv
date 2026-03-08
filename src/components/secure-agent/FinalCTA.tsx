"use client";

import { ArrowRight, Check, Copy, Users } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function FinalCTA() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joined, setJoined] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [refCode, setRefCode] = useState<string | null>(null);
    const [refCount, setRefCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/waitlist/count`)
            .then(r => r.json())
            .then(d => { if (d.count) setTotal(d.count); })
            .catch(() => { });
    }, []);

    const [urlRef, setUrlRef] = useState<string | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");
        if (ref) setUrlRef(ref.toUpperCase());
    }, []);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || isSubmitting) return;
        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/waitlist/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), ref: urlRef }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Something went wrong");
                return;
            }

            setJoined(true);
            setPosition(data.position);
            setTotal(data.total);
            setRefCode(data.referral_code);
            setRefCount(data.referral_count || 0);
        } catch {
            setError("Could not connect. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function copyRefLink() {
        if (!refCode) return;
        const link = `${window.location.origin}?ref=${refCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

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
                    Your AI is ready. Be among the first to experience it.
                </p>

                {!joined ? (
                    <div className="max-w-md mx-auto">
                        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-zinc-500 text-base outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-zinc-900 font-semibold text-base hover:bg-zinc-50 active:scale-95 transition-all duration-200 shadow-[0_0_60px_rgba(255,255,255,0.15)] disabled:opacity-50 whitespace-nowrap"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Join Waitlist
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>
                        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                        <div className="flex items-center justify-center gap-3 mt-4">
                            {total !== null && total > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Join <span className="text-zinc-300 font-medium">{total.toLocaleString()}+</span> on the waitlist</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 space-y-4 text-left">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="font-semibold">You&apos;re on the list!</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-3xl font-bold text-white tabular-nums">#{position}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Your position</p>
                            </div>
                            <div className="w-px h-10 bg-white/[0.08]" />
                            <div>
                                <p className="text-3xl font-bold text-zinc-400 tabular-nums">{total?.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Total joined</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/[0.06]">
                            <p className="text-sm text-zinc-300 font-medium mb-2">
                                Skip the line — refer friends to move up
                            </p>
                            <p className="text-xs text-zinc-500 mb-3">
                                Each referral moves you up 10 spots. {refCount > 0 && `You've referred ${refCount} so far.`}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 font-mono truncate">
                                    {`${typeof window !== "undefined" ? window.location.origin : "calmpilot.app"}?ref=${refCode}`}
                                </div>
                                <button
                                    onClick={copyRefLink}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${copied
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                        : "bg-indigo-500 text-white hover:bg-indigo-400"
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
