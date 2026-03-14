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
  MessageSquare,
  Settings,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/triggers", label: "Automations", icon: Zap },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
];

const monitoringNav = [
  { href: "/dashboard/feed", label: "Activity", icon: Activity },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/assistant", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/feed", label: "Activity", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-white/[0.06] text-white"
          : "text-neutral-500 hover:text-white hover:bg-white/[0.04]"
      }`}
    >
      <Icon
        size={16}
        strokeWidth={1.75}
        className={isActive ? "text-white" : "text-neutral-500 group-hover:text-white transition-colors"}
      />
      <span className="flex-1 font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[18px] h-[18px] rounded-full bg-white/10 text-[10px] font-semibold text-white flex items-center justify-center px-1 leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      import("@/lib/api").then(({ api }) => {
        api.get(`/review?status=pending`)
          .then((d) => { if (d?.counts?.total) setPendingCount(d.counts.total); })
          .catch(() => {});
      });
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [user?.id]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "CP";

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen bg-[#080808] border-r border-white/[0.06] fixed left-0 top-0 z-30">

        {/* Workspace header */}
        <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0">
              <img
                src="/icons/icon-192.svg"
                alt="CalmPilot"
                className="w-4 h-4"
              />
            </div>
            <span className="text-sm font-semibold text-white truncate">
              CalmPilot
            </span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {mainNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={item.href === "/dashboard/review" ? pendingCount : undefined}
            />
          ))}

          {/* Monitoring group */}
          <div className="pt-4 pb-1">
            <p className="px-2.5 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-1">
              Monitoring
            </p>
            {monitoringNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
          {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Credits row */}
          {balanceData && (
            <Link
              href="/dashboard/usage"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <span className="font-medium">Credits</span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  balanceData.balance <= 0
                    ? "text-red-400"
                    : balanceData.balance < 1
                    ? "text-amber-400"
                    : "text-white"
                }`}
              >
                ${Math.max(0, balanceData.balance).toFixed(2)}
              </span>
            </Link>
          )}

          {/* User row */}
          {user && (
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="w-6 h-6 rounded-full shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                  {initials}
                </div>
              )}
              <span className="flex-1 text-left text-sm text-neutral-400 group-hover:text-white truncate transition-colors">
                {user.name}
              </span>
              <LogOut
                size={14}
                className="text-neutral-600 group-hover:text-red-400 transition-colors shrink-0"
              />
            </button>
          )}
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 bg-black border-b border-white/[0.06] safe-top">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0">
            <img src="/icons/icon-192.svg" alt="CalmPilot" className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-white">CalmPilot</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={`${user.name}'s avatar`} className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white">
              {initials}
            </div>
          )}
        </button>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 bg-black border-t border-white/[0.06] safe-bottom">
        {mobileNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const isInbox = item.href === "/dashboard/review";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-white" : "text-neutral-600"
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={1.75} />
                {isInbox && pendingCount > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full bg-white text-[8px] font-bold text-black flex items-center justify-center px-0.5 leading-none">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ─── MOBILE SLIDE-OUT DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[260px] bg-[#080808] border-l border-white/[0.06] flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} strokeWidth={1.75} className="text-neutral-500" />
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.name}'s avatar`} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {[...mainNav, ...monitoringNav, ...bottomNav].map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </nav>

            <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
              {balanceData && (
                <Link
                  href="/dashboard/usage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span>Credits</span>
                  <span className="font-semibold text-white">
                    ${Math.max(0, balanceData.balance).toFixed(2)}
                  </span>
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); setShowSignOutDialog(true); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showSignOutDialog}
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { setShowSignOutDialog(false); signOut(); }}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </>
  );
}
