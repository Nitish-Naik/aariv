"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  Brain,
  Check,
  Clock,
  Copy,
  Cpu,
  CreditCard,
  ExternalLink,
  Gift,
  History,
  LogOut,
  Moon,
  Pencil,
  RefreshCw,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  Users,
  Wallet,
  X,
  Zap
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const MODEL_OPTIONS = [
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    detail: "Most capable — best for professional & complex work",
    icon: Brain,
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    detail: "Intelligent reasoning — great for coding & agentic tasks",
    icon: Sparkles,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    detail: "Smartest non-reasoning model — fast & accurate",
    icon: Cpu,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    detail: "Fast & cost-efficient — ideal for everyday tasks",
    icon: Zap,
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
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 mb-3 px-1">
        {label}
      </p>
      <div className="rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-neutral-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
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
  const { isDark, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingProf, setSavingProf] = useState(false);

  const [model, setModel] = useState("gpt-4.1-mini");
  const [pendingModel, setPendingModel] = useState("gpt-4.1-mini");
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

  // Referral
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{
    total_referrals: number; signed_up: number; activated: number;
    credited: number; earned: number; max_earnings: number; remaining: number;
  } | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Auto-refill
  const [autoRefill, setAutoRefill] = useState(false);
  const [refillThreshold, setRefillThreshold] = useState(1.0);
  const [refillAmount, setRefillAmount] = useState(10.0);
  const [savingRefill, setSavingRefill] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aariv_model") || "gpt-4.1-mini";
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
      .catch(() => { });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setReferralLoading(true);
    Promise.all([
      api.get("/referral/code"),
      api.get("/referral/stats"),
    ])
      .then(([codeRes, statsRes]) => {
        if (codeRes?.code) setReferralCode(codeRes.code);
        if (statsRes) setReferralStats(statsRes);
      })
      .catch(() => { })
      .finally(() => setReferralLoading(false));
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
      .catch(() => { })
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

  function copyReferralLink() {
    if (!referralCode) return;
    const link = `${window.location.origin}/login?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCodeCopied(true);
    flash("Referral link copied!");
    setTimeout(() => setCodeCopied(false), 2000);
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
  const balanceFmt = balance === null ? "—" : `$${Math.max(0, balance).toFixed(2)}`;
  const estimatedMessages = balance !== null ? Math.max(0, Math.floor(balance / 0.01)) : null;
  const activeModelName = MODEL_OPTIONS.find((m) => m.id === model)?.name || "GPT-4o Mini";
  const retentionLabel = retention === null ? "forever" : `${retention} days`;
  const modelChanged = pendingModel !== model;
  const checkoutAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const checkoutValid = checkoutAmount !== null && checkoutAmount !== undefined && checkoutAmount >= 5 && checkoutAmount <= 500;

  return (
    <div className="min-h-screen bg-black">
      {/* Toast */}
      <div className={`pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center transition-all duration-200 ${toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg border ${toast?.ok === false
          ? "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          : "bg-neutral-900 border-white/10 text-white"
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddCredits(false)} />
          <div className="relative bg-neutral-900 border border-white/10 rounded-xl w-full max-w-sm p-7 shadow-2xl">
            <button onClick={() => setShowAddCredits(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
              <X strokeWidth={1.5} size={14} />
            </button>
            <h2 className="text-base font-semibold text-white mb-0.5">Add Credits</h2>
            <p className="text-xs text-neutral-500 mb-5">Choose an amount to add to your balance.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[10, 25, 50, 100].map((amt) => (
                <button key={amt} onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedAmount === amt && !customAmount
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                    : "bg-black text-neutral-400 border-white/10 hover:border-white/20"
                    }`}>
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-white mb-1.5 block">Custom amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                <input type="number" min={5} max={500} step={0.01} value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  placeholder="5.00 – 500.00"
                  className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-black border border-white/10 text-white text-sm placeholder:text-neutral-500 outline-none focus:border-white/20 transition-colors" />
              </div>
              {customAmount && parseFloat(customAmount) < 5 && (
                <p className="text-[11px] text-red-400 mt-1">Minimum $5.00</p>
              )}
            </div>

            <button onClick={handleCheckout} disabled={!checkoutValid || isCreatingCheckout}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${checkoutValid && !isCreatingCheckout
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-neutral-900 text-neutral-500 cursor-not-allowed opacity-50"
                }`}>
              <CreditCard strokeWidth={1.5} size={15} />
              {isCreatingCheckout ? "Redirecting…" : "Pay with Dodo"}
              {!isCreatingCheckout && <ExternalLink strokeWidth={1.5} size={13} />}
            </button>
            {checkoutError && <p className="text-[11px] text-red-400 text-center mt-2">{checkoutError}</p>}
            <p className="text-[10px] text-neutral-500 text-center mt-3">
              You will be redirected to Dodo Payments to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* ── Usage History Dialog ── */}
      {showUsageHistory && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUsageHistory(false)} />
          <div className="relative bg-neutral-900 border border-white/10 rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-base font-semibold text-white">Usage & History</h2>
              <button onClick={() => setShowUsageHistory(false)}
                className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
                <X strokeWidth={1.5} size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingExtras ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Usage Summary */}
                  <div className="px-5 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity strokeWidth={1.5} size={13} className="text-neutral-500" />
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        {usageData?.period || "Last 30 days"}
                      </p>
                    </div>
                    {usageData && Object.keys(usageData.summary).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(usageData.summary).map(([mdl, data]) => (
                          <div key={mdl} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{mdl}</p>
                              <p className="text-[11px] text-neutral-500">
                                {data.input_tokens.toLocaleString()} in · {data.output_tokens.toLocaleString()} out
                              </p>
                            </div>
                            <span className="text-sm font-mono font-semibold text-amber-400">${data.cost.toFixed(4)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <p className="text-xs font-medium text-neutral-500">Total spent</p>
                          <p className="text-sm font-mono font-bold text-amber-400">${usageData.total_cost.toFixed(4)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">No usage recorded yet.</p>
                    )}
                  </div>

                  {/* Transaction History */}
                  {/* <div className="px-5 pt-4 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <History strokeWidth={1.5} size={13} className="text-neutral-500" />
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Transaction History
                      </p>
                    </div>
                    {historyData.length > 0 ? (
                      <div className="space-y-1">
                        {historyData.map((tx) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-500/10" : "bg-neutral-900"}`}>
                                {isPositive
                                  ? <ArrowUpRight size={13} className="text-emerald-400" />
                                  : <ArrowDownRight size={13} className="text-neutral-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{tx.description}</p>
                                <p className="text-[11px] text-neutral-500">
                                  {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-neutral-500"}`}>
                                  {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(isPositive ? 2 : 4)}
                                </p>
                                <p className="text-[11px] font-mono text-neutral-500">${tx.balance.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">No transaction history.</p>
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
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your account, preferences, and data.</p>
        </div>

        {/* ── Profile ── */}
        <SectionCard label="PROFILE" icon={Pencil} title="Account Profile" subtitle="Your display name and connected account.">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                style={{ background: "white", color: "black" }}>
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : initials}
              </div>
              {editingName ? (
                <input autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveProfile(); if (e.key === "Escape") setEditingName(false); }}
                  className="text-sm bg-black border border-white/20 rounded-lg px-3 py-1.5 outline-none text-white w-48" />
              ) : (
                <span className="text-sm text-white truncate">{user?.name || "User"}</span>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={saveProfile} disabled={savingProf}
                  className="px-3 py-1.5 rounded-lg bg-white text-[black] text-xs font-semibold disabled:opacity-50">
                  {savingProf ? "…" : "Save"}
                </button>
                <button onClick={() => { setDisplayName(user?.name || ""); setEditingName(false); }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-500 text-xs font-medium">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors shrink-0">
                <Pencil strokeWidth={1.5} size={12} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Email</p>
              <p className="text-sm text-neutral-400">{user?.email}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-neutral-900 text-neutral-500 shrink-0">
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
                    className={`relative flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all ${isPending ? "border-amber-500/50 bg-amber-500/[0.06]" : "border-white/10 bg-black hover:border-white/20"
                      }`}>
                    {isPending && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check size={11} className="text-black" strokeWidth={2.5} />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isPending ? "bg-amber-500/15 border border-amber-500/30" : "bg-neutral-900 border border-white/10"
                      }`}>
                      <m.icon size={14} className={isPending ? "text-amber-400" : "text-neutral-500"} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white pr-6">{m.name}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isPending ? "text-amber-400/80" : "text-neutral-500"}`}>{m.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-black">
            <p className="text-xs text-neutral-500">Changes apply to new conversations only</p>
            <button onClick={saveModel} disabled={savingModel || !modelChanged}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${modelChanged ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-neutral-900 text-neutral-500 cursor-not-allowed"
                }`}>
              {savingModel ? "Saving…" : "Save Preference"}
            </button>
          </div>
        </SectionCard>

        {/* ── History & Privacy ── */}
        <SectionCard label="HISTORY & PRIVACY" icon={Shield} title="Auto-delete Conversations"
          subtitle="Automatically purge conversations older than the selected window. Runs nightly.">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              {RETENTION_OPTIONS.map((opt) => {
                const sel = retention === opt.value;
                return (
                  <button key={String(opt.value)} onClick={() => saveRetention(opt.value)} disabled={retSaving}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 ${sel ? "bg-amber-500 text-black" : "bg-black border border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3.5">
            <Clock strokeWidth={1.5} size={12} className="text-neutral-500 shrink-0" />
            <p className="text-xs text-neutral-500">
              Conversations older than <span className="font-semibold text-neutral-400">{retentionLabel}</span> are removed each night.
            </p>
          </div>
        </SectionCard>

        {/* ── Usage & Billing ── */}
        <SectionCard label="USAGE & BILLING" icon={Wallet} title="Credit Balance"
          subtitle="Credits are consumed per message based on your active model.">
          <div className="px-5 py-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Available Credits</p>
                <p className={`text-4xl font-bold tabular-nums ${balance === null || balance >= 1 ? "text-amber-400" : balance <= 0 ? "text-red-500" : "text-amber-500"
                  }`}>{balanceFmt}</p>
                {/* {estimatedMessages !== null && (
                  <p className="text-xs text-neutral-500 mt-1.5">
                    ≈ {estimatedMessages.toLocaleString()} {activeModelName} messages remaining
                  </p>
                )} */}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setShowAddCredits(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap">
                  <Wallet strokeWidth={1.5} size={13} /> Add Credits
                </button>
                <button onClick={() => setShowUsageHistory(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap">
                  <History strokeWidth={1.5} size={13} /> View History
                </button>
              </div>
            </div>
          </div>

          {/* Auto-refill */}
          <div className="px-5 py-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <RefreshCw strokeWidth={1.5} size={13} className="text-neutral-500" />
                <p className="text-sm font-medium text-white">Auto-refill</p>
              </div>
              <button
                onClick={() => setAutoRefill((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${autoRefill ? "bg-amber-500" : "bg-neutral-900 border border-white/10"}`}
                aria-pressed={autoRefill}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${autoRefill ? "left-5" : "left-1"}`} />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Automatically add credits when your balance drops below a threshold.
            </p>

            {autoRefill && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Refill when below</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                      <input
                        type="number" min={0.5} max={50} step={0.5}
                        value={refillThreshold}
                        onChange={(e) => setRefillThreshold(parseFloat(e.target.value) || 0)}
                        className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-black border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Amount to add</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                      <input
                        type="number" min={5} max={200} step={5}
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(parseFloat(e.target.value) || 0)}
                        className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-black border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors"
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
                className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors disabled:opacity-40"
              >
                {savingRefill ? "Saving…" : "Save (disabled)"}
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── Referral Program ── */}
        <SectionCard label="REFERRAL PROGRAM" icon={Gift} title="Invite Friends, Earn Credits"
          subtitle="Share your link — you get $2, they get $7 to start.">
          <div className="px-5 py-5">
            {referralLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Referral Link */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Your Referral Link</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 py-2.5 px-3.5 rounded-xl bg-black border border-white/10 text-sm text-neutral-400 font-mono truncate">
                      {referralCode
                        ? `${typeof window !== "undefined" ? window.location.origin : "calmpilot.app"}/login?ref=${referralCode}`
                        : "Loading..."}
                    </div>
                    <button
                      onClick={copyReferralLink}
                      disabled={!referralCode}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${codeCopied
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500 text-black hover:bg-amber-400"
                        }`}
                    >
                      {codeCopied ? <Check strokeWidth={1.5} size={14} /> : <Copy strokeWidth={1.5} size={14} />}
                      {codeCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                {referralStats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-black border border-white/10 p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users strokeWidth={1.5} size={12} className="text-neutral-500" />
                      </div>
                      <p className="text-xl font-bold text-white tabular-nums">{referralStats.credited}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Successful</p>
                    </div>
                    <div className="rounded-xl bg-black border border-white/10 p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wallet strokeWidth={1.5} size={12} className="text-neutral-500" />
                      </div>
                      <p className="text-xl font-bold text-amber-400 tabular-nums">${referralStats.earned.toFixed(0)}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Earned</p>
                    </div>
                    <div className="rounded-xl bg-black border border-white/10 p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Gift strokeWidth={1.5} size={12} className="text-neutral-500" />
                      </div>
                      <p className="text-xl font-bold text-neutral-400 tabular-nums">${referralStats.remaining.toFixed(0)}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Remaining</p>
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-medium text-neutral-500 mb-2">How it works</p>
                  <div className="space-y-1.5 text-xs text-neutral-500">
                    <p>1. Share your link with a friend</p>
                    <p>2. They sign up and get <span className="text-amber-400 font-medium">$7</span> free credits (vs $5)</p>
                    <p>3. When they make their first purchase, you earn <span className="text-amber-400 font-medium">$2</span></p>
                    <p>4. Earn up to <span className="text-amber-400 font-medium">$50</span> total (25 referrals)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ── Appearance ── */}
        <SectionCard label="APPEARANCE" icon={Moon} title="Theme"
          subtitle="Choose between light and dark mode.">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">{isDark ? "Dark Mode" : "Light Mode"}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{isDark ? "Easy on the eyes at night" : "Bright and clear"}</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${isDark ? "bg-amber-500" : "bg-neutral-900 border border-white/10"}`}
              aria-pressed={isDark}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all flex items-center justify-center ${isDark ? "left-6" : "left-1"}`}>
                {isDark
                  ? <Moon strokeWidth={1.5} size={10} className="text-amber-500" />
                  : <Sun strokeWidth={1.5} size={10} className="text-amber-400" />}
              </span>
            </button>
          </div>
        </SectionCard>

        {/* ── Advanced ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 mb-3 px-1">ADVANCED</p>
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                  <LogOut strokeWidth={1.5} size={15} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Session Management</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Control your active login session on this device.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-neutral-500">End your current session. You can sign back in anytime.</p>
                <button onClick={() => setShowSignOut(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-white/20 transition-colors shrink-0 whitespace-nowrap">
                  <LogOut strokeWidth={1.5} size={13} /> Sign Out
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-white">Chat History</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Permanently delete all conversations from your account.</p>
                </div>
                <button onClick={() => setShowClearHist(true)} disabled={clearingHist}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-white/20 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40">
                  <Trash2 strokeWidth={1.5} size={13} /> {clearingHist ? "Clearing…" : "Clear History"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-red-200 dark:border-red-900/30">
                <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 strokeWidth={1.5} size={15} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">Irreversible actions. Proceed with absolute caution.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-red-600/80 dark:text-red-400/70">
                  Permanently removes your account, all messages, and connected integrations. Cannot be undone.
                </p>
                <button onClick={() => setShowDelete(true)} disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 bg-red-100 text-sm font-medium text-red-600 hover:bg-red-200 hover:border-red-400 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:border-red-600 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40">
                  <Trash2 strokeWidth={1.5} size={13} /> {deleteLoading ? "Deleting…" : "Delete Account"}
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
