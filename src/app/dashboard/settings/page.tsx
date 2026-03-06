"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useBilling } from "@/context/useBilling";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Check,
  Clock,
  Cpu,
  CreditCard,
  ExternalLink,
  History,
  LogOut,
  Pencil,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const MODEL_OPTIONS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    detail: "Most capable — best for complex reasoning tasks",
    icon: Brain,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    detail: "Fast & efficient — great for everyday tasks",
    icon: Zap,
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    detail: "Advanced reasoning — great for math & coding",
    icon: Cpu,
  },
  {
    id: "o1",
    name: "o1",
    detail: "Deep thinking — tackles the hardest problems",
    icon: Sparkles,
  },
] as const;

const RETENTION_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "Keep forever", value: null },
] as const;

function SectionCard({
  label,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  label: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3 px-1">
        {label}
      </p>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-[var(--border)]">
          <div className="w-9 h-9 rounded-xl bg-[var(--overlay)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <Icon size={15} className="text-[var(--text-secondary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

interface UsageSummary {
  period: string;
  summary: Record<string, { input_tokens: number; output_tokens: number; cost: number }>;
  total_cost: number;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingProf, setSavingProf] = useState(false);

  const [model, setModel] = useState("gpt-4o-mini");
  const [pendingModel, setPendingModel] = useState("gpt-4o-mini");
  const [savingModel, setSavingModel] = useState(false);

  const [retention, setRetention] = useState<number | null>(null);
  const [retSaving, setRetSaving] = useState(false);
  const [clearingHist, setClearHist] = useState(false);
  const [deleteLoading, setDeleteLoad] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showClearHist, setShowClearHist] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Add Credits dialog
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Usage History dialog
  const [showUsageHistory, setShowUsageHistory] = useState(false);
  const [usageData, setUsageData] = useState<UsageSummary | null>(null);
  const [historyData, setHistoryData] = useState<Transaction[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Auto-refill
  const [autoRefill, setAutoRefill] = useState(false);
  const [refillThreshold, setRefillThreshold] = useState(1.0);
  const [refillAmount, setRefillAmount] = useState(10.0);
  const [savingRefill, setSavingRefill] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aariv_model") || "gpt-4o-mini";
    setModel(saved);
    setPendingModel(saved);
  }, []);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/history/retention/${user.id}`)
      .then((d) => d && setRetention(d.retention_days))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!balanceData) return;
    setAutoRefill(balanceData.auto_refill_enabled ?? false);
    setRefillThreshold(balanceData.auto_refill_threshold ?? 1.0);
    setRefillAmount(balanceData.auto_refill_amount ?? 10.0);
  }, [balanceData]);

  useEffect(() => {
    if (!showUsageHistory || !user?.id) return;
    setLoadingExtras(true);
    Promise.all([
      api.get(`/billing/usage/${user.id}?days=30`),
      api.get(`/billing/history/${user.id}?limit=20`),
    ])
      .then(([usage, history]) => {
        if (usage) setUsageData(usage);
        if (history) setHistoryData(history);
      })
      .catch(() => {})
      .finally(() => setLoadingExtras(false));
  }, [showUsageHistory, user?.id]);

  function flash(msg: string, ok = true) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function saveProfile() {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === user?.name) { setEditingName(false); return; }
    setSavingProf(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
      if (error) throw error;
      setEditingName(false);
      flash("Name updated");
    } catch (e: any) {
      flash(e.message || "Failed to update name", false);
    } finally {
      setSavingProf(false);
    }
  }

  function saveModel() {
    setSavingModel(true);
    setModel(pendingModel);
    localStorage.setItem("aariv_model", pendingModel);
    window.dispatchEvent(new CustomEvent("aariv-model-change", { detail: pendingModel }));
    setTimeout(() => { flash("Model preference saved"); setSavingModel(false); }, 300);
  }

  async function saveRetention(days: number | null) {
    if (!user?.id) return;
    setRetSaving(true);
    try {
      await api.put(`/history/retention/${user.id}`, { days });
      setRetention(days);
      flash("Retention updated");
    } catch {
      flash("Failed to save", false);
    } finally {
      setRetSaving(false);
    }
  }

  async function clearHistory() {
    if (!user?.id) return;
    setClearHist(true);
    try {
      await api.delete(`/history/conversations/user/${user.id}`);
      flash("Chat history cleared");
    } catch (e: any) {
      flash(e.message || "Failed to clear history", false);
    } finally {
      setClearHist(false);
      setShowClearHist(false);
    }
  }

  async function saveAutoRefill() {
    if (!user?.id) return;
    setSavingRefill(true);
    try {
      await api.post(`/billing/setup-auto-refill/${user.id}`, {
        enabled: autoRefill,
        threshold: refillThreshold,
        amount: refillAmount,
      });
      flash("Auto-refill settings saved");
    } catch {
      flash("Failed to save auto-refill", false);
    } finally {
      setSavingRefill(false);
    }
  }

  async function handleCheckout() {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 5 || amount > 500 || isCreatingCheckout) return;
    setCheckoutError(null);
    setIsCreatingCheckout(true);
    try {
      const data = await api.post("/billing/create-checkout", { amount });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
      }
    } catch (e: any) {
      setCheckoutError(e?.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsCreatingCheckout(false);
    }
  }

  const balance = balanceData?.balance ?? null;
  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const balanceFmt = balance === null ? "—" : `$${balance.toFixed(2)}`;
  const estimatedMessages = balance !== null ? Math.floor(balance / 0.01) : null;
  const activeModelName = MODEL_OPTIONS.find((m) => m.id === model)?.name || "GPT-4o Mini";
  const retentionLabel = retention === null ? "forever" : `${retention} days`;
  const modelChanged = pendingModel !== model;
  const checkoutAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const checkoutValid = checkoutAmount !== null && checkoutAmount !== undefined && checkoutAmount >= 5 && checkoutAmount <= 500;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Toast */}
      <div className={`pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center transition-all duration-200 ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg border ${
          toast?.ok === false
            ? "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)]"
        }`}>
          {toast?.ok !== false && <Check size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />}
          {toast?.msg}
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog open={showSignOut} title="Sign out?" description="You'll be returned to the login screen."
        confirmLabel="Sign Out" cancelLabel="Cancel" variant="danger"
        onConfirm={() => { setShowSignOut(false); signOut(); }} onCancel={() => setShowSignOut(false)} />
      <ConfirmDialog open={showDelete} title="Delete account?"
        description="Permanently removes your account, conversations, and integrations. There's no undo."
        confirmLabel="Delete Everything" cancelLabel="Keep Account" variant="danger"
        onConfirm={async () => {
          setDeleteLoad(true);
          try { await api.delete("/auth/account"); await signOut(); }
          catch (e: any) { setDeleteLoad(false); setShowDelete(false); flash(e.message || "Failed to delete.", false); }
        }} onCancel={() => setShowDelete(false)} />
      <ConfirmDialog open={showClearHist} title="Clear all history?"
        description="This permanently deletes all your chat conversations."
        confirmLabel="Clear History" cancelLabel="Cancel" variant="danger"
        onConfirm={clearHistory} onCancel={() => setShowClearHist(false)} />

      {/* ── Add Credits Dialog ── */}
      {showAddCredits && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[var(--bg-deep)]/80 backdrop-blur-sm" onClick={() => setShowAddCredits(false)} />
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-7 shadow-2xl">
            <button onClick={() => setShowAddCredits(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[var(--overlay)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X size={14} />
            </button>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">Add Credits</h2>
            <p className="text-xs text-[var(--text-muted)] mb-5">Choose an amount to add to your balance.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[10, 25, 50, 100].map((amt) => (
                <button key={amt} onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedAmount === amt && !customAmount
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                      : "bg-[var(--bg-deep)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]"
                  }`}>
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">Custom amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
                <input type="number" min={5} max={500} step={0.01} value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  placeholder="5.00 – 500.00"
                  className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-strong)] transition-colors" />
              </div>
              {customAmount && parseFloat(customAmount) < 5 && (
                <p className="text-[11px] text-red-400 mt-1">Minimum $5.00</p>
              )}
            </div>

            <button onClick={handleCheckout} disabled={!checkoutValid || isCreatingCheckout}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                checkoutValid && !isCreatingCheckout
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-[var(--overlay)] text-[var(--text-muted)] cursor-not-allowed opacity-50"
              }`}>
              <CreditCard size={15} />
              {isCreatingCheckout ? "Redirecting…" : "Pay with Dodo"}
              {!isCreatingCheckout && <ExternalLink size={13} />}
            </button>
            {checkoutError && <p className="text-[11px] text-red-400 text-center mt-2">{checkoutError}</p>}
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-3">
              You will be redirected to Dodo Payments to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* ── Usage History Dialog ── */}
      {showUsageHistory && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[var(--bg-deep)]/80 backdrop-blur-sm" onClick={() => setShowUsageHistory(false)} />
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Usage & History</h2>
              <button onClick={() => setShowUsageHistory(false)}
                className="w-7 h-7 rounded-lg bg-[var(--overlay)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingExtras ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Usage Summary */}
                  <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={13} className="text-[var(--text-muted)]" />
                      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        {usageData?.period || "Last 30 days"}
                      </p>
                    </div>
                    {usageData && Object.keys(usageData.summary).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(usageData.summary).map(([mdl, data]) => (
                          <div key={mdl} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{mdl}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">
                                {data.input_tokens.toLocaleString()} in · {data.output_tokens.toLocaleString()} out
                              </p>
                            </div>
                            <span className="text-sm font-mono font-semibold text-amber-400">${data.cost.toFixed(4)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                          <p className="text-xs font-medium text-[var(--text-muted)]">Total spent</p>
                          <p className="text-sm font-mono font-bold text-amber-400">${usageData.total_cost.toFixed(4)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No usage recorded yet.</p>
                    )}
                  </div>

                  {/* Transaction History */}
                  {/* <div className="px-5 pt-4 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <History size={13} className="text-[var(--text-muted)]" />
                      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Transaction History
                      </p>
                    </div>
                    {historyData.length > 0 ? (
                      <div className="space-y-1">
                        {historyData.map((tx) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-500/10" : "bg-[var(--overlay)]"}`}>
                                {isPositive
                                  ? <ArrowUpRight size={13} className="text-emerald-400" />
                                  : <ArrowDownRight size={13} className="text-[var(--text-muted)]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--text-primary)] truncate">{tx.description}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                  {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                                  {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(isPositive ? 2 : 4)}
                                </p>
                                <p className="text-[11px] font-mono text-[var(--text-muted)]">${tx.balance.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No transaction history.</p>
                    )}
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10 md:py-14 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your account, preferences, and data.</p>
        </div>

        {/* ── Profile ── */}
        <SectionCard label="PROFILE" icon={Pencil} title="Account Profile" subtitle="Your display name and connected account.">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                style={{ background: "var(--accent)", color: "var(--bg-deep)" }}>
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : initials}
              </div>
              {editingName ? (
                <input autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveProfile(); if (e.key === "Escape") setEditingName(false); }}
                  className="text-sm bg-[var(--bg-deep)] border border-[var(--border-strong)] rounded-lg px-3 py-1.5 outline-none text-[var(--text-primary)] w-48" />
              ) : (
                <span className="text-sm text-[var(--text-primary)] truncate">{user?.name || "User"}</span>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={saveProfile} disabled={savingProf}
                  className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-deep)] text-xs font-semibold disabled:opacity-50">
                  {savingProf ? "…" : "Save"}
                </button>
                <button onClick={() => { setDisplayName(user?.name || ""); setEditingName(false); }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--overlay)] text-[var(--text-muted)] text-xs font-medium">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay)] transition-colors shrink-0">
                <Pencil size={12} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">Email</p>
              <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--overlay)] text-[var(--text-muted)] shrink-0">
              Google OAuth
            </span>
          </div>
        </SectionCard>

        {/* ── AI Model ── */}
        <SectionCard label="MODEL ENGINE" icon={Brain} title="Intelligence Engine"
          subtitle="The AI model powering your conversations. Applies to all new sessions.">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {MODEL_OPTIONS.map((m) => {
                const isPending = pendingModel === m.id;
                return (
                  <button key={m.id} onClick={() => setPendingModel(m.id)}
                    className={`relative flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all ${
                      isPending ? "border-amber-500/50 bg-amber-500/[0.06]" : "border-[var(--border)] bg-[var(--bg-deep)] hover:border-[var(--border-strong)]"
                    }`}>
                    {isPending && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check size={11} className="text-black" strokeWidth={2.5} />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isPending ? "bg-amber-500/15 border border-amber-500/30" : "bg-[var(--bg-elevated)] border border-[var(--border)]"
                    }`}>
                      <m.icon size={14} className={isPending ? "text-amber-400" : "text-[var(--text-muted)]"} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] pr-6">{m.name}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isPending ? "text-amber-400/80" : "text-[var(--text-muted)]"}`}>{m.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)] bg-[var(--bg-deep)]">
            <p className="text-xs text-[var(--text-muted)]">Changes apply to new conversations only</p>
            <button onClick={saveModel} disabled={savingModel || !modelChanged}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                modelChanged ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-[var(--overlay)] text-[var(--text-muted)] cursor-not-allowed"
              }`}>
              {savingModel ? "Saving…" : "Save Preference"}
            </button>
          </div>
        </SectionCard>

        {/* ── History & Privacy ── */}
        <SectionCard label="HISTORY & PRIVACY" icon={Shield} title="Auto-delete Conversations"
          subtitle="Automatically purge conversations older than the selected window. Runs nightly.">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex flex-wrap gap-2">
              {RETENTION_OPTIONS.map((opt) => {
                const sel = retention === opt.value;
                return (
                  <button key={String(opt.value)} onClick={() => saveRetention(opt.value)} disabled={retSaving}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 ${
                      sel ? "bg-amber-500 text-black" : "bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3.5">
            <Clock size={12} className="text-[var(--text-muted)] shrink-0" />
            <p className="text-xs text-[var(--text-muted)]">
              Conversations older than <span className="font-semibold text-[var(--text-secondary)]">{retentionLabel}</span> are removed each night.
            </p>
          </div>
        </SectionCard>

        {/* ── Usage & Billing ── */}
        <SectionCard label="USAGE & BILLING" icon={Wallet} title="Credit Balance"
          subtitle="Credits are consumed per message based on your active model.">
          <div className="px-5 py-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Available Credits</p>
                <p className={`text-4xl font-bold tabular-nums ${
                  balance === null || balance >= 1 ? "text-amber-400" : balance <= 0 ? "text-red-500" : "text-amber-500"
                }`}>{balanceFmt}</p>
                {estimatedMessages !== null && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    ≈ {estimatedMessages.toLocaleString()} {activeModelName} messages remaining
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setShowAddCredits(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap">
                  <Wallet size={13} /> Add Credits
                </button>
                <button onClick={() => setShowUsageHistory(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap">
                  <History size={13} /> View History
                </button>
              </div>
            </div>
          </div>

          {/* Auto-refill */}
          <div className="px-5 py-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <RefreshCw size={13} className="text-[var(--text-muted)]" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Auto-refill</p>
              </div>
              <button
                onClick={() => setAutoRefill((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${autoRefill ? "bg-amber-500" : "bg-[var(--overlay)] border border-[var(--border)]"}`}
                aria-pressed={autoRefill}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${autoRefill ? "left-5" : "left-1"}`} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Automatically add credits when your balance drops below a threshold.
            </p>

            {autoRefill && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Refill when below</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
                      <input
                        type="number" min={0.5} max={50} step={0.5}
                        value={refillThreshold}
                        onChange={(e) => setRefillThreshold(parseFloat(e.target.value) || 0)}
                        className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-strong)] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Amount to add</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
                      <input
                        type="number" min={5} max={200} step={5}
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(parseFloat(e.target.value) || 0)}
                        className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-strong)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={saveAutoRefill}
                  disabled={savingRefill}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {savingRefill ? "Saving…" : "Save Auto-refill"}
                </button>
              </div>
            )}

            {!autoRefill && (
              <button
                onClick={saveAutoRefill}
                disabled={savingRefill}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40"
              >
                {savingRefill ? "Saving…" : "Save (disabled)"}
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── Advanced ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3 px-1">ADVANCED</p>
          <div className="space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-xl bg-[var(--overlay)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <LogOut size={15} className="text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Session Management</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Control your active login session on this device.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-[var(--text-muted)]">End your current session. You can sign back in anytime.</p>
                <button onClick={() => setShowSignOut(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors shrink-0 whitespace-nowrap">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Chat History</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Permanently delete all conversations from your account.</p>
                </div>
                <button onClick={() => setShowClearHist(true)} disabled={clearingHist}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors shrink-0 whitespace-nowrap disabled:opacity-40">
                  <Trash2 size={13} /> {clearingHist ? "Clearing…" : "Clear History"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-red-900/30">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                  <p className="text-xs text-red-400/60 mt-0.5">Irreversible actions. Proceed with absolute caution.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-red-400/70">
                  Permanently removes your account, all messages, and connected integrations. Cannot be undone.
                </p>
                <button onClick={() => setShowDelete(true)} disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-700/60 bg-red-950/40 text-sm font-medium text-red-400 hover:bg-red-950/60 hover:border-red-600 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40">
                  <Trash2 size={13} /> {deleteLoading ? "Deleting…" : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
