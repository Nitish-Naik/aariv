"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import {
  Activity,
  ChevronUp,
  CreditCard,
  Home,
  Link2,
  ListChecks,
  LogOut,
  MessageSquare,
  Settings,
  User,
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
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
];

const monitoringNav = [
  { href: "/dashboard/feed", label: "Activity", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// const bottomNav = [
//   { href: "/dashboard/settings", label: "Settings", icon: Settings },
// ];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/assistant", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/review", label: "Inbox", icon: ListChecks },
  { href: "/dashboard/feed", label: "Activity", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/* ─── NavItem with strong active indicator ────────────── */

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
      className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 pressable ${
        isActive
          ? "bg-zinc-200/80 text-zinc-900 font-semibold dark:bg-[#151619] dark:text-[#f3f6fb]"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 dark:text-[#a3adb8] dark:hover:text-[#f3f6fb] dark:hover:bg-[#151619]/70"
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-zinc-800/70 dark:bg-white/70" />
      )}
      <Icon
        size={16}
        strokeWidth={isActive ? 2 : 1.75}
        className={`shrink-0 transition-colors ${
          isActive
            ? "text-zinc-900 dark:text-[#f3f6fb]"
            : "text-zinc-600 group-hover:text-zinc-900 dark:text-[#a3adb8] dark:group-hover:text-[#f3f6fb]"
        }`}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold flex items-center justify-center px-1 leading-none ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/* ─── Section label ───────────────────────────────────── */

function NavSection({ label }: { label: string }) {
  return (
    <div className="pt-5 pb-1.5 px-2.5">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold text-zinc-500 dark:text-[#7f8996] uppercase tracking-widest">
          {label}
        </p>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}

/* ─── User Profile Menu (shadcn DropdownMenu) ─────────── */

function UserMenu({
  user,
  initials,
  onSignOut,
}: {
  user: { name?: string; email?: string; avatar?: string };
  initials: string;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/50 transition-colors group outline-none">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="w-6 h-6 rounded-full shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
            {initials}
          </div>
        )}
        <span className="flex-1 text-left text-sm text-zinc-700 group-hover:text-zinc-900 truncate transition-colors dark:text-[#a3adb8] dark:group-hover:text-[#f3f6fb]">
          {user.name}
        </span>
        <ChevronUp
          size={14}
          className="text-zinc-500 group-hover:text-zinc-700 transition-all shrink-0 group-aria-expanded:rotate-0 rotate-180 dark:text-[#7f8996] dark:group-hover:text-[#a3adb8]"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className="w-auto min-w-[220px]"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-xs font-medium">{user.name}</span>
          {user.email && (
            <span className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <User size={14} />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/usage" />}>
            <CreditCard size={14} />
            Usage & billing
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings size={14} />
            Preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut size={14} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      import("@/lib/api").then(({ api }) => {
        api
          .get(`/review?status=pending`)
          .then((d) => {
            if (d?.counts?.total) setPendingCount(d.counts.total);
          })
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CP";

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen bg-background border-r border-zinc-200 dark:border-[#1c2123] fixed left-0 top-0 z-30">
        {/* Workspace header */}
        <div className="px-3 py-3 border-b border-zinc-200 dark:border-[#1c2123] shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <img
                src="/icons/icon-192.svg"
                alt="CalmPilot"
                className="w-4 h-4"
              />
            </div>
            <span className="text-sm font-semibold text-foreground truncate">
              CalmPilot
            </span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {mainNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={
                item.href === "/dashboard/review" ? pendingCount : undefined
              }
            />
          ))}

          {/* Monitoring group — with section divider */}
          {/* <NavSection label="Monitoring" /> */}
          {monitoringNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-zinc-200 dark:border-[#1c2123] px-3 py-3 space-y-0.5">
          {/* {bottomNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))} */}

          {/* Credits row */}
          {balanceData && (
            <Link
              href="/dashboard/usage"
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-muted/50 transition-colors dark:text-[#a3adb8] dark:hover:text-[#f3f6fb]"
            >
              <span className="font-medium">Credits</span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  balanceData.balance <= 0
                    ? "text-destructive"
                    : balanceData.balance < 1
                      ? "text-amber-400"
                      : "text-foreground"
                }`}
              >
                ${Math.max(0, balanceData.balance).toFixed(2)}
              </span>
            </Link>
          )}

          {/* User row with dropdown */}
          {user && (
            <UserMenu
              user={user}
              initials={initials}
              onSignOut={() => setShowSignOutDialog(true)}
            />
          )}
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 bg-background border-b border-zinc-200 dark:border-[#1c2123] safe-top">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0">
            <img
              src="/icons/icon-192.svg"
              alt="CalmPilot"
              className="w-3.5 h-3.5"
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            CalmPilot
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors dark:text-[#a3adb8] dark:hover:text-[#f3f6fb]"
          aria-label="Open menu"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-semibold text-foreground">
              {initials}
            </div>
          )}
        </button>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR (improved) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 bg-background border-t border-zinc-200 dark:border-[#1c2123] safe-bottom">
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
              className={`relative flex flex-col items-center gap-0.5 py-2 transition-colors pressable ${
                isActive ? "text-primary" : "text-muted-foreground/60"
              }`}
            >
              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-b-full bg-primary" />
              )}
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
                {isInbox && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center px-0.5 leading-none">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ─── MOBILE SLIDE-OUT DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[260px] bg-background border-l border-zinc-200 dark:border-[#1c2123] flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#1c2123]">
              <span className="text-sm font-semibold text-foreground">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-muted/50 transition-colors"
              >
                <X
                  size={16}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                />
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-[#1c2123] flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.name}'s avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {mainNav.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  badge={
                    item.href === "/dashboard/review" ? pendingCount : undefined
                  }
                />
              ))}
              <NavSection label="Monitoring" />
              {monitoringNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
              <NavSection label="System" />
              {/* {bottomNav.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))} */}
            </nav>

            <div className="border-t border-zinc-200 dark:border-[#1c2123] px-3 py-3 space-y-0.5">
              {balanceData && (
                <Link
                  href="/dashboard/usage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-muted/50 transition-colors dark:text-[#a3adb8] dark:hover:text-[#f3f6fb]"
                >
                  <span>Credits</span>
                  <span className="font-semibold text-foreground">
                    ${Math.max(0, balanceData.balance).toFixed(2)}
                  </span>
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSignOutDialog(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
        onConfirm={() => {
          setShowSignOutDialog(false);
          signOut();
        }}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </>
  );
}
