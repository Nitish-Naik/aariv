"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Edit2,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Trash2,
  Wallet,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MODEL_OPTIONS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable",
    icon: Brain,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Balanced",
    icon: Sparkles,
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Fast & affordable",
    icon: Zap,
  },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isRetentionOpen, setIsRetentionOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number | null>(null);
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aariv_model");
    if (saved) setSelectedModel(saved);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load retention preference
  useEffect(() => {
    if (!user?.id) return;
    const fetchRetention = async () => {
      try {
        const envUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
        const res = await fetch(`${baseUrl}/api/history/retention/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setRetentionDays(data.retention_days);
        }
      } catch (e) {
        console.error("Failed to fetch retention", e);
      }
    };
    fetchRetention();
  }, [user?.id]);

  const handleRetentionChange = async (days: number | null) => {
    if (!user?.id) return;
    setRetentionSaving(true);
    try {
      const envUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const baseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
      const res = await fetch(`${baseUrl}/api/history/retention/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (res.ok) {
        setRetentionDays(days);
        showToast("History retention preference saved");
      }
    } catch (e) {
      console.error("Failed to update retention", e);
    } finally {
      setRetentionSaving(false);
    }
  };

  const handleModelSave = () => {
    localStorage.setItem("aariv_model", selectedModel);
    window.dispatchEvent(
      new CustomEvent("aariv-model-change", { detail: selectedModel })
    );
    showToast("Model preference saved successfully");
  };

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300 ${toast.type === "success" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
          {toast.type === "success" ? <Check size={16} /> : <Zap size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 w-full">
        {/* Header */}
        <header className="mb-16 border-b border-[rgba(255,255,255,0.05)] pb-8">
          <h1 className="text-3xl font-serif text-[var(--text-primary)] mb-2 tracking-tight">
            Settings
          </h1>
          <p className="text-[15px] font-medium text-[var(--text-secondary)]">
            Manage your aesthetic, models, and personal data preferences.
          </p>
        </header>

        <div className="divide-y divide-[rgba(255,255,255,0.05)] text-left">
          {/* ─── Profile ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
            <div className="lg:col-span-1 pr-8">
              <h3 className="text-base font-medium text-[var(--text-primary)]">Profile</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Customize your public presence and how Aariv identifies you.</p>
            </div>
            <div className="lg:col-span-2">
              <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover ring-1 ring-[rgba(255,255,255,0.05)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] to-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-xl font-serif text-[var(--accent)] shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-lg font-medium text-[var(--text-primary)] truncate mb-0.5">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] truncate font-medium">
                      {user?.email || "user@aariv.app"}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-[var(--bg-deep)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              </section>
            </div>
          </div>

          {/* ─── Model ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
            <div className="lg:col-span-1 pr-8">
              <h3 className="text-base font-medium text-[var(--text-primary)]">Model Engine</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Choose the intelligence engine that powers your primary assistant workflow.</p>
            </div>
            <div className="lg:col-span-2">
              <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 shadow-sm">

                <div className="relative mb-6">
                  <button
                    onClick={() => setIsModelOpen(!isModelOpen)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-deep)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      {currentModel && (
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center shadow-sm">
                          <currentModel.icon
                            size={18}
                            className="text-[var(--text-secondary)]"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-[15px] font-medium text-[var(--text-primary)] mb-0.5">
                          {currentModel?.name}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-muted)]">
                          {currentModel?.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[var(--text-muted)] transition-transform duration-300 ${isModelOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isModelOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl p-1">
                      {MODEL_OPTIONS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left ${selectedModel === model.id ? "bg-[rgba(255,255,255,0.04)]" : "hover:bg-[rgba(255,255,255,0.02)]"}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-colors ${selectedModel === model.id ? "bg-[var(--accent-soft)]" : "bg-[var(--bg-deep)]"}`}>
                            <model.icon
                              size={16}
                              className={selectedModel === model.id ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[15px] font-medium mb-0.5 ${selectedModel === model.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                              {model.name}
                            </p>
                            <p className="text-xs font-medium text-[var(--text-muted)]">
                              {model.description}
                            </p>
                          </div>
                          {selectedModel === model.id && (
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm">
                              <Check size={12} className="text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleModelSave}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] shadow-sm"
                >
                  Save Preference
                </button>
              </section>
            </div>
          </div>

          {/* ─── Usage & Billing ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
            <div className="lg:col-span-1 pr-8">
              <h3 className="text-base font-medium text-[var(--text-primary)]">Usage & Billing</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Review your current balance, add credits, and monitor API consumption limits.</p>
            </div>
            <div className="lg:col-span-2">
              <Link href="/dashboard/usage" className="block">
                <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer group shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a1a1c] to-[#0f0f10] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Wallet size={20} className="text-[#a1a1aa] relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                          Usage & Billing
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] font-medium">
                          Credits, usage limits, and auto-refill
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {balanceData && (
                        <span className="text-base font-mono font-medium text-[var(--text-primary)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.05)]">
                          ${balanceData.balance.toFixed(2)}
                        </span>
                      )}
                      <ArrowRight
                        size={20}
                        className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </div>
                </section>
              </Link>
            </div>
          </div>

        {/* ─── Keyboard Shortcuts ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
          <div className="lg:col-span-1 pr-8">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Keyboard Shortcuts</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Master the interface. Navigate Aariv efficiently without leaving your keyboard.</p>
          </div>
          <div className="lg:col-span-2">
            <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <Command size={20} className="text-[var(--text-secondary)]" />
                <h3 className="text-base font-medium text-[var(--text-primary)]">
                  Local Bindings
                </h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium mb-8">
                Core actions available anywhere in the app
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Open command palette", keys: ["Cmd", "K"] },
                  { label: "New conversation", keys: ["Cmd", "N"] },
                  { label: "Focus chat input", keys: ["/"] },
                  { label: "Toggle settings", keys: ["Cmd", ","] },
                ].map((shortcut) => (
                  <div key={shortcut.label} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-deep)] border border-[rgba(255,255,255,0.02)] group hover:border-[rgba(255,255,255,0.06)] transition-colors">
                    <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{shortcut.label}</span>
                    <div className="flex gap-1.5">
                      {shortcut.keys.map((key) => (
                        <kbd key={key} className="px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] rounded-lg text-xs font-mono font-medium text-[var(--text-primary)] shadow-sm">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ─── History & Privacy ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
          <div className="lg:col-span-1 pr-8">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Data Privacy</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Control your data footprint. Configure how long chat histories are retained on our servers.</p>
          </div>
          <div className="lg:col-span-2">
            <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <Shield size={20} className="text-[var(--text-secondary)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)]">
              History & Privacy
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium mb-6">
            Control your data footprint and conversation retention
          </p>

          <div className="p-6 rounded-2xl bg-[var(--bg-deep)] border border-[rgba(255,255,255,0.02)]">
            <p className="text-sm font-medium text-[var(--text-primary)] mb-4">
              Auto-delete conversations older than:
            </p>

            <div className="relative w-full sm:w-72 mb-5">
              <button
                type="button"
                onClick={() => !retentionSaving && setIsRetentionOpen(!isRetentionOpen)}
                disabled={retentionSaving}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.03)] text-[15px] font-medium text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 group outline-none"
              >
                <span>
                  {retentionDays === null
                    ? "Keep forever"
                    : retentionDays === 7 ? "7 days"
                      : retentionDays === 30 ? "30 days"
                        : retentionDays === 90 ? "90 days"
                          : "6 months"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-[var(--text-muted)] transition-transform duration-300 ${isRetentionOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isRetentionOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl p-1">
                  {[
                    { value: 7, label: "7 days" },
                    { value: 30, label: "30 days" },
                    { value: 90, label: "90 days" },
                    // { value: 180, label: "6 months" },
                    { value: null, label: "Keep forever" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        handleRetentionChange(opt.value);
                        setIsRetentionOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-left text-[15px] font-medium ${retentionDays === opt.value ? "bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]" : "hover:bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)]"}`}
                    >
                      {opt.label}
                      {retentionDays === opt.value && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm">
                          <Check size={12} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {retentionDays ? (
              <div className="flex items-center gap-2.5 text-[13px] font-medium">
                <Clock size={16} className="text-[var(--text-secondary)]" />
                <span className="text-[var(--text-muted)]">
                  Conversations older than {retentionDays} days are automatically deleted daily.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-[13px] font-medium">
                <Shield size={16} className="text-green-500/80" />
                <span className="text-[var(--text-muted)]">
                  Your history is kept indefinitely.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>

          {/* ─── Advanced / Danger Zone ─── */ }
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
    <div className="lg:col-span-1 pr-8">
      <h3 className="text-base font-medium text-[var(--text-primary)]">Advanced Diagnostics</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">Manage sessions and perform irreversible, destructive data actions.</p>
    </div>
    <div className="lg:col-span-2">
      <section className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-3xl p-8 shadow-sm">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none text-[15px] font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity outline-none">
            <div className="flex items-center gap-3">
              <SettingsIcon size={20} className="text-[var(--text-secondary)]" />
              Advanced Options
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-deep)] flex items-center justify-center border border-[rgba(255,255,255,0.03)] group-open:bg-[rgba(255,255,255,0.05)] transition-colors">
              <ChevronDown size={18} className="text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-300" />
            </div>
          </summary>
          <div className="pt-8 mt-6 border-t border-[rgba(255,255,255,0.05)] space-y-5">
            <div>
              <h3 className="text-base font-medium text-red-500 mb-3">
                Danger Zone
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSignOutDialog(true)}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[var(--bg-deep)] border border-[rgba(255,255,255,0.02)] hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left group/btn"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover/btn:bg-red-500/20 transition-colors">
                    <LogOut size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-[15px] text-red-400 font-medium mb-0.5">Sign Out</p>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      Sign out of your account on this device
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[var(--bg-deep)] border border-[rgba(255,255,255,0.02)] hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left group/btn"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover/btn:bg-red-500/20 transition-colors">
                    <Trash2 size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-[15px] text-red-400 font-medium mb-0.5">
                      Delete Account
                    </p>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      Permanently delete all personal data
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  </div>
</div>
</div>

  {/* Dialogs */}
  <ConfirmDialog
    open={showSignOutDialog}
    title="Sign out?"
    description="You'll need to sign in again to access your dashboard."
    confirmLabel="Sign Out"
    cancelLabel="Cancel"
    variant="danger"
    onConfirm={() => {
      setShowSignOutDialog(false);
      signOut();
    }}
    onCancel={() => setShowSignOutDialog(false)}
  />
  <ConfirmDialog
    open={showDeleteDialog}
    title="Delete your account?"
    description="This will permanently delete your account, messages, and connections. This cannot be undone."
    confirmLabel="Delete Everything"
    cancelLabel="Keep Account"
    variant="danger"
    onConfirm={() => {
      setShowDeleteDialog(false);
    }}
    onCancel={() => setShowDeleteDialog(false)}
  />
</div>
);
}
