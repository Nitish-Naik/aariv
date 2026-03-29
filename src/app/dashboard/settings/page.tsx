"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Pencil,
  Shield,
  Sparkles,
  Sun,
  Sunrise,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useUpgradeDialog } from "@/components/UpgradeDialog";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const MODEL_OPTIONS = [
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    tier: "Pro",
    detail: "Most capable — best for professional & complex work",
    icon: Brain,
    minTier: "pro",
  },
  // GPT-5 removed — two models at $49/mo created confusion with no clear choice.
  // Keeping GPT-5.4 as the single Pro-tier model.
  // {
  //   id: "gpt-5",
  //   name: "GPT-5",
  //   tier: "Powerful",
  //   detail: "Intelligent reasoning — great for coding & agentic tasks",
  //   icon: Sparkles,
  //   minTier: "pro",
  // },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    tier: "Standard",
    detail: "Fast & accurate — great for everyday tasks",
    icon: Cpu,
    minTier: "starter",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    tier: "Fast",
    detail: "Lightweight — handles simple requests quickly",
    icon: Zap,
    minTier: "free",
  },
] as const;

function tierRank(t: string) {
  return { free: 0, starter: 1, pro: 2 }[t] ?? 0;
}

const BRIEFING_TIME_PRESETS = [
  { label: "5:00 AM", value: "05:00" },
  { label: "6:00 AM", value: "06:00" },
  { label: "10:00 AM", value: "10:00" },
] as const;

function formatTimeLabel(value: string): string {
  const [hRaw, mRaw] = value.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const BRIEFING_TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { value, label: formatTimeLabel(value) };
});

const RETENTION_OPTIONS = [
  {
    label: "7 days",
    value: 7,
    description:
      "Minimal storage. CalmPilot won't remember chats from last week.",
  },
  {
    label: "30 days",
    value: 30,
    description: "Recommended. Good balance of memory and privacy.",
  },
  {
    label: "90 days",
    value: 90,
    description: "CalmPilot has longer context across sessions.",
  },
  {
    label: "Keep forever",
    value: null,
    description: "Keep everything. You can manually delete at any time.",
  },
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
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 py-8 md:py-10">
      <div className="flex flex-col pr-4">
        <h2 className="text-sm font-semibold text-white tracking-[-0.01em]">{title}</h2>
        <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      </div>
      <div className="min-w-0">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const { openUpgrade } = useUpgradeDialog();
  const { isDark, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingProf, setSavingProf] = useState(false);

  const [model, setModel] = useState("gpt-4.1-mini");
  const [pendingModel, setPendingModel] = useState("gpt-4.1-mini");
  const [savingModel, setSavingModel] = useState(false);

  const [retention, setRetention] = useState<number | null>(null);
  const [pendingRetention, setPendingRetention] = useState<
    number | null | undefined
  >(undefined);
  const [retSaving, setRetSaving] = useState(false);
  const [clearingHist, setClearHist] = useState(false);
  const [deleteLoading, setDeleteLoad] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showClearHist, setShowClearHist] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();
  const [upgradeTier, setUpgradeTier] = useState<"starter" | "pro">("starter");

  // Briefing time preference
  const [briefingMode, setBriefingMode] = useState<"smart" | "fixed">("fixed");
  const [briefingTime, setBriefingTime] = useState("08:00");
  const [showCustomBriefingTime, setShowCustomBriefingTime] = useState(true);
  const [savingBriefing, setSavingBriefing] = useState(false);

  useEffect(() => {
    // Seed from localStorage immediately (no flicker)
    const savedModel =
      localStorage.getItem("calmpilot_model") || "gpt-4.1-mini";
    setModel(savedModel);
    setPendingModel(savedModel);
    const bMode = (localStorage.getItem("calmpilot_briefing_mode") ||
      "fixed") as "smart" | "fixed";
    const bTime = localStorage.getItem("calmpilot_briefing_time") || "08:00";
    setBriefingMode(bMode === "smart" ? "fixed" : bMode);
    setBriefingTime(bTime);
    setShowCustomBriefingTime(
      !BRIEFING_TIME_PRESETS.some((preset) => preset.value === bTime),
    );
  }, []);

  // Seed display name from in-memory auth context immediately (no request)
  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  // Single parallel fetch for all user-specific settings — fires once when userId is ready
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get("/auth/me"),
      api.get(`/history/retention/${user.id}`),
    ])
      .then(([me, retentionRes]) => {
        // Profile & preferences
        if (me) {
          if (me.preferred_model) {
            setModel(me.preferred_model);
            setPendingModel(me.preferred_model);
            localStorage.setItem("calmpilot_model", me.preferred_model);
          }
          if (me.briefing_mode) {
            const mode =
              me.briefing_mode === "smart" ? "fixed" : me.briefing_mode;
            setBriefingMode(mode as "smart" | "fixed");
            localStorage.setItem("calmpilot_briefing_mode", mode);
          }
          if (me.briefing_time) {
            setBriefingTime(me.briefing_time);
            localStorage.setItem("calmpilot_briefing_time", me.briefing_time);
            setShowCustomBriefingTime(
              !BRIEFING_TIME_PRESETS.some(
                (preset) => preset.value === me.briefing_time,
              ),
            );
          }
        }
        // History retention
        if (retentionRes) {
          setRetention(retentionRes.retention_days);
          setPendingRetention(retentionRes.retention_days);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  function flash(msg: string, ok = true) {
    if (ok) toastSuccess(msg);
    else toastError(msg);
  }

  async function saveProfile() {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingProf(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) throw error;
      setEditingName(false);
      flash("Name updated");
    } catch (e: any) {
      flash(e.message || "Failed to update name", false);
    } finally {
      setSavingProf(false);
    }
  }

  async function saveModel() {
    setSavingModel(true);
    setModel(pendingModel);
    localStorage.setItem("calmpilot_model", pendingModel);
    window.dispatchEvent(
      new CustomEvent("calmpilot-model-change", { detail: pendingModel }),
    );
    try {
      await api.patch("/auth/model", { model: pendingModel });
    } catch {
      /* localStorage already updated — non-fatal */
    }
    flash("Model preference saved");
    setSavingModel(false);
  }

  async function saveBriefing() {
    setSavingBriefing(true);
    localStorage.setItem("calmpilot_briefing_mode", "fixed");
    localStorage.setItem("calmpilot_briefing_time", briefingTime);
    try {
      await api.put(`/settings/briefing`, {
        mode: "fixed",
        time: briefingTime,
      });
    } catch {
      /* persisted locally even if API call fails */
    }
    flash("Briefing preference saved");
    setSavingBriefing(false);
  }

  async function saveRetention(days: number | null) {
    if (!user?.id) return;
    setRetSaving(true);
    try {
      await api.put(`/history/retention/${user.id}`, { days });
      setRetention(days);
      setPendingRetention(days);
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


  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  const tier = balanceData?.subscription_tier ?? "free";
  const chatUsed = balanceData?.chat_messages_used ?? 0;
  const chatLimit = balanceData?.chat_messages_limit ?? 50;
  const triggerUsed = balanceData?.trigger_fires_today ?? 0;
  const triggerLimit = balanceData?.trigger_fires_limit ?? 10;
  const chatPct = chatLimit > 0 ? Math.round((chatUsed / chatLimit) * 100) : 0;
  const triggerPct = triggerLimit > 0 ? Math.round((triggerUsed / triggerLimit) * 100) : 0;
  const tierLabel =
    tier === "starter" ? "Starter" :
    tier === "pro" ? "Pro" : "Free";
  const tierBadgeClass =
    tier === "starter" ? "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/30" :
    tier === "pro" ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30" :
    "bg-white/[0.07] text-muted-foreground ring-1 ring-inset ring-white/[0.08]";

  return (
    <div className="min-h-screen bg-background">
      {/* Confirm Dialogs */}
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
      {showDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              if (!deleteLoading) {
                setShowDelete(false);
                setDeleteConfirmText("");
              }
            }}
          />
          <div className="relative w-full max-w-[400px] animate-in fade-in-0 zoom-in-[0.98] duration-150">
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <h2 className="text-[13px] font-medium text-[#e6edf3]">Delete your account</h2>
                {!deleteLoading && (
                  <button
                    onClick={() => { setShowDelete(false); setDeleteConfirmText(""); }}
                    className="w-7 h-7 -mr-1.5 rounded-md flex items-center justify-center text-[#484f58] hover:text-[#e6edf3] transition-colors"
                  >
                    <X strokeWidth={1.75} size={16} />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="px-4 py-4 space-y-4">
                <p className="text-[13px] text-[#848d97] leading-relaxed">
                  This permanently removes your account, all conversations, and
                  every connected integration.{" "}
                  <span className="text-[#da3633] font-medium">There is no undo.</span>
                </p>

                <div>
                  <label className="text-[12px] font-medium text-[#848d97] mb-1.5 block">
                    Type{" "}
                    <span className="font-mono text-[#e6edf3] font-semibold">DELETE</span>{" "}
                    to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full py-[6px] px-3 rounded-md bg-[#0a0a0a] border border-white/[0.1] text-[#e6edf3] text-[13px] outline-none focus:border-white/[0.2] transition-colors placeholder:text-[#484f58] font-mono"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/[0.06]">
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirmText(""); }}
                  disabled={deleteLoading}
                  className="px-3 py-[5px] rounded-md text-[13px] font-medium bg-[#1a1a1a] border border-white/[0.1] text-[#c9d1d9] hover:bg-[#252525] hover:border-white/[0.15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleteLoad(true);
                    try {
                      // Account deletion takes longer — Composio cleanup, DB purge, etc.
                      const headers = await (await import("@/lib/supabase")).supabase.auth.getSession()
                        .then(({ data }) => ({
                          "Content-Type": "application/json",
                          ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
                        }));
                      const controller = new AbortController();
                      setTimeout(() => controller.abort(), 120000); // 2 min timeout
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/account`, {
                        method: "DELETE",
                        headers,
                        signal: controller.signal,
                      });
                      if (!res.ok) throw new Error("Failed to delete account");
                      await signOut();
                    } catch (e: any) {
                      setDeleteLoad(false);
                      setShowDelete(false);
                      setDeleteConfirmText("");
                      flash(e.message || "Failed to delete.", false);
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                  className="px-3 py-[5px] rounded-md text-[13px] font-medium bg-[#da3633] border border-[#da3633] text-white hover:bg-[#c42b28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {deleteLoading && <Loader2 size={13} className="animate-spin" />}
                  {deleteLoading ? "Deleting…" : "Delete everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

      {/* Page header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.06]">
        <h1 className="text-base font-semibold text-white tracking-[-0.01em]">Settings</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          Manage your account, preferences, and data.
        </p>
      </div>

      <div className="max-w-[1048px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col">
          {/* ── Profile ── */}
          <SectionCard
            label="PROFILE"
            icon={Pencil}
            title="Account Profile"
            subtitle="Your display name and connected account."
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 ring-1 ring-inset ring-white/[0.08] border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                  style={{ background: "white", color: "black" }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full object-cover"
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.textContent = initials;
                      }}
                    />
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
                    className="text-sm bg-background ring-1 ring-inset ring-white/[0.08] rounded-lg px-3 py-1.5 outline-none text-foreground w-48 focus-within:ring-foreground/20"
                  />
                ) : (
                  <span className="text-sm text-foreground truncate">
                    {user?.name || "User"}
                  </span>
                )}
              </div>
              {editingName ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={saveProfile}
                    disabled={savingProf}
                    className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                  >
                    {savingProf ? "…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setDisplayName(user?.name || "");
                      setEditingName(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-medium hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <Pencil strokeWidth={1.5} size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full ring-1 ring-inset ring-white/[0.08] bg-white/[0.05] text-muted-foreground shrink-0">
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
            <div className="p-4 space-y-2">
              {MODEL_OPTIONS.map((m) => {
                const isPending = pendingModel === m.id;
                const locked = tierRank(tier) < tierRank(m.minTier);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (locked) {
                        setUpgradeTier(m.minTier === "pro" ? "pro" : "starter");
                        openUpgrade("model");
                      } else {
                        setPendingModel(m.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ring-1 ring-inset transition-all text-left ${
                      isPending && !locked
                        ? "bg-amber-500/[0.08] ring-amber-500/30"
                        : locked
                          ? "bg-white/[0.03] ring-white/[0.08] hover:ring-violet-500/30 hover:bg-violet-500/[0.04]"
                          : "bg-white/[0.04] ring-white/[0.10] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-inset transition-all ${
                      isPending && !locked
                        ? "bg-amber-500/15 ring-amber-500/30"
                        : locked
                          ? "bg-white/[0.05] ring-white/[0.08]"
                          : "bg-white/[0.04] ring-white/10"
                    }`}>
                      <m.icon size={14} className={
                        isPending && !locked
                          ? "text-amber-400"
                          : locked
                            ? "text-white/50"
                            : "text-white/70"
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-semibold truncate ${
                          isPending && !locked ? "text-amber-300" : locked ? "text-white/70" : "text-white/90"
                        }`}>{m.tier}</p>
                        <span className={`text-[10px] font-mono shrink-0 ${
                          isPending && !locked ? "text-amber-400/70" : "text-white/55"
                        }`}>{m.name}</span>
                      </div>
                      <p className={`text-[11px] truncate leading-tight ${locked ? "text-white/50" : "text-white/60"}`}>{m.detail}</p>
                    </div>
                    {locked ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 ring-1 ring-inset ring-violet-500/20">
                          {m.minTier === "pro" ? "$49/mo" : "$19/mo"}
                        </span>
                        <Lock size={12} className="text-white/50" />
                      </div>
                    ) : isPending ? (
                      <Check size={14} className="text-amber-500 shrink-0" strokeWidth={2.5} />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Save bar — only when selection differs from current */}
            {pendingModel !== model && tierRank(tier) >= tierRank(MODEL_OPTIONS.find((m) => m.id === pendingModel)?.minTier ?? "free") && (
              <div className="px-4 pb-4 flex items-center gap-2">
                <button
                  onClick={() => setPendingModel(model)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.04] hover:bg-white/[0.07] ring-1 ring-inset ring-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveModel}
                  disabled={savingModel}
                  className="flex-1 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97]"
                >
                  {savingModel ? "Saving…" : "Save Preference"}
                </button>
              </div>
            )}

            <div className="px-5 py-3 border-t border-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">
                Changes apply to new conversations only
              </p>
            </div>
          </SectionCard>

          {/* ── Briefing Schedule ── */}
          <SectionCard
            label="MORNING BRIEFING"
            icon={Sunrise}
            title="Briefing Schedule"
            subtitle="Set what time your daily briefing arrives in your local timezone."
          >
            {tier === "free" ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between px-4 py-5 rounded-xl ring-1 ring-inset ring-white/[0.08] bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] ring-1 ring-inset ring-white/10 shrink-0">
                      <Sunrise size={14} className="text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Daily Briefing</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Available on Starter and above</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openUpgrade("briefing")}
                    className="shrink-0 px-4 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
                  >
                    Upgrade
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground px-1">
                  Waking up to a briefing of your overnight emails, Slack messages, and PR reviews is a Starter feature.
                </p>
              </div>
            ) : (
            <>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Daily briefing time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRIEFING_TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setBriefingMode("fixed");
                        setBriefingTime(preset.value);
                        setShowCustomBriefingTime(false);
                      }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl ring-1 ring-inset text-sm font-semibold transition-all ${
                        briefingTime === preset.value && !showCustomBriefingTime
                          ? "ring-amber-500/40 bg-amber-500/[0.08] text-foreground"
                          : "ring-white/[0.08] bg-white/[0.04] text-muted-foreground hover:ring-foreground/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setBriefingMode("fixed");
                      setShowCustomBriefingTime(true);
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl ring-1 ring-inset text-sm font-semibold transition-all ${
                      showCustomBriefingTime
                        ? "ring-amber-500/40 bg-amber-500/[0.08] text-foreground"
                        : "ring-white/[0.08] bg-white/[0.04] text-muted-foreground hover:ring-foreground/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {showCustomBriefingTime && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Custom time
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl ring-1 ring-inset ring-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] hover:ring-foreground/25 transition-all outline-none group cursor-pointer">
                      <span className="text-sm text-foreground font-medium">
                        {formatTimeLabel(briefingTime)}
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className="text-muted-foreground group-data-[popup-open]:rotate-180 transition-transform duration-200"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      positionerStyle={{ width: "var(--anchor-width)" }}
                      className="!bg-[#131313] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-2xl p-1 max-h-64 overflow-y-auto"
                    >
                      <DropdownMenuGroup>
                        {BRIEFING_TIME_OPTIONS.map((option) => {
                          const selected = briefingTime === option.value;
                          return (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => setBriefingTime(option.value)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all outline-none ${
                                selected
                                  ? "bg-amber-500/[0.08] hover:bg-amber-500/[0.12] data-[highlighted]:bg-amber-500/[0.12]"
                                  : "hover:bg-white/[0.06] data-[highlighted]:bg-white/[0.06]"
                              }`}
                            >
                              <span
                                className={`text-sm ${selected ? "text-amber-300" : "text-foreground"}`}
                              >
                                {option.label}
                              </span>
                              {selected && (
                                <Check
                                  size={13}
                                  strokeWidth={2.5}
                                  className="text-amber-500"
                                />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]">
                <Sunrise
                  strokeWidth={1.5}
                  size={13}
                  className="text-amber-400/70 mt-0.5 shrink-0"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use your detected local timezone automatically. Daily
                  briefing is currently set for{" "}
                  <span className="text-foreground/85 font-medium">
                    {briefingTime}
                  </span>
                  .
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 ring-t-1 ring-inset ring-white/[0.08]">
              <p className="text-xs text-muted-foreground">
                Applies from tomorrow
              </p>
              <button
                onClick={saveBriefing}
                disabled={savingBriefing}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
              >
                {savingBriefing ? "Saving…" : "Save Preference"}
              </button>
            </div>
            </>
            )}
          </SectionCard>

          <SectionCard
            label="HISTORY & PRIVACY"
            icon={Shield}
            title="Conversation History"
            subtitle="How long CalmPilot remembers your chats. Runs a nightly cleanup."
          >
            <div className="p-4">
              <div className="w-full">
                {(() => {
                  const activePending =
                    pendingRetention !== undefined
                      ? pendingRetention
                      : retention;
                  const activeOpt = RETENTION_OPTIONS.find(
                    (o) => o.value === activePending,
                  );
                  const retChanged = activePending !== retention;
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl ring-1 ring-inset ring-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] hover:ring-foreground/25 transition-all outline-none group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15 ring-1 ring-inset ring-amber-500/30 shrink-0">
                            <Clock size={14} className="text-amber-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">
                              {activeOpt ? activeOpt.label : "Select…"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {activeOpt ? activeOpt.description : ""}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          strokeWidth={1.5}
                          className="text-muted-foreground group-data-[popup-open]:rotate-180 transition-transform duration-200 shrink-0"
                        />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        positionerStyle={{ width: "var(--anchor-width)" }}
                        className="!bg-[#131313] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-2xl p-1"
                      >
                        <DropdownMenuGroup>
                          {RETENTION_OPTIONS.map((opt) => {
                            const isPending = activePending === opt.value;
                            return (
                              <DropdownMenuItem
                                key={String(opt.value)}
                                closeOnClick={false}
                                onClick={() => setPendingRetention(opt.value)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all outline-none ${
                                  isPending
                                    ? "bg-amber-500/[0.08] hover:bg-amber-500/[0.12] data-[highlighted]:bg-amber-500/[0.12]"
                                    : "hover:bg-white/[0.06] data-[highlighted]:bg-white/[0.06]"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p
                                      className={`text-sm font-medium truncate ${isPending ? "text-amber-300" : "text-foreground"}`}
                                    >
                                      {opt.label}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate leading-tight">
                                    {opt.description}
                                  </p>
                                </div>
                                {isPending && (
                                  <Check
                                    size={13}
                                    className="text-amber-500 shrink-0"
                                    strokeWidth={2.5}
                                  />
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="px-2 py-1.5 flex items-center gap-2">
                          <button
                            onClick={() => setPendingRetention(retention)}
                            className="flex-1 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.04] hover:bg-white/[0.07] ring-1 ring-inset ring-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              if (activePending !== undefined) {
                                await saveRetention(activePending);
                              }
                            }}
                            disabled={retSaving || !retChanged}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                              retChanged
                                ? "bg-amber-500 text-black hover:bg-amber-400"
                                : "bg-white/[0.04] text-muted-foreground cursor-not-allowed ring-1 ring-inset ring-white/10"
                            }`}
                          >
                            {retSaving ? "Saving…" : "Save Preference"}
                          </button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })()}
              </div>
            </div>
            <div className="px-5 py-3 flex items-start gap-2">
              <Clock
                strokeWidth={1.5}
                size={12}
                className="text-muted-foreground shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-muted-foreground">
                Applies to chat conversations only. Trigger events and activity
                feed are kept for 90 days regardless.
              </p>
            </div>
          </SectionCard>

          {/* ── Plan & Billing ── */}
          <SectionCard
            label="PLAN & BILLING"
            icon={CreditCard}
            title="Subscription"
            subtitle="Your current plan and monthly usage limits."
          >
            {/* Current plan row */}
            <div className="flex items-center justify-between gap-4 px-5 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Current Plan
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{tierLabel}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierBadgeClass}`}>
                    {tier.toUpperCase()}
                  </span>
                </div>
                {tier === "free" && (
                  <p className="text-xs text-muted-foreground mt-1">Free forever · limited features</p>
                )}
                {tier === "starter" && (
                  <p className="text-xs text-muted-foreground mt-1">$19/mo · billed monthly</p>
                )}
                {tier === "pro" && (
                  <p className="text-xs text-muted-foreground mt-1">$49/mo · billed monthly</p>
                )}
              </div>
              {tier === "free" ? (
                <button
                  onClick={() => openUpgrade("general")}
                  className="shrink-0 px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
                >
                  Upgrade
                </button>
              ) : (
                <a
                  href="mailto:support@calmpilot.app?subject=Manage%20Subscription"
                  className="shrink-0 px-4 py-2 rounded-xl ring-1 ring-inset ring-white/[0.08] bg-white/[0.05] text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                >
                  Manage plan
                </a>
              )}
            </div>

            {/* Usage bars */}
            <div className="px-5 pb-5 space-y-4">
              {/* Chat messages */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Chat messages this month</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {chatUsed.toLocaleString()} / {chatLimit === -1 ? "∞" : chatLimit.toLocaleString()}
                  </span>
                </div>
                {chatLimit > 0 && (
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        chatPct >= 100 ? "bg-red-500" : chatPct >= 50 ? "bg-amber-400" : "bg-violet-500"
                      }`}
                      style={{ width: `${Math.min(chatPct, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Trigger fires */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Trigger fires today</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {triggerUsed} / {triggerLimit === -1 ? "∞" : triggerLimit}
                  </span>
                </div>
                {triggerLimit > 0 && (
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        triggerPct >= 90 ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(triggerPct, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade nudge for free tier */}
            {tier === "free" && (
              <div className="rounded-b-lg bg-violet-500/[0.07] border-t border-violet-500/20 px-5 py-4 space-y-1">
                <p className="text-sm font-medium text-violet-300">Unlock the full product</p>
                <p className="text-xs text-violet-400/70 leading-relaxed">
                  Starter ($19/mo) gives you unlimited triggers, daily briefings, 500 chats/month, and all integrations.
                </p>
              </div>
            )}
          </SectionCard>


          {/* ── Appearance ── */}
          {/* <SectionCard
            label="APPEARANCE"
            icon={Moon}
            title="Theme"
            subtitle="Choose between light and dark mode."
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-foreground">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark ? "Easy on the eyes at night" : "Bright and clear"}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${isDark ? "bg-amber-500" : "bg-white/[0.05] ring-1 ring-inset ring-white/[0.08]"}`}
                aria-pressed={isDark}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all flex items-center justify-center ${isDark ? "left-6" : "left-1"}`}
                >
                  {isDark ? (
                    <Moon
                      strokeWidth={1.5}
                      size={10}
                      className="text-amber-500"
                    />
                  ) : (
                    <Sun
                      strokeWidth={1.5}
                      size={10}
                      className="text-amber-400"
                    />
                  )}
                </span>
              </button>
            </div>
          </SectionCard> */}

          {/* ── Notifications (stub) ── */}
          {/* <SectionCard
            label="NOTIFICATIONS"
            icon={Bell}
            title="Notifications"
            subtitle="Control when and how CalmPilot alerts you."
          >
            <div className="px-5 py-4 space-y-3">
              {[
                "Email me when high-priority items need review",
                "Email me when my morning briefing is ready",
                "Email me when I'm near my chat limit",
                "Push notifications (mobile)",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-3 opacity-40 cursor-not-allowed select-none"
                >
                  <div className="w-4 h-4 rounded ring-1 ring-inset ring-white/[0.08] bg-background shrink-0" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">
                Coming soon — notifications are not yet available.
              </p>
            </div>
          </SectionCard> */}

          {/* ── Advanced ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3 px-1">
              ADVANCED
            </p>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.06]">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <LogOut
                      strokeWidth={1.5}
                      size={15}
                      className="text-zinc-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Session Management
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Control your active login session on this device.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    End your current session. You can sign back in anytime.
                  </p>
                  <button
                    onClick={() => setShowSignOut(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all duration-200 shrink-0 whitespace-nowrap"
                  >
                    <LogOut strokeWidth={1.5} size={13} /> Sign Out
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Chat History
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete all conversations from your account.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClearHist(true)}
                    disabled={clearingHist}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all duration-200 shrink-0 whitespace-nowrap disabled:opacity-40"
                  >
                    <Trash2 strokeWidth={1.5} size={13} />
                    {clearingHist ? "Clearing…" : "Clear History"}
                  </button>
                </div>
              </div>

              {/* Help & Feedback */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.04]">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                    <MessageSquare strokeWidth={1.5} size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Help & Feedback</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Report bugs, suggest features, or get help.</p>
                  </div>
                </div>
                <div className="px-5 py-4 flex flex-wrap gap-3">
                  <a
                    href="mailto:support@calmpilot.app"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all duration-200"
                  >
                    <Mail strokeWidth={1.5} size={13} />
                    Email support
                  </a>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-feedback"))}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all duration-200"
                  >
                    <MessageSquare strokeWidth={1.5} size={13} />
                    Send feedback
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] overflow-hidden">
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-red-500/10">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <Trash2 strokeWidth={1.5} size={15} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                    <p className="text-xs text-red-400/50 mt-0.5">Irreversible. Proceed with caution.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <p className="text-sm text-red-400/60">
                    Permanently removes your account, all messages, and connected integrations.
                  </p>
                  <button
                    onClick={() => { setShowDelete(true); setDeleteConfirmText(""); }}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 shrink-0 whitespace-nowrap disabled:opacity-40"
                  >
                    <Trash2 strokeWidth={1.5} size={13} />
                    {deleteLoading ? "Deleting…" : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8" />
        </div>
      </div>
      <FeedbackWidget />
    </div>
  );
}

