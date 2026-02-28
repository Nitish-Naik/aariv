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
    Moon,
    Palette,
    Shield,
    Sparkles,
    Sun,
    Zap,
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
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
      <section className="relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
        <div className="relative p-6">
          <div className="flex items-center gap-5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-16 h-16 rounded-2xl ring-2 ring-[var(--accent)]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-xl text-white font-semibold shadow-lg">
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
                    <Crown size={10} />
                    Pro
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

      {/* Preferences */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Preferences
          </h3>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-6 py-4 hover:bg-[var(--accent-soft)] transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center mr-4">
            <Palette size={17} className="text-[var(--accent)]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Appearance
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isDark ? "Dark" : "Light"} mode
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? "bg-[var(--accent)]" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-[22px]" : "translate-x-0.5"}`}
              >
                <div className="flex items-center justify-center h-full">
                  {isDark ? (
                    <Moon size={11} className="text-[var(--accent)]" />
                  ) : (
                    <Sun size={11} className="text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Subscription */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Subscription
          </h3>
        </div>

        <div className="px-6 py-5">
          {isPro ? (
            /* Pro Plan Active */
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
            /* Free Plan */
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

      {/* Danger Zone */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Account
          </h3>
        </div>

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
