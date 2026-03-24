"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  History,
  RefreshCw,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface UsageSummary {
  period: string;
  summary: Record<string, any>;
  total_cost: number;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

/* ── Model name → plain-English label ───────────────────────── */
function getModelLabel(modelId: string): { label: string; hint: string } {
  const id = modelId.toLowerCase();
  if (id.includes("haiku") || id.includes("gpt-4o-mini") || id.includes("mini"))
    return { label: "Fast", hint: "Quick replies & summaries" };
  if (id.includes("opus") || id.includes("gpt-4-turbo") || id.includes("ultra"))
    return { label: "Ultra", hint: "Complex tasks & deep analysis" };
  if (id.includes("sonnet") || id.includes("gpt-4o") || id.includes("powerful"))
    return { label: "Powerful", hint: "Daily briefings & reasoning" };
  if (id.includes("gpt-3") || id.includes("standard"))
    return { label: "Standard", hint: "General assistant usage" };
  return { label: modelId, hint: "" };
}

/* ── Estimate human-readable "calls" from token counts ──────── */
function estimateCalls(inputTokens: number, outputTokens: number): string {
  const total = inputTokens + outputTokens;
  const calls = Math.max(1, Math.round(total / 2000));
  return `~${calls.toLocaleString()} call${calls !== 1 ? "s" : ""}`;
}

/* ── Group transactions by calendar date ────────────────────── */
function groupByDate(
  history: Transaction[],
): { dateLabel: string; rows: Transaction[]; total: number }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of history) {
    const key = new Date(tx.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).map(([dateLabel, rows]) => ({
    dateLabel,
    rows,
    total: rows.reduce((sum, r) => sum + r.amount, 0),
  }));
}

export default function UsagePage() {
  const { user } = useAuth();
  const { balanceData, isLoading: balanceLoading, refetch } = useBilling();

  const [usageData, setUsageData] = useState<UsageSummary | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Auto-refill modal state
  const [showAutoRefill, setShowAutoRefill] = useState(false);
  const [refillEnabled, setRefillEnabled] = useState(
    balanceData?.auto_refill_enabled ?? false,
  );
  const [refillThreshold, setRefillThreshold] = useState("2.00");
  const [refillAmount, setRefillAmount] = useState("10.00");
  const [savingRefill, setSavingRefill] = useState(false);
  const [refillSaved, setRefillSaved] = useState(false);

  useEffect(() => {
    if (balanceData) {
      setRefillEnabled(balanceData.auto_refill_enabled ?? false);
      if (balanceData.auto_refill_threshold)
        setRefillThreshold(String(balanceData.auto_refill_threshold));
      if (balanceData.auto_refill_amount)
        setRefillAmount(String(balanceData.auto_refill_amount));
    }
  }, [balanceData]);

  useEffect(() => {
    if (user) {
      const fetchExtras = async () => {
        try {
          const [usageRes, historyRes] = await Promise.all([
            api.get(`/billing/usage/${user.id}?days=30`),
            api.get(`/billing/history/${user.id}?limit=50`),
          ]);
          if (usageRes) setUsageData(usageRes);
          if (historyRes) setHistory(historyRes);
        } catch {
          // Non-fatal — usage details unavailable
        } finally {
          setLoadingExtras(false);
        }
      };
      fetchExtras();
    }
  }, [user]);

  const balanceValue = balanceData?.balance || 0;
  const progressPercent = Math.min(Math.max((balanceValue / 10) * 100, 0), 100);

  const groupedHistory = useMemo(() => groupByDate(history), [history]);

  const handleSaveRefill = async () => {
    if (!user?.id) return;
    setSavingRefill(true);
    try {
      await api.post(`/billing/setup-auto-refill/${user.id}`, {
        enabled: refillEnabled,
        threshold: parseFloat(refillThreshold),
        amount: parseFloat(refillAmount),
      });
      setRefillSaved(true);
      refetch();
      setTimeout(() => {
        setRefillSaved(false);
        setShowAutoRefill(false);
      }, 1500);
    } catch {
      // Non-fatal — show error state or let user retry
    } finally {
      setSavingRefill(false);
    }
  };

  if (balanceLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 h-full">
        <div className="animate-spin w-8 h-8 border-2 border-foreground/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-[1048px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Usage & Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Credits, usage breakdown, and spending history.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          <div className="space-y-6 flex flex-col">
            {/* ─── Credit Balance ─── */}
            <section className="bg-card border border-border/55 shadow-sm rounded-lg p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Credit Balance
                  </p>
                  <p className="text-3xl font-semibold text-foreground font-mono">
                    ${balanceValue.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Wallet
                    strokeWidth={1.5}
                    size={18}
                    className="text-foreground"
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Balance runway estimate */}
              {usageData &&
                usageData.total_cost > 0.001 &&
                balanceValue > 0 &&
                (() => {
                  const dailyRate = usageData.total_cost / 30;
                  const daysLeft = Math.round(balanceValue / dailyRate);
                  const label =
                    daysLeft <= 0
                      ? "< 1 day"
                      : daysLeft >= 365
                        ? "1+ year"
                        : `~${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
                  return (
                    <p className="text-[11px] text-muted-foreground mb-4">
                      {label} at current usage rate
                    </p>
                  );
                })()}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddCredits(true)}
                  className="px-4 py-2 bg-muted text-foreground text-xs font-medium rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Add Credits
                </button>
                <button
                  onClick={() => setShowAutoRefill(true)}
                  className="px-4 py-2 bg-background text-muted-foreground text-xs font-medium rounded-lg hover:text-foreground transition-colors flex items-center gap-1.5 border border-border/55"
                >
                  <RefreshCw strokeWidth={1.5} size={12} />
                  {balanceData?.auto_refill_enabled
                    ? "Auto-Refill: On"
                    : "Auto-Refill"}
                  {balanceData?.auto_refill_enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                  )}
                </button>
              </div>
            </section>

            {/* ─── Usage Summary ─── */}
            <section className="bg-card border border-border/55 shadow-sm rounded-lg overflow-hidden flex-1">
              <div className="px-6 py-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Activity
                    strokeWidth={1.5}
                    size={16}
                    className="text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    Usage Summary
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {usageData?.period || "Last 30 days"}
                </p>
              </div>

              {usageData && Object.keys(usageData.summary).length > 0 ? (
                <div className="divide-y divide-border/40">
                  {Object.entries(usageData.summary).map(
                    ([model, data]: [string, any]) => {
                      const { label, hint } = getModelLabel(model);
                      const callsEst = estimateCalls(
                        data.input_tokens,
                        data.output_tokens,
                      );
                      return (
                        <div key={model} className="px-6 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium text-foreground">
                                  {label}
                                </p>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {callsEst}
                                </span>
                              </div>
                              {hint && (
                                <p className="text-[11px] text-muted-foreground">
                                  {hint}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-mono text-foreground shrink-0">
                              ${data.cost.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                  {/* Total */}
                  <div className="px-6 py-3 bg-background/60">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Total this period
                      </p>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        ${usageData.total_cost.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {loadingExtras
                      ? "Loading usage..."
                      : "No usage recorded yet."}
                  </p>
                </div>
              )}
            </section>

            {/* ─── Spending History ─── */}
            <section className="bg-card border border-border/55 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <History
                    strokeWidth={1.5}
                    size={14}
                    className="text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    Spending History
                  </p>
                </div>
              </div>

              {history.length > 0 ? (
                <div>
                  {groupedHistory.map(({ dateLabel, rows, total }) => (
                    <div key={dateLabel}>
                      {/* Day header */}
                      <div className="flex items-center justify-between px-6 py-2 border-b border-border/40 bg-background/60">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {dateLabel}
                        </p>
                        <p
                          className={`text-[11px] font-mono ${total >= 0 ? "text-emerald-400" : "text-muted-foreground"}`}
                        >
                          {total >= 0 ? "+" : ""}$
                          {Math.abs(total).toFixed(total >= 0 ? 2 : 4)}
                        </p>
                      </div>
                      {/* Rows for this day */}
                      <div className="divide-y divide-border/40">
                        {rows.map((tx) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <div
                              key={tx.id}
                              className="px-6 py-3 flex items-center gap-3"
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-500/10" : "bg-muted"}`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight
                                    strokeWidth={1.5}
                                    size={13}
                                    className="text-emerald-400"
                                  />
                                ) : (
                                  <ArrowDownRight
                                    strokeWidth={1.5}
                                    size={13}
                                    className="text-muted-foreground"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground truncate">
                                  {tx.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(tx.date).toLocaleTimeString(
                                    "en-US",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p
                                  className={`text-xs font-mono font-medium ${isPositive ? "text-emerald-400" : "text-muted-foreground"}`}
                                >
                                  {isPositive ? "+" : ""}$
                                  {Math.abs(tx.amount).toFixed(
                                    isPositive ? 2 : 4,
                                  )}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground">
                                  ${tx.balance.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {loadingExtras
                      ? "Loading history..."
                      : "No transaction history."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ─── Auto-Refill Modal ─── */}
        {showAutoRefill && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAutoRefill(false)}
            />
            <div className="relative bg-card border border-border/55 rounded-xl w-full max-w-sm p-7 shadow-2xl">
              <button
                onClick={() => setShowAutoRefill(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X strokeWidth={1.5} size={14} />
              </button>

              <div className="flex items-center gap-2.5 mb-1">
                <Zap strokeWidth={1.5} size={16} className="text-foreground" />
                <h2 className="text-lg font-medium text-foreground">
                  Auto-Refill
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Automatically add credits when your balance falls below a
                threshold so CalmPilot never stops mid-task.
              </p>

              {/* Enable toggle */}
              <div className="flex items-center justify-between mb-6 py-3 border-y border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enable auto-refill
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Charge my card automatically
                  </p>
                </div>
                <button
                  onClick={() => setRefillEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${refillEnabled ? "bg-foreground" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${refillEnabled ? "bg-background translate-x-5" : "bg-muted-foreground"}`}
                  />
                </button>
              </div>

              {/* Threshold */}
              <div
                className={`space-y-4 transition-opacity duration-200 ${refillEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}
              >
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    Refill when balance drops below
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={0.5}
                      value={refillThreshold}
                      onChange={(e) => setRefillThreshold(e.target.value)}
                      className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-background border border-border/55 text-foreground text-sm outline-none focus:border-foreground/30 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Trigger when your balance goes under this amount
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    Amount to add
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[5, 10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setRefillAmount(String(amt))}
                        className={`py-2 rounded-lg text-xs font-medium transition-all border ${refillAmount === String(amt) ? "bg-muted text-foreground border-foreground/30" : "bg-background text-muted-foreground border-border hover:border-foreground/30"}`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={5}
                      step={1}
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(e.target.value)}
                      className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-background border border-border/55 text-foreground text-sm outline-none focus:border-foreground/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveRefill}
                disabled={savingRefill || refillSaved}
                className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
              >
                {refillSaved ? (
                  <>
                    <Check
                      strokeWidth={1.5}
                      size={14}
                      className="text-emerald-400"
                    />{" "}
                    Saved
                  </>
                ) : savingRefill ? (
                  "Saving…"
                ) : (
                  "Save settings"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── Add Credits Modal ─── */}
        <Dialog open={showAddCredits} onOpenChange={setShowAddCredits}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits</DialogTitle>
              <DialogDescription>
                Choose an amount to add to your balance.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ring-1 ring-inset ${
                      selectedAmount === amt && !customAmount
                        ? "bg-amber-500/10 text-amber-400 ring-amber-500/40"
                        : "bg-white/[0.05] text-muted-foreground ring-foreground/10 hover:ring-foreground/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    step={0.01}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="5.00 – 500.00"
                    className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-background ring-1 ring-inset ring-foreground/10 text-foreground text-sm placeholder:text-muted-foreground outline-none focus-within:ring-foreground/20 focus-within:bg-white/[0.06] transition-colors"
                  />
                </div>
                {customAmount && parseFloat(customAmount) < 5 && (
                  <p className="text-[11px] text-red-400 mt-1">Minimum $5.00</p>
                )}
              </div>
            </div>

            {checkoutError && (
              <p className="text-[11px] text-red-400">{checkoutError}</p>
            )}

            <DialogFooter>
              <button
                onClick={() => setShowAddCredits(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              {(() => {
                const amount = customAmount
                  ? parseFloat(customAmount)
                  : selectedAmount;
                const isValid =
                  amount !== null &&
                  amount !== undefined &&
                  amount >= 5 &&
                  amount <= 500;
                return (
                  <button
                    onClick={async () => {
                      if (!isValid || isCreatingCheckout) return;
                      setCheckoutError(null);
                      setIsCreatingCheckout(true);
                      try {
                        const data = await api.post(
                          "/billing/create-checkout",
                          { amount },
                        );
                        if (data?.checkout_url) {
                          window.location.href = data.checkout_url;
                        } else {
                          setCheckoutError(
                            "No checkout URL returned. Please try again.",
                          );
                        }
                      } catch (e: any) {
                        setCheckoutError(
                          e?.message ||
                            "Failed to start checkout. Please try again.",
                        );
                      } finally {
                        setIsCreatingCheckout(false);
                      }
                    }}
                    disabled={!isValid || isCreatingCheckout}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                      isValid && !isCreatingCheckout
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    <CreditCard strokeWidth={1.5} size={15} />
                    {isCreatingCheckout ? "Redirecting…" : "Pay with Dodo"}
                    {!isCreatingCheckout && (
                      <ExternalLink strokeWidth={1.5} size={13} />
                    )}
                  </button>
                );
              })()}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

