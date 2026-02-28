"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Check, LogOut, Sparkles } from "lucide-react";
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
    if (type === "connected")
      return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
    if (type === "pro")
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
    return "bg-[var(--accent-soft)] text-[var(--accent)]";
  };

  const { user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { isDark } = useTheme();
  const isPro = user?.subscriptionTier === "pro";

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-10 px-2">
          <h1 className="text-3xl font-serif text-[var(--text-primary)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your preferences and connect your tools.
          </p>
        </div>

        {/* Profile Card */}
        <section className="bg-[var(--bg-surface)] rounded-[2rem] p-8 flex items-center gap-6 shadow-sm shadow-black/5 dark:shadow-none">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-2xl text-[var(--accent)] font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-medium text-[var(--text-primary)] mb-1">
              {user?.name || "User"}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {user?.email || "user@aariv.app"}
            </p>
          </div>
        </section>

        {/* Connected Sources */}
        <section className="bg-[var(--bg-surface)] rounded-[2rem] p-8 shadow-sm shadow-black/5 dark:shadow-none">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-5 px-2">
            Connected Sources
          </h3>
          <div className="space-y-2">
            {SOURCES.map((src) => (
              <div
                key={src.name}
                className="flex items-center p-4 rounded-2xl hover:bg-[var(--bg-deep)] transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-deep)] flex items-center justify-center mr-5 text-xl">
                  {src.emoji}
                </div>
                <div className="flex-1">
                  <span className="text-base text-[var(--text-primary)]">
                    {src.name}
                  </span>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-medium ${badgeStyle(
                    src.badgeType
                  )}`}
                >
                  {src.badge}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-[var(--bg-surface)] rounded-[2rem] p-8 shadow-sm shadow-black/5 dark:shadow-none">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-5 px-2">
            Subscription
          </h3>
          <div className="p-6 rounded-2xl bg-[var(--bg-deep)]">
            {isPro ? (
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                  <Sparkles size={20} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    Aariv Pro
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Full access to all features
                  </p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm shadow-black/5">
                  Manage
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center shadow-sm shadow-black/5">
                  <Sparkles size={20} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    Free Plan
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Basic features
                  </p>
                </div>
                <button
                  onClick={() => setShowPricing(true)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-deep)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-[var(--bg-surface)] rounded-[2rem] p-8 shadow-sm shadow-black/5 dark:shadow-none">
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center w-full p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mr-5">
              <LogOut size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-base font-medium text-red-500">Sign Out</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Sign out of your account
              </p>
            </div>
          </button>
        </section>
      </div>

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[var(--bg-deep)]/80 backdrop-blur-md"
            onClick={() => setShowPricing(false)}
          />
          <div className="relative bg-[var(--bg-surface)] rounded-[2.5rem] w-full max-w-xl mx-auto overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--bg-deep)] mb-6">
                <Sparkles size={28} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-3">
                Upgrade to Pro
              </h2>
              <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                Unlock voice mode, unlimited actions, and priority support.
              </p>
            </div>

            <div className="px-10 pb-10 overflow-y-auto space-y-4">
              {/* Free Plan */}
              <div className="bg-[var(--bg-deep)] rounded-[2rem] p-6 border border-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-lg font-medium text-[var(--text-primary)]">
                      Free
                    </p>
                    <p className="text-[var(--text-muted)] mt-1">Current plan</p>
                  </div>
                  <p className="text-2xl font-medium text-[var(--text-primary)]">
                    $0
                  </p>
                </div>
                <ul className="space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <Check size={16} className="text-[var(--text-muted)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-[var(--accent-soft)] rounded-[2rem] p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-lg font-medium text-[var(--text-primary)]">
                      Pro
                    </p>
                    <p className="text-[var(--text-muted)] mt-1">
                      Billed monthly
                    </p>
                  </div>
                  <p className="text-2xl font-medium text-[var(--text-primary)]">
                    $9.99
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {PRO_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <Check size={16} className="text-[var(--text-primary)]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowPricing(false)}
                  className="w-full py-4 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] text-base font-medium hover:opacity-90 transition-opacity shadow-sm shadow-black/5"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-deep)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
