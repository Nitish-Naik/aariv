"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useBilling } from "@/context/useBilling";
import {
  ArrowRight,
  Brain,
  Check,
  Clock,
  Cpu,
  LogOut,
  Pencil,
  Shield,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
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
  const toastRef = useRef<ReturnType<typeof setTimeout>>();

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

  function flash(msg: string, ok = true) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function saveProfile() {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
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
    setTimeout(() => {
      flash("Model preference saved");
      setSavingModel(false);
    }, 300);
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

  const balance = balanceData?.balance ?? null;
  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const balanceFmt = balance === null ? "—" : `$${balance.toFixed(2)}`;
  const estimatedMessages = balance !== null ? Math.floor(balance / 0.01) : null;
  const activeModelName = MODEL_OPTIONS.find((m) => m.id === model)?.name || "GPT-4o Mini";
  const retentionLabel = retention === null ? "forever" : `${retention} days`;
  const modelChanged = pendingModel !== model;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Toast */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center transition-all duration-200 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg border ${
            toast?.ok === false
              ? "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
              : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)]"
          }`}
        >
          {toast?.ok !== false && (
            <Check size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
          )}
          {toast?.msg}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showSignOut}
        title="Sign out?"
        description="You'll be returned to the login screen."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowSignOut(false);
          signOut();
        }}
        onCancel={() => setShowSignOut(false)}
      />
      <ConfirmDialog
        open={showDelete}
        title="Delete account?"
        description="Permanently removes your account, conversations, and integrations. There's no undo."
        confirmLabel="Delete Everything"
        cancelLabel="Keep Account"
        variant="danger"
        onConfirm={async () => {
          setDeleteLoad(true);
          try {
            await api.delete("/auth/account");
            await signOut();
          } catch (e: any) {
            setDeleteLoad(false);
            setShowDelete(false);
            flash(e.message || "Failed to delete.", false);
          }
        }}
        onCancel={() => setShowDelete(false)}
      />
      <ConfirmDialog
        open={showClearHist}
        title="Clear all history?"
        description="This permanently deletes all your chat conversations."
        confirmLabel="Clear History"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={clearHistory}
        onCancel={() => setShowClearHist(false)}
      />

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10 md:py-14 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manage your account, preferences, and data.
          </p>
        </div>

        {/* ── Profile ── */}
        <SectionCard
          label="PROFILE"
          icon={Pencil}
          title="Account Profile"
          subtitle="Your display name and connected account."
        >
          {/* Name row */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                style={{ background: "var(--accent)", color: "var(--bg-deep)" }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  initials
                )}
              </div>
              {editingName ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveProfile();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="text-sm bg-[var(--bg-deep)] border border-[var(--border-strong)] rounded-lg px-3 py-1.5 outline-none text-[var(--text-primary)] w-48"
                />
              ) : (
                <span className="text-sm text-[var(--text-primary)] truncate">
                  {user?.name || "User"}
                </span>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={saveProfile}
                  disabled={savingProf}
                  className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-deep)] text-xs font-semibold disabled:opacity-50"
                >
                  {savingProf ? "…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setDisplayName(user?.name || "");
                    setEditingName(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--overlay)] text-[var(--text-muted)] text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay)] transition-colors shrink-0"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          {/* Email row */}
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
        <SectionCard
          label="MODEL ENGINE"
          icon={Brain}
          title="Intelligence Engine"
          subtitle="The AI model powering your conversations. Applies to all new sessions."
        >
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {MODEL_OPTIONS.map((m) => {
                const isPending = pendingModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPendingModel(m.id)}
                    className={`relative flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all ${
                      isPending
                        ? "border-amber-500/50 bg-amber-500/[0.06]"
                        : "border-[var(--border)] bg-[var(--bg-deep)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {isPending && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check size={11} className="text-black" strokeWidth={2.5} />
                      </div>
                    )}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isPending
                          ? "bg-amber-500/15 border border-amber-500/30"
                          : "bg-[var(--bg-elevated)] border border-[var(--border)]"
                      }`}
                    >
                      <m.icon
                        size={14}
                        className={isPending ? "text-amber-400" : "text-[var(--text-muted)]"}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] pr-6">
                        {m.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 leading-relaxed ${
                          isPending ? "text-amber-400/80" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {m.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)] bg-[var(--bg-deep)]">
            <p className="text-xs text-[var(--text-muted)]">Changes apply to new conversations only</p>
            <button
              onClick={saveModel}
              disabled={savingModel || !modelChanged}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                modelChanged
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-[var(--overlay)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              {savingModel ? "Saving…" : "Save Preference"}
            </button>
          </div>
        </SectionCard>

        {/* ── History & Privacy ── */}
        <SectionCard
          label="HISTORY & PRIVACY"
          icon={Shield}
          title="Auto-delete Conversations"
          subtitle="Automatically purge conversations older than the selected window. Runs nightly."
        >
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex flex-wrap gap-2">
              {RETENTION_OPTIONS.map((opt) => {
                const sel = retention === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => saveRetention(opt.value)}
                    disabled={retSaving}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 ${
                      sel
                        ? "bg-amber-500 text-black"
                        : "bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3.5">
            <Clock size={12} className="text-[var(--text-muted)] shrink-0" />
            <p className="text-xs text-[var(--text-muted)]">
              Conversations older than{" "}
              <span className="font-semibold text-[var(--text-secondary)]">{retentionLabel}</span>{" "}
              are removed each night.
            </p>
          </div>
        </SectionCard>

        {/* ── Usage & Billing ── */}
        <SectionCard
          label="USAGE & BILLING"
          icon={Wallet}
          title="Credit Balance"
          subtitle="Credits are consumed per message based on your active model."
        >
          <div className="px-5 py-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Available Credits
                </p>
                <p
                  className={`text-4xl font-bold tabular-nums ${
                    balance === null || balance >= 1
                      ? "text-amber-400"
                      : balance <= 0
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                >
                  {balanceFmt}
                </p>
                {estimatedMessages !== null && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    ≈ {estimatedMessages.toLocaleString()} {activeModelName} messages remaining
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href="/dashboard/usage"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap"
                >
                  <Wallet size={13} /> Add Credits <ArrowRight size={12} />
                </Link>
                <Link
                  href="/dashboard/usage"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap"
                >
                  <Clock size={13} /> View Usage History <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Advanced ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3 px-1">
            ADVANCED
          </p>
          <div className="space-y-3">
            {/* Session Management */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-xl bg-[var(--overlay)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <LogOut size={15} className="text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Session Management
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Control your active login session on this device.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-[var(--text-muted)]">
                  End your current session. You can sign back in anytime.
                </p>
                <button
                  onClick={() => setShowSignOut(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors shrink-0 whitespace-nowrap"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>

            {/* Clear History */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Chat History</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Permanently delete all conversations from your account.
                  </p>
                </div>
                <button
                  onClick={() => setShowClearHist(true)}
                  disabled={clearingHist}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors shrink-0 whitespace-nowrap disabled:opacity-40"
                >
                  <Trash2 size={13} /> {clearingHist ? "Clearing…" : "Clear History"}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 overflow-hidden">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-red-900/30">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                  <p className="text-xs text-red-400/60 mt-0.5">
                    Irreversible actions. Proceed with absolute caution.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 px-5 py-4">
                <p className="text-sm text-red-400/70">
                  Permanently removes your account, all messages, and connected integrations. Cannot
                  be undone.
                </p>
                <button
                  onClick={() => setShowDelete(true)}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-700/60 bg-red-950/40 text-sm font-medium text-red-400 hover:bg-red-950/60 hover:border-red-600 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40"
                >
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
