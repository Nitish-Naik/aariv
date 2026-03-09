import { formatToolName, getAppMeta, getToolAppSlug } from "@/lib/appMeta";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface LogEntryProps {
    log: {
        label: string;
        status: string;
        tool: string;
        args?: any;
        result?: any;
        action_required?: { message: string; url: string };
    };
}

export function DetailedLogEntry({ log }: LogEntryProps) {
    const [isArgsOpen, setIsArgsOpen] = useState(false);
    const [isResultOpen, setIsResultOpen] = useState(false);

    const formatJSON = (data: any) => {
        if (!data) return null;
        try {
            if (typeof data === "string") {
                const parsed = JSON.parse(data);
                return JSON.stringify(parsed, null, 2);
            }
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    const formattedArgs = formatJSON(log.args);
    const formattedResult = formatJSON(log.result);

    const appSlug = getToolAppSlug(log.tool);
    const appMeta = getAppMeta(appSlug);
    const readableToolName = formatToolName(log.tool);

    return (
        <div
            className={`rounded-md border border-white/5 overflow-hidden transition-colors ${log.status === "loading" ? "bg-purple-500/5 animate-pulse" :
                    log.status === "error" ? "bg-red-500/5" : "bg-[#1A1A1A]"
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between p-3 gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    {/* App color dot */}
                    <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: appMeta.color || "#737373" }}
                    />
                    <div className="min-w-0">
                        <span className={`text-[11px] uppercase tracking-wider mb-0.5 font-semibold block ${log.status === "loading" ? "text-purple-400" :
                                log.status === "error" ? "text-red-400" : "text-emerald-400"
                            }`}>
                            {readableToolName}
                        </span>
                        {log.label && log.label !== readableToolName && (
                            <span className="text-[11px] text-zinc-500 block leading-snug truncate">
                                {log.label}
                            </span>
                        )}
                    </div>
                </div>

                {log.status === "loading" && (
                    <div className="w-3 h-3 rounded-full border border-purple-500/30 border-t-purple-500 animate-spin mt-1 shrink-0" />
                )}
                {log.status === "success" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                )}
                {log.status === "error" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                )}
            </div>

            {/* Accordions */}
            <div className="border-t border-white/[0.02]">

                {/* Args Accordion */}
                {formattedArgs && formattedArgs !== "{}" && (
                    <div className="border-b border-white/[0.02]">
                        <button
                            onClick={() => setIsArgsOpen(!isArgsOpen)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                        >
                            <span className="flex-1 text-left font-mono">▸ Args:</span>
                            {isArgsOpen ? <ChevronDown strokeWidth={1.5} size={14} /> : <ChevronRight strokeWidth={1.5} size={14} />}
                        </button>
                        {isArgsOpen && (
                            <div className="px-3 pb-3 pt-1">
                                <pre className="text-[10px] text-zinc-300 overflow-x-auto bg-black/30 p-2 rounded border border-white/5 mx-1 max-h-40 overflow-y-auto custom-scrollbar">
                                    <code>{formattedArgs}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Result Accordion */}
                {formattedResult && log.status !== "loading" && (
                    <div className="border-b border-white/[0.02]">
                        <button
                            onClick={() => setIsResultOpen(!isResultOpen)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                        >
                            <span className="flex-1 text-left font-mono">◂ Result:</span>
                            {isResultOpen ? <ChevronDown strokeWidth={1.5} size={14} /> : <ChevronRight strokeWidth={1.5} size={14} />}
                        </button>
                        {isResultOpen && (
                            <div className="px-3 pb-3 pt-1">
                                <pre className={`text-[10px] overflow-x-auto bg-black/30 p-2 rounded border border-white/5 mx-1 max-h-60 overflow-y-auto custom-scrollbar ${log.status === 'error' ? 'text-red-300' : 'text-zinc-300'}`}>
                                    <code>{formattedResult}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Required Box */}
                {log.action_required && (
                    <div className="p-3 bg-yellow-500/10 border-t border-yellow-500/20">
                        <div className="flex items-start gap-2 text-yellow-500">
                            <AlertCircle strokeWidth={1.5} size={14} className="mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-2 w-full">
                                <span className="text-xs font-medium">Action Required</span>
                                <p className="text-[11px] text-yellow-500/80 leading-relaxed">
                                    Click the link below to authorize. Once you're done, I'll automatically detect it and continue.
                                </p>
                                <a
                                    href={log.action_required.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-3 py-2 mt-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-semibold transition-colors"
                                >
                                    {log.action_required.message}
                                </a>
                                <span className="text-[10px] text-yellow-500/60 mt-1 flex items-center gap-1">
                                    ⏱ Link expires in 10 minutes
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
