"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import {
  Activity,
  Home,
  Link2,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
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
      <aside className="hidden md:flex flex-col w-[240px] h-screen border-r border-white/10 bg-black fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192.svg" alt="CalmPilot" className="w-5 h-5 rounded-md shrink-0" />
            <div>
              <h1 className="text-sm font-serif font-semibold tracking-wide text-white leading-tight">
                CalmPilot
              </h1>
              <p className="text-[10px] text-neutral-500 leading-tight">
                a quieter way to get work done
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
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
                <p className="text-sm text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {/* {user.email} */}
                </p>
              </div>
            </div>
          )}

          {user && balanceData && (
            <Link
              href=""
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/5 border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <span className="font-medium text-white">Credits</span>
              </div>
              <span className="font-bold text-white">${Math.max(0, balanceData.balance).toFixed(2)}</span>
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
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-black border-b border-white/10 safe-top">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-192.svg" alt="CalmPilot" className="w-6 h-6 rounded-md shrink-0" />
          <h1 className="text-base font-serif font-semibold tracking-wide text-white">
            CalmPilot
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu strokeWidth={1.5} size={20} className="text-white" />
        </button>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-black border-t border-white/10 safe-bottom px-1 py-1">
        {bottomBarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg min-w-[56px] transition-colors ${isActive ? "text-white" : "text-neutral-500"
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
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-black border-l border-white/10 flex flex-col animate-slide-in-right">
            {/* Close button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X strokeWidth={1.5} size={18} className="text-neutral-400" />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-4 border-b border-white/10">
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
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-white/5 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-white/10 space-y-1">
              {user && balanceData && (
                <Link
                  href="/dashboard/usage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span className="font-medium text-white">Credits</span>
                  </div>
                  <span className="font-bold text-white">${Math.max(0, balanceData.balance).toFixed(2)}</span>
                </Link>
              )}
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
