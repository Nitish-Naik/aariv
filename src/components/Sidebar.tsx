"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
    Calendar,
    Home,
    Link2,
    LogOut,
    Mail,
    MessageSquare,
    Moon,
    Settings,
    Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/inbox", label: "Inbox", icon: Mail },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  return (
    <aside className="flex flex-col w-[240px] h-screen border-r border-[var(--border)] bg-[var(--bg-surface)] fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <h1 className="text-lg font-serif font-semibold tracking-wide text-[var(--text-primary)]">
          aariv
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          quiet intelligence
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
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
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

        <button
          onClick={() => setShowSignOutDialog(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-red-500/10 w-full transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>

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
    </aside>
  );
}
