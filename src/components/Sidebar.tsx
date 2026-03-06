"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useBilling } from "@/context/useBilling";
import {
    Activity,
    Home,
    Link2,
    ListChecks,
    LogOut,
    Menu,
    MessageSquare,
    Moon,
    Settings,
    Sun,
    X,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/feed", label: "Feed", icon: Activity },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
  { href: "/dashboard/triggers", label: "Automations", icon: Zap },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Bottom bar: key pages for mobile quick access
const bottomBarItems = [
  navItems[0], // Home
  navItems[1], // Assistant
  navItems[2], // Inbox
  navItems[3], // Feed
  navItems[6], // Settings
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen border-r border-[var(--border)] bg-[var(--bg-surface)] fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <h1 className="text-lg font-serif font-semibold tracking-wide text-[var(--text-primary)]">
            CalmPilot
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            a quieter way to get work done
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] w-full transition-colors"
          >
            {isDark ? (
              <Sun size={18} strokeWidth={1.5} />
            ) : (
              <Moon size={18} strokeWidth={1.5} />
            )}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-xs text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {user && balanceData && (
            <Link
              href="/dashboard/usage"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)] border border-[var(--border)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                <span className="font-medium text-[var(--accent)]">Credits</span>
              </div>
              <span className="font-bold text-[var(--accent)]">${balanceData.balance.toFixed(2)}</span>
            </Link>
          )}

          <button
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR (visible on mobile only) ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] safe-top">
        <h1 className="text-base font-serif font-semibold tracking-wide text-[var(--text-primary)]">
          CalmPilot
        </h1>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-[var(--text-primary)]" />
        </button>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[var(--bg-surface)] border-t border-[var(--border)] safe-bottom px-1 py-1">
        {bottomBarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg min-w-[56px] transition-colors ${
                isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ─── MOBILE SLIDE-OUT MENU (full settings/profile) ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-[var(--bg-surface)] border-l border-[var(--border)] flex flex-col animate-slide-in-right">
            {/* Close button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                aria-label="Close menu"
              >
                <X size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-sm text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All nav items */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] w-full transition-colors"
              >
                {isDark ? (
                  <Sun size={18} strokeWidth={1.5} />
                ) : (
                  <Moon size={18} strokeWidth={1.5} />
                )}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSignOutDialog(true);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-red-500/10 w-full transition-colors"
              >
                <LogOut size={18} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
