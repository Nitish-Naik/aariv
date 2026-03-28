"use client";

import { useBilling } from "@/context/useBilling";
import { MessageSquare, Sparkles, Zap } from "lucide-react";

export function WeeklyStats() {
  const { balanceData } = useBilling();

  if (!balanceData) return null;

  const tier = balanceData.subscription_tier ?? "free";
  if (tier === "free") return null;

  const chatUsed = balanceData.chat_messages_used ?? 0;
  const chatLimit = balanceData.chat_messages_limit ?? 500;
  const triggersToday = balanceData.trigger_fires_today ?? 0;
  const chatPct = chatLimit > 0 ? Math.round((chatUsed / chatLimit) * 100) : 0;

  const tierLabel =
    tier === "starter" ? "Starter" :
    tier === "pro" ? "Pro" : tier;

  return (
    <div className="mx-4 mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Sparkles size={11} strokeWidth={1.75} className="text-indigo-400" />
        </div>
        <p className="text-xs font-semibold text-foreground">{tierLabel} Plan</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
        {/* Chat messages */}
        <div className="px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <MessageSquare size={11} strokeWidth={1.5} className="text-violet-400" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">{chatUsed}</p>
          <p className="text-[10px] text-muted-foreground">/ {chatLimit} messages</p>
          <div className="w-full h-1 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                chatPct >= 90 ? "bg-red-500" : chatPct >= 50 ? "bg-amber-500" : "bg-violet-500"
              }`}
              style={{ width: `${Math.min(chatPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Triggers today */}
        <div className="px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap size={11} strokeWidth={1.5} className="text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">{triggersToday}</p>
          <p className="text-[10px] text-muted-foreground">triggers today</p>
        </div>
      </div>
    </div>
  );
}
