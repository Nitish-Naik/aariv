"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  LogOut,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
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
  const [modelSaved, setModelSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aariv_model");
    if (saved) setSelectedModel(saved);
  }, []);

  const handleModelSave = () => {
    localStorage.setItem("aariv_model", selectedModel);
    window.dispatchEvent(
      new CustomEvent("aariv-model-change", { detail: selectedModel })
    );
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
            Settings
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Preferences and account management.
          </p>
        </header>

        <div className="space-y-4">
          {/* ─── Profile ─── */}
          <section className="bg-[var(--bg-surface)] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-lg font-medium text-[var(--accent)]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-base font-medium text-[var(--text-primary)] truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {user?.email || "user@aariv.app"}
                </p>
              </div>
            </div>
          </section>

          {/* ─── Model ─── */}
          <section className="bg-[var(--bg-surface)] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-0.5">
              Model
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Choose which model powers your assistant
            </p>

            <div className="relative mb-4">
              <button
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-deep)] text-left group"
              >
                <div className="flex items-center gap-3">
                  {currentModel && (
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
                      <currentModel.icon
                        size={16}
                        className="text-[var(--accent)]"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {currentModel?.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {currentModel?.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[var(--text-muted)] transition-transform duration-200 ${isModelOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isModelOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsModelOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-deep)] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-deep)] flex items-center justify-center">
                        <model.icon
                          size={14}
                          className="text-[var(--accent)]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">
                          {model.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {model.description}
                        </p>
                      </div>
                      {selectedModel === model.id && (
                        <Check size={14} className="text-[var(--accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleModelSave}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${modelSaved
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80"
                }`}
            >
              {modelSaved ? "✓ Saved" : "Save"}
            </button>
          </section>

          {/* ─── Usage & Billing ─── */}
          <Link href="/dashboard/usage" className="block">
            <section className="bg-[var(--bg-surface)] rounded-2xl p-6 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                    <Wallet size={16} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Usage & Billing
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Credits, usage, and auto-refill
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {balanceData && (
                    <span className="text-sm font-mono text-[var(--accent)]">
                      ${balanceData.balance.toFixed(2)}
                    </span>
                  )}
                  <ArrowRight
                    size={16}
                    className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </section>
          </Link>

          {/* ─── Subscription ─── */}
          <section className="bg-[var(--bg-surface)] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-0.5">
              Plan
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Your current subscription
            </p>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-deep)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                  <Sparkles size={16} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user?.subscriptionTier === "pro" ? "Aariv Pro" : "Free"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {user?.subscriptionTier === "pro"
                      ? "Full access"
                      : "5 actions per day"}
                  </p>
                </div>
              </div>
              {user?.subscriptionTier !== "pro" && (
                <button className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-soft)] text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity">
                  Upgrade
                </button>
              )}
            </div>
          </section>

          {/* ─── Danger Zone ─── */}
          <section className="bg-[var(--bg-surface)] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-red-500 mb-3">
              Danger Zone
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setShowSignOutDialog(true)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/5 transition-colors text-left"
              >
                <LogOut size={16} className="text-red-400" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Sign Out</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Sign out of your account
                  </p>
                </div>
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/5 transition-colors text-left"
              >
                <Trash2 size={16} className="text-red-400" />
                <div>
                  <p className="text-sm text-red-400 font-medium">
                    Delete Account
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Permanently delete all data
                  </p>
                </div>
              </button>
            </div>
          </section>
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
