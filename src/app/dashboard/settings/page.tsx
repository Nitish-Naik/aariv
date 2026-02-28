"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
    Check,
    ChevronRight,
    CreditCard,
    Crown,
    LogOut,
    Mail,
    Shield,
    Sparkles,
    Zap
} from "lucide-react";
import { useState } from "react";

const FREE_FEATURES = [
  "Gmail & Google Calendar",
  "AI Assistant (basic)",
  "5 actions per day",
  "Standard support",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Slack, Notion, Linear, GitHub",
  "Unlimited actions",
  "Voice mode",
  "Priority support",
  "Custom automations",
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const isPro = user?.subscriptionTier === "pro";

  // Demo data for connected sources
  const SOURCES = [
    {
      name: "Google Calendar",
      emoji: "📅",
      badge: "Connected",
      badgeType: "connected",
    },
    { name: "Gmail", emoji: "📧", badge: "Pro", badgeType: "pro" },
    { name: "Slack", emoji: "💬", badge: "+ Add", badgeType: "add" },
  ];
  const badgeStyle = (type: string) => {
    if (type === "connected") return "bg-green-100 text-green-700";
    if (type === "pro") return "bg-yellow-100 text-yellow-700";
    return "bg-[var(--accent-soft)] text-[var(--accent)]";
  };

  // Demo toggles
  const [onlyNecessary, setOnlyNecessary] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [draftResponses, setDraftResponses] = useState(true);
  const [protectFocus, setProtectFocus] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your account, preferences, and subscription
        </p>
      </div>

      {/* Profile Card */}
      <section className="relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="relative p-6">
          <div className="flex items-center gap-5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-16 h-16 rounded-2xl ring-2 ring-[var(--accent)]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center text-xl text-white font-semibold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                  {user?.name}
                </h2>
                {isPro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                    <Crown size={10} /> Pro
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={13} className="text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Sources */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Connected Sources
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {SOURCES.map((src, i) => (
            <div key={src.name} className="flex items-center px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center mr-4 text-lg">
                {src.emoji}
              </div>
              <div className="flex-1">
                <span className="text-sm text-[var(--text-primary)] font-medium">
                  {src.name}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${badgeStyle(src.badgeType)}`}
              >
                {src.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* When to Surface */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            When to Surface
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center px-6 py-4">
            <div className="flex-1">
              <span className="text-sm text-[var(--text-primary)] font-medium">
                Only when necessary
              </span>
              <div className="text-xs text-[var(--text-muted)]">
                Skip routine updates
              </div>
            </div>
            <input
              type="checkbox"
              checked={onlyNecessary}
              onChange={() => setOnlyNecessary((v) => !v)}
              className="accent-[var(--accent)] w-5 h-5"
            />
          </div>
          <div className="flex items-center px-6 py-4">
            <div className="flex-1">
              <span className="text-sm text-[var(--text-primary)] font-medium">
                Respect quiet hours
              </span>
              <div className="text-xs text-[var(--text-muted)]">
                10 PM – 8 AM
              </div>
            </div>
            <input
              type="checkbox"
              checked={quietHours}
              onChange={() => setQuietHours((v) => !v)}
              className="accent-[var(--accent)] w-5 h-5"
            />
          </div>
        </div>
      </section>

      {/* Copilot Behaviour */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Copilot Behaviour
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center px-6 py-4">
            <div className="flex-1">
              <span className="text-sm text-[var(--text-primary)] font-medium">
                Draft responses
              </span>
              <div className="text-xs text-[var(--text-muted)]">
                Prepare replies for approval
              </div>
            </div>
            <input
              type="checkbox"
              checked={draftResponses}
              onChange={() => setDraftResponses((v) => !v)}
              className="accent-[var(--accent)] w-5 h-5"
            />
          </div>
          <div className="flex items-center px-6 py-4">
            <div className="flex-1">
              <span className="text-sm text-[var(--text-primary)] font-medium">
                Protect focus time
              </span>
              <div className="text-xs text-[var(--text-muted)]">
                Block calendar during deep work
              </div>
            </div>
            <input
              type="checkbox"
              checked={protectFocus}
              onChange={() => setProtectFocus((v) => !v)}
              className="accent-[var(--accent)] w-5 h-5"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Appearance
          </h3>
        </div>
        <div className="flex items-center px-6 py-4 gap-3">
          <span className="text-sm text-[var(--text-primary)] font-medium flex-1">
            Theme
          </span>
          <button
            className={`px-4 py-2 rounded-lg border text-xs font-semibold ${!isDark ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
            onClick={() => !isDark && toggleTheme()}
          >
            Light
          </button>
          <button
            className={`px-4 py-2 rounded-lg border text-xs font-semibold ${isDark ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
            onClick={() => isDark && toggleTheme()}
          >
            Dark
          </button>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Subscription
          </h3>
        </div>
        <div className="px-6 py-5">
          {isPro ? (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                <Crown size={20} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Aariv Pro
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Full access to all features & integrations
                </p>
              </div>
              <button className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] transition-colors">
                Manage
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                  <Shield size={20} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Free Plan
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Basic features with limited actions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-primary-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/20"
              >
                <Sparkles size={16} />
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Support & Legal */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Support & Legal
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <a
            href="mailto:support@aariv.app"
            className="flex items-center px-6 py-4 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="flex-1 text-sm text-[var(--text-primary)]">
              Help & Support
            </span>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </a>
          <a
            href="/legal/privacy"
            className="flex items-center px-6 py-4 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="flex-1 text-sm text-[var(--text-primary)]">
              Privacy Policy
            </span>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </a>
          <a
            href="/legal/terms"
            className="flex items-center px-6 py-4 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="flex-1 text-sm text-[var(--text-primary)]">
              Terms of Service
            </span>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </a>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Danger Zone
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center w-full px-6 py-4 hover:bg-red-500/5 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
              <LogOut size={17} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-red-500">Sign Out</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Sign out of your account
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-[var(--text-muted)] group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>
      </section>

      {/* Sign Out Dialog */}
      <ConfirmDialog
        open={showSignOutDialog}
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard and connected services."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowSignOutDialog(false);
          signOut();
        }}
        onCancel={() => setShowSignOutDialog(false)}
      />

      {/* Pricing Modal */}
      {showPricing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPricing(false)}
          />
          <div className="relative bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Pricing Header */}
            <div className="relative px-8 pt-8 pb-6 text-center bg-gradient-to-b from-[var(--accent)]/10 to-transparent">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
                <Crown size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-[var(--text-primary)]">
                Upgrade to Aariv Pro
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Unlock the full power of your AI assistant
              </p>
            </div>
            {/* Plans */}
            <div className="px-6 pb-6 space-y-4">
              {/* Free Plan */}
              <div className="border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Free
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      $0
                      <span className="text-xs font-normal text-[var(--text-muted)]">
                        {" "}
                        /month
                      </span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium">
                    Current
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {FREE_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                    >
                      <Check
                        size={14}
                        className="text-[var(--text-muted)] shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Pro Plan */}
              <div className="relative border-2 border-amber-500/30 rounded-xl p-5 bg-amber-500/[0.03]">
                <div className="absolute -top-3 left-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    <Zap size={9} />
                    Recommended
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4 mt-1">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Pro
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      $9.99
                      <span className="text-xs font-normal text-[var(--text-muted)]">
                        {" "}
                        /month
                      </span>
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-5">
                  {PRO_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                    >
                      <Check size={14} className="text-amber-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20">
                  <CreditCard size={16} />
                  Subscribe — $9.99/mo
                </button>
              </div>
              <p className="text-center text-[10px] text-[var(--text-muted)] pt-1">
                Cancel anytime. Billed monthly via Stripe.
              </p>
            </div>
            {/* Close */}
            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
