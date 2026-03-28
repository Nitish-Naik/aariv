"use client";

import { createBrowserClient } from "@supabase/ssr";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, Check, Loader2, Sparkles, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/mo",
    badge: "Most popular",
    badgeClass: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    highlight: true,
    icon: Zap,
    features: [
      "Unlimited triggers",
      "500 chats/month",
      "Daily briefing",
      "Standard models (GPT-4.1)",
      "Gmail, Calendar & Slack",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "/mo",
    badge: "Power users",
    badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    highlight: false,
    icon: Sparkles,
    features: [
      "Unlimited triggers",
      "2,000 chats/month",
      "Priority daily briefing",
      "Most powerful model (GPT-5.4)",
      "Priority support",
    ],
  },
] as const;

function PlanPicker({ onSelect }: { onSelect: (plan: string) => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-900/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Choose your plan</h1>
          <p className="text-white/40 text-sm">Cancel anytime. All plans include a free tier fallback.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <button
                key={plan.id}
                onClick={() => { setLoading(plan.id); onSelect(plan.id); }}
                disabled={loading !== null}
                className={`group relative flex flex-col text-left rounded-2xl p-5 ring-1 ring-inset transition-all hover:ring-white/20 hover:bg-white/[0.04] disabled:opacity-60 ${
                  plan.highlight
                    ? "ring-violet-500/25 bg-violet-500/[0.04]"
                    : "ring-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <span className={`inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-3 ${plan.badgeClass}`}>
                  {plan.badge}
                </span>

                <p className="text-sm font-semibold text-white mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-0.5 mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-white/35">{plan.period}</span>
                </div>

                <div className="flex-1 space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={12} strokeWidth={2} className="text-white/30 shrink-0 mt-0.5" />
                      <span className="text-[12px] text-white/50 leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <div className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25"
                    : "bg-white/[0.06] text-white/70 group-hover:bg-white/[0.1] group-hover:text-white/90"
                }`}>
                  {loading === plan.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Icon size={13} />
                      Get {plan.name}
                      <ArrowRight size={13} />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-white/20 text-[11px] mt-6">
          Secure payments · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(!!planParam);

  async function startCheckout(plan: string) {
    setCheckingOut(true);
    setError(null);
    trackEvent("checkout_initiated", { plan });

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace(`/login?next=/checkout?plan=${plan}`);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/billing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Checkout failed");

      // Validate checkout URL before redirect
      const checkoutUrl = data.checkout_url;
      try {
        const parsed = new URL(checkoutUrl);
        if (!parsed.hostname.endsWith("dodopayments.com") && !parsed.hostname.endsWith("dodo.dev")) {
          throw new Error("Invalid checkout URL");
        }
      } catch {
        throw new Error("Invalid checkout URL received");
      }
      trackEvent("checkout_redirect", { plan });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCheckingOut(false);
    }
  }

  useEffect(() => {
    if (planParam) startCheckout(planParam);
  }, [planParam]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-white/40 text-sm">{error}</p>
        <button
          onClick={() => { setError(null); setCheckingOut(false); }}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-white/30 hover:text-white/50 transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!planParam && !checkingOut) {
    return <PlanPicker onSelect={startCheckout} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
      <p className="text-white/35 text-sm">Redirecting to checkout…</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
        <p className="text-white/35 text-sm">Loading…</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
