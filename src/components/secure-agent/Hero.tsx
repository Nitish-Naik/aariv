"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

// Floating App Nodes Data (Background)
const floatingApps = [
    { name: "Gmail", icon: "/images/google-gmail-svgrepo-com.svg", top: "15%", left: "10%", delay: 0 },
    { name: "Slack", icon: "/images/slack-svgrepo-com.svg", top: "25%", left: "85%", delay: 1 },
    { name: "Notion", icon: "/images/notion-svgrepo-com.svg", top: "65%", left: "12%", delay: 2 },
    { name: "GitHub", icon: "/images/github-142-svgrepo-com.svg", top: "75%", left: "80%", delay: 0.5 },
    { name: "Linear", icon: "/images/linear-svgrepo-com.svg", top: "85%", left: "20%", delay: 1.5 },
    { name: "Atlassian", icon: "/images/atlassian-svgrepo-com.svg", top: "45%", left: "5%", delay: 2.5 },
];

export default function Hero() {
    const [demoStep, setDemoStep] = useState(0);

    // Complex Animation Sequence Logic mimicking TrustClaw's execution flow
    useEffect(() => {
        // 0: Initial state, typing prompt
        const t1 = setTimeout(() => setDemoStep(1), 2000); // 1. Prompt submitted, showing "SEARCH_TOOLS"
        const t2 = setTimeout(() => setDemoStep(2), 3500); // 2. "SEARCH_TOOLS" expands to show found tools
        const t3 = setTimeout(() => setDemoStep(3), 5500); // 3. Shows "EXECUTE" block starting
        const t4 = setTimeout(() => setDemoStep(4), 7000); // 4. First tool done
        const t5 = setTimeout(() => setDemoStep(5), 8000); // 5. Second tool done
        const t6 = setTimeout(() => setDemoStep(6), 9000); // 6. Third tool done, final message

        // Reset loop
        const loop = setInterval(() => {
            setDemoStep(0);
            setTimeout(() => setDemoStep(1), 2000);
            setTimeout(() => setDemoStep(2), 3500);
            setTimeout(() => setDemoStep(3), 5500);
            setTimeout(() => setDemoStep(4), 7000);
            setTimeout(() => setDemoStep(5), 8000);
            setTimeout(() => setDemoStep(6), 9000);
        }, 15000);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
            clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
            clearInterval(loop);
        };
    }, []);

    const typedText = "plz handle my customer complaints and log in notion";

    return (
        <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32 bg-[#050505] min-h-screen flex items-center justify-center selection:bg-indigo-500/30">

            {/* Technical Grid Background */}
            <div aria-hidden="true" className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBINDBWMHEwIDAgMCAwSDBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-50" />

            {/* Ambient Background Glows */}
            <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none opacity-50 z-0" />
            <div aria-hidden="true" className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-500/5 rounded-[100%] blur-[120px] pointer-events-none opacity-30 z-0" />

            {/* Floating App Nodes Background (Vignetted) */}
            <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 max-w-7xl mx-auto"
                style={{ maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)" }}>
                {floatingApps.map((app, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0 }}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, delay: app.delay, ease: "easeInOut" }}
                        className="absolute flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-full text-zinc-600 text-[11px] font-medium shadow-xl"
                        style={{ top: app.top, left: app.left }}
                    >
                        <span>
                            <Image src={app.icon} alt={app.name} width={14} height={14} className="opacity-80" />
                        </span>
                        <span>{app.name} connected</span>
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex items-center h-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">

                    {/* Left Column: Text & Grid */}
                    <div className="space-y-12">
                        {/* Header Text */}
                        <div className="text-left space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="text-5xl lg:text-[5rem] leading-[1.05] font-bold tracking-tight text-white pb-2"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                                    All your favourite apps.
                                </span>
                                <br />
                                <span className="italic text-zinc-500 font-serif font-medium">Zero setup.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                                className="text-lg text-zinc-400 max-w-lg leading-relaxed font-light"
                            >
                                YourProxy is a 24/7 AI assistant with 1000+ tools via OAuth and sandboxed execution. Built to securely orchestrate your workflows.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                className="pt-2"
                            >
                                <Link
                                    href="/login"
                                    className="group relative inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white text-black font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                                        <div className="relative h-full w-8 bg-black/10" />
                                    </div>
                                    <span className="relative z-10 flex items-center">
                                        Get Started <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Connected Apps Grid (Integrated into Hero Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="max-w-[400px] hidden lg:block pt-4 relative group"
                        >
                            {/* Inner glow behind the grid */}
                            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div aria-hidden="true" className="grid grid-cols-4 gap-3 relative z-10">
                                {[
                                    { icon: "/images/google-drive-svgrepo-com.svg", name: "Drive", op: "opacity-80" },
                                    { icon: "/images/github-142-svgrepo-com.svg", name: "GitHub", op: "opacity-80" },
                                    { icon: "/images/notion-svgrepo-com.svg", name: "Notion", op: "opacity-80" },
                                    { icon: "/images/stripe-v2-svgrepo-com.svg", name: "Stripe", op: "opacity-60" },
                                    { icon: "/images/linear-svgrepo-com.svg", name: "Linear", op: "opacity-40" },
                                    { icon: "/images/slack-svgrepo-com.svg", name: "Slack", op: "opacity-90" },
                                    { icon: "/images/airtable-svgrepo-com.svg", name: "Airtable", op: "opacity-80" },
                                    { icon: "/images/google-calendar-svgrepo-com.svg", name: "Calendar", op: "opacity-80" },
                                    { icon: "/images/asana-svgrepo-com.svg", name: "Asana", op: "opacity-40" },
                                    { icon: "/images/trello-svgrepo-com.svg", name: "Trello", op: "opacity-80" },
                                    { icon: "/images/discord-icon-svgrepo-com.svg", name: "Discord", op: "opacity-40" },
                                    { icon: "/images/hubspot-svgrepo-com.svg", name: "Hubspot", op: "opacity-60" },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.4 + (index * 0.05) }}
                                        whileHover={{ scale: 1.05, opacity: 1 }}
                                        className={`aspect-square bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-2xl border border-white/5 shadow-inner flex items-center justify-center p-4 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] ${item.op}`}
                                    >
                                        <Image src={item.icon} width={24} height={24} alt={item.name} className="drop-shadow-md" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: The Execution Card UI */}
                    <div className="w-full flex justify-end">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full max-w-[34rem] bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-5 md:p-6 font-mono text-sm relative min-h-[480px] flex flex-col"
                        >
                            {/* Inner ambient ring for glass effect */}
                            <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/[0.05] pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Logo className="w-7 h-7" />
                                    <h3 className="text-white font-semibold flex items-center gap-2 tracking-wide font-sans">
                                        YourProxy
                                    </h3>
                                </div>
                                {/* <div className="text-right flex items-center justify-center border border-[#333] rounded px-2 py-0.5 bg-[#1a1a1a]">
                                    <span className="text-zinc-500 text-[9px] font-medium tracking-widest uppercase">by Aariv</span>
                                </div> */}
                            </div>

                            <div className="flex flex-col space-y-4 relative z-10">
                                {/* User Input Bubble */}
                                <div className="self-end bg-gradient-to-r from-[#222] to-[#262626] border border-white/5 text-zinc-100 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[90%] font-sans inline-block overflow-hidden shadow-lg shadow-black/20 relative">
                                    {demoStep === 0 ? (
                                        <div className="flex items-center">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5, ease: "linear" }}
                                                className="whitespace-nowrap overflow-hidden"
                                            >
                                                {typedText}
                                            </motion.div>
                                            <motion.div
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="w-1.5 h-4 bg-zinc-400 ml-1 rounded-sm"
                                            />
                                        </div>
                                    ) : (
                                        <span>{typedText}</span>
                                    )}
                                </div>

                                {/* Automation Sequence */}
                                {demoStep >= 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="w-full space-y-3 pt-2"
                                    >
                                        {/* SEARCH TOOLS BLOCK */}
                                        <div className="border border-white/5 rounded-xl overflow-hidden bg-[#080808]/50 shadow-inner">
                                            <div className="px-4 py-3 flex items-center justify-between bg-[#0f0f0f]/80 border-b border-white/5 backdrop-blur-md">
                                                <div className="flex items-center gap-2 text-emerald-500 font-semibold tracking-wide text-xs">
                                                    <CheckCircle2 size={15} />
                                                    SEARCH_TOOLS
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                                                    Finding the right tool <span className="text-zinc-600">1s</span> <Wrench size={11} />
                                                </div>
                                            </div>

                                            {/* Expanded Search Details */}
                                            {demoStep >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className="p-4 px-5 bg-[#0a0a0a] text-xs space-y-4"
                                                >
                                                    <div className="flex tracking-wider">
                                                        <div className="w-3 border-l-2 border-b-2 border-[#333] rounded-bl -mt-2.5 mr-3"></div>
                                                        <div className="text-zinc-500 space-y-1">
                                                            <div className="text-[9px] uppercase tracking-widest font-semibold">Use Case</div>
                                                            <div className="text-white font-medium">FETCH AND CATEGORIZE EMAILS</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex tracking-wider">
                                                        <div className="w-3 border-l-2 border-b-2 border-[#333] rounded-bl -mt-2.5 mr-3"></div>
                                                        <div className="text-zinc-500 space-y-1">
                                                            <div className="text-[9px] uppercase tracking-widest font-semibold">GMAIL</div>
                                                            <div className="text-zinc-400 flex items-center gap-2">
                                                                <span className="text-emerald-500 text-[9px] font-bold">● CONNECTED</span>
                                                                <span className="opacity-50">→</span> hello@company.com
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex tracking-wider">
                                                        <div className="w-3 border-l-2 border-[#333] -mt-2.5 mr-3"></div>
                                                        <div className="text-zinc-500 space-y-1">
                                                            <div className="text-[9px] uppercase tracking-widest font-semibold">Recommended Tool</div>
                                                            <div className="text-white font-bold flex items-center gap-2">
                                                                <Image src="/images/google-gmail-svgrepo-com.svg" width={14} height={14} alt="Gmail" className="mr-1" />
                                                                GMAIL_FETCH_EMAILS
                                                                <span className="text-[#333] mx-1">|</span>
                                                                <span className="text-emerald-500 text-[10px]">■■□ EASY</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* EXECUTE BLOCK */}
                                        {demoStep >= 3 && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a]">
                                                <div className="px-4 py-3 flex items-center justify-between bg-[#0f0f0f] border-b border-[#222]">
                                                    <div className="flex items-center gap-2 text-emerald-500 font-semibold tracking-wide text-xs">
                                                        {demoStep >= 6 ? <CheckCircle2 size={15} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />}
                                                        EXECUTE
                                                    </div>
                                                    <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                                                        Executing 3 tools <span className="text-zinc-600">2s</span> <Wrench size={11} />
                                                    </div>
                                                </div>

                                                <div className="p-4 px-5 bg-[#0a0a0a] text-xs space-y-3.5">
                                                    {/* Tool 1 */}
                                                    <div className="flex items-center justify-between font-bold">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-3 h-2 border-l-2 border-b-2 border-[#333] rounded-bl mb-1"></div>
                                                            <Image src="/images/google-gmail-svgrepo-com.svg" width={14} height={14} alt="Gmail" />
                                                            <span className="text-white">GMAIL_FETCH_EMAILS</span>
                                                        </div>
                                                        {demoStep >= 4 ? <span className="text-emerald-500 font-sans text-[11px]">Done</span> : <span className="text-zinc-500 animate-pulse text-[11px]">Running...</span>}
                                                    </div>

                                                    {/* Tool 2 */}
                                                    {demoStep >= 4 && (
                                                        <div className="flex items-center justify-between font-bold">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-2 border-l-2 border-b-2 border-[#333] rounded-bl mb-1"></div>
                                                                <Image src="/images/google-gmail-svgrepo-com.svg" width={14} height={14} alt="Gmail" />
                                                                <span className="text-white">GMAIL_CREATE_DRAFT</span>
                                                            </div>
                                                            {demoStep >= 5 ? <span className="text-emerald-500 font-sans text-[11px]">Done</span> : <span className="text-zinc-500 animate-pulse text-[11px]">Running...</span>}
                                                        </div>
                                                    )}

                                                    {/* Tool 3 */}
                                                    {demoStep >= 5 && (
                                                        <div className="flex items-center justify-between font-bold">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-2 border-l-2 border-b-2 border-[#333] rounded-bl mb-1"></div>
                                                                <Image src="/images/notion-svgrepo-com.svg" width={14} height={14} alt="Notion" />
                                                                <span className="text-white">NOTION_CREATE_PAGE</span>
                                                            </div>
                                                            {demoStep >= 6 ? <span className="text-emerald-500 font-sans text-[11px]">Done</span> : <span className="text-zinc-500 animate-pulse text-[11px]">Running...</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Final Result Message */}
                                        {demoStep >= 6 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="text-zinc-300 font-sans pt-3 px-1 text-[14px] leading-relaxed"
                                            >
                                                Drafted 3 replies and logged each complaint in your Notion tracker.
                                            </motion.div>
                                        )}

                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
