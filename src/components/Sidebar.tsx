"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import { Logo } from "@/components/secure-agent/Logo";
import {
  ChevronUp,
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

/* ─── Nav config ──────────────────────────────────────── */

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/triggers", label: "Automations", icon: Zap },
  { href: "/dashboard/integrations", label: "Apps", icon: Link2 },
];

const monitoringNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/assistant", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/integrations", label: "Apps", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/* ─── NavItem ─────────────────────────────────────────── */

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
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 select-none ${
        isActive
          ? "bg-indigo-500/[0.12] text-white font-medium"
          : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]"
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: "hsl(245 88% 68%)", boxShadow: "0 0 8px rgba(99,102,241,0.7)" }}
        />
      )}
      <Icon
        size={15}
        strokeWidth={isActive ? 1.75 : 1.5}
        className={`shrink-0 transition-colors ${
          isActive
            ? "text-indigo-400"
            : "text-white/50 group-hover:text-white/70"
        }`}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`min-w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 leading-none tabular-nums ${
            isActive
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-white/10 text-white/60"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/* ─── Nav section label ───────────────────────────────── */

function NavSectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}

/* ─── User row ────────────────────────────────────────── */

function UserRow({
  user,
  initials,
  onSignOut,
}: {
  user: { name?: string; email?: string; avatar?: string };
  initials: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group outline-none"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-6 h-6 rounded-full shrink-0 ring-1 ring-indigo-500/30"
            onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }}
          />
        ) : null}
        <div className={`w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-300 shrink-0 ring-1 ring-indigo-500/30 ${user.avatar ? "hidden" : ""}`}>
          {initials}
        </div>
        <span className="flex-1 text-left text-[13px] text-white/60 group-hover:text-white/80 truncate transition-colors">
          {user.name || user.email}
        </span>
        <ChevronUp
          size={13}
          className={`text-white/45 group-hover:text-white/65 transition-all shrink-0 ${open ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1.5 z-50 rounded-xl bg-[#161616] border border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/[0.07]">
              <p className="text-[12px] font-medium text-white/85 truncate">{user.name}</p>
              {user.email && (
                <p className="text-[11px] text-white/50 truncate mt-0.5">{user.email}</p>
              )}
            </div>
            <div className="p-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/65 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
              >
                <Settings size={13} strokeWidth={1.5} />
                Settings
              </Link>
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-red-400/65 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
              >
                <LogOut size={13} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────── */

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  const tier = balanceData?.subscription_tier ?? "free";
  const tierLabel =
    tier === "starter" ? "Starter" :
    tier === "pro" ? "Pro" : "Free";

  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      import("@/lib/api").then(({ api }) => {
        // Fetch integrations and pending review count in parallel
        Promise.all([
          api.get("/integrations").catch(() => null),
          api.get("/review?status=pending").catch(() => null),
        ]).then(([intData, reviewData]) => {
          const apps = intData?.integrations || [];
          const hasApps = apps.some((a: any) => a.status === "connected");
          setPendingCount(hasApps ? (reviewData?.counts?.total ?? 0) : 0);
        });
      });
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [user?.id]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

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
      <aside className="hidden md:flex flex-col w-[220px] h-screen bg-[#080808] border-r border-white/[0.08] fixed left-0 top-0 z-30">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <Logo className="w-6 h-6" />
            <span className="text-[14px] font-semibold text-white/90 tracking-[-0.01em]">CalmPilot</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          <NavSectionLabel label="Main" />
          {mainNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={item.href === "/dashboard/review" ? pendingCount : undefined}
            />
          ))}

          <NavSectionLabel label="System" />
          {monitoringNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] px-2 py-3 space-y-px">
          {/* Plan badge */}
          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Plan</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                (tier as string) === "pro"
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/20"
                  : (tier as string) === "starter"
                  ? "bg-violet-500/15 text-violet-400 border-violet-500/20"
                  : "bg-white/[0.06] text-white/55 border-white/[0.08]"
              }`}
            >
              {tierLabel}
            </span>
          </div>

          {user && (
            <UserRow
              user={user}
              initials={initials}
              onSignOut={() => setShowSignOutDialog(true)}
            />
          )}
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 bg-[#080808] border-b border-white/[0.08] safe-top">
        <div className="flex items-center gap-2.5">
          <Logo className="w-5 h-5" />
          <span className="text-[13px] font-semibold text-white/90 tracking-[-0.01em]">CalmPilot</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="outline-none"
          aria-label="Open menu"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-7 h-7 rounded-full ring-1 ring-indigo-500/30"
              onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }}
            />
          ) : null}
          <div className={`w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-semibold text-indigo-300 ${user?.avatar ? "hidden" : ""}`}>
            {initials}
          </div>
        </button>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 bg-[#080808] border-t border-white/[0.08] safe-bottom">
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
              className={`relative flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? "text-indigo-400" : "text-white/50"
              }`}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-px rounded-b-full"
                  style={{ background: "hsl(245 88% 68%)", boxShadow: "0 0 8px rgba(99,102,241,0.8)" }}
                />
              )}
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 1.75 : 1.5} />
                {isInbox && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full bg-indigo-500/25 text-[8px] font-bold text-indigo-300 flex items-center justify-center px-0.5 leading-none">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none ${isActive ? "font-medium" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ─── MOBILE SLIDE-OUT DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[260px] bg-[#0c0c0c] border-l border-white/[0.08] flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
              <span className="text-[13px] font-semibold text-white/80">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-white/[0.07] transition-colors">
                <X size={16} strokeWidth={1.5} className="text-white/60" />
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full ring-1 ring-indigo-500/30"
                    onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }}
                  />
                ) : null}
                <div className={`w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-300 ${user.avatar ? "hidden" : ""}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white/80 truncate">{user.name}</p>
                  <p className="text-[11px] text-white/50 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 px-2 py-2 overflow-y-auto">
              <NavSectionLabel label="Main" />
              {mainNav.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  badge={item.href === "/dashboard/review" ? pendingCount : undefined}
                />
              ))}
              <NavSectionLabel label="System" />
              {monitoringNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </nav>

            <div className="border-t border-white/[0.07] px-3 py-3">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowSignOutDialog(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400/65 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
              >
                <LogOut size={14} strokeWidth={1.5} />
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
