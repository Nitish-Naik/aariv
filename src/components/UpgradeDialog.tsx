"use client";

import { Logo } from "@/components/secure-agent/Logo";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import {
  ArrowRight,
  Check,
  Loader2,
  X,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* ─── Plan data ───────────────────────────────────────────── */

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    highlight: true,
    features: [
      "500 chat messages/month",
      "Unlimited triggers",
      "Daily morning briefing",
      "Standard AI (GPT-4.1)",
      "Gmail, Calendar & Slack",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    highlight: false,
    features: [
      "2,000 chat messages/month",
      "Unlimited triggers",
      "Priority daily briefing",
      "Best AI (GPT-5.4)",
      "Priority support",
    ],
  },
];

const REASON_COPY: Record<string, { title: string; subtitle: string }> = {
  chat_limit: {
    title: "You've used all your free messages",
    subtitle: "Upgrade for more messages, daily briefings, and unlimited triggers.",
  },
  trigger_limit: {
    title: "You've hit the 3-trigger limit",
    subtitle: "Upgrade for unlimited triggers across all your apps.",
  },
  briefing: {
    title: "Morning briefings are a paid feature",
    subtitle: "Wake up to a summary of everything that happened overnight.",
  },
  model: {
    title: "This model requires an upgrade",
    subtitle: "Unlock better AI models for more accurate, capable responses.",
  },
  general: {
    title: "Unlock the full experience",
    subtitle: "Everything you need to automate your work.",
  },
};

export type UpgradeReason = keyof typeof REASON_COPY;

/* ─── Context ─────────────────────────────────────────────── */

interface UpgradeDialogContextValue {
  openUpgrade: (reason?: UpgradeReason) => void;
}

const UpgradeDialogContext = createContext<UpgradeDialogContextValue | null>(null);

export function useUpgradeDialog() {
  const ctx = useContext(UpgradeDialogContext);
  if (!ctx) throw new Error("useUpgradeDialog must be used within UpgradeDialogProvider");
  return ctx;
}

/* ─── Provider ────────────────────────────────────────────── */

export function UpgradeDialogProvider({ children }: { children: ReactNode }) {
  const [reason, setReason] = useState<UpgradeReason | null>(null);

  const openUpgrade = useCallback((r: UpgradeReason = "general") => setReason(r), []);

  return (
    <UpgradeDialogContext.Provider value={{ openUpgrade }}>
      {children}
      {reason && <UpgradeOverlay reason={reason} onClose={() => setReason(null)} />}
    </UpgradeDialogContext.Provider>
  );
}

/* ─── Overlay ─────────────────────────────────────────────── */

function UpgradeOverlay({ reason, onClose }: { reason: UpgradeReason; onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copy = REASON_COPY[reason] ?? REASON_COPY.general;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    trackEvent("upgrade_dialog_shown", { reason });
    return () => { document.body.style.overflow = ""; };
  }, [reason]);

  async function handleSelect(planId: string) {
    setLoading(planId);
    setError(null);
    trackEvent("upgrade_dialog_plan_selected", { plan: planId });

    try {
      const data = await api.post("/billing/subscribe", { plan: planId });
      const checkoutUrl = data.checkout_url;

      try {
        const parsed = new URL(checkoutUrl);
        if (!parsed.hostname.endsWith("dodopayments.com") && !parsed.hostname.endsWith("dodo.dev")) {
          throw new Error("Invalid checkout URL");
        }
      } catch {
        throw new Error("Invalid checkout URL received");
      }

      trackEvent("upgrade_dialog_redirect", { plan: planId });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[680px] rounded-2xl bg-zinc-950 border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in-0 zoom-in-[0.97] duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-white/[0.06] text-zinc-600 hover:text-zinc-400 transition-all duration-200 z-10"
        >
          <X size={15} strokeWidth={1.5} />
        </button>

        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-500/[0.06] rounded-[100%] blur-[80px] pointer-events-none"
        />

        {/* Header */}
        <div className="relative px-7 pt-8 pb-2 text-center">
          <Logo className="w-12 h-12 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-white tracking-[-0.02em] mb-1.5">{copy.title}</h2>
          <p className="text-[13px] text-zinc-500 leading-relaxed">{copy.subtitle}</p>
        </div>

        {/* Plans — side by side */}
        <div className="px-5 sm:px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLANS.map((plan) => {
            const isLoading = loading === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-xl p-5 flex flex-col border transition-all duration-200 ${
                  plan.highlight
                    ? "border-violet-500/30 bg-violet-500/[0.04]"
                    : "border-white/[0.06] bg-white/[0.015]"
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.1em] font-semibold">
                      {plan.name}
                    </p>
                    {plan.highlight && (
                      <span className="text-[9px] font-semibold text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-0.5">
                    <span className="text-2xl font-bold text-white tracking-tight">{plan.price}</span>
                    <span className="text-zinc-600 text-xs mb-0.5">/mo</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className={`shrink-0 mt-0.5 ${plan.highlight ? "text-violet-400" : "text-emerald-400"}`}
                      />
                      <span className="text-[12px] text-zinc-400 leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={loading !== null}
                  className={`group flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? "bg-white text-black hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.06)]"
                      : "bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:border-white/[0.12]"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      Get {plan.name}
                      <ArrowRight size={13} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-7 pb-5 text-center">
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <button
              onClick={onClose}
              className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors duration-200"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
