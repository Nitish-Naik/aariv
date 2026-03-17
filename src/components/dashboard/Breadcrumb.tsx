"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PATH_LABELS: Record<string, string> = {
  dashboard: "Overview",
  review: "Inbox",
  assistant: "Assistant",
  triggers: "Automations",
  integrations: "Integrations",
  feed: "Activity",
  settings: "Settings",
  usage: "Usage",
};

/**
 * Auto-generating breadcrumb based on the current URL path.
 * Shows: Overview > Current Page
 *
 * Usage: <Breadcrumb /> — place inside any dashboard subpage header.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show on root /dashboard (Overview)
  if (segments.length <= 1) return null;

  // Build crumbs: always starts with Overview
  const crumbs: { label: string; href: string }[] = [
    { label: "Overview", href: "/dashboard" },
  ];

  // Add intermediate + current segments
  let path = "";
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    if (i === 0) continue; // skip "dashboard" itself — already added as Overview
    const label = PATH_LABELS[segments[i]] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
    crumbs.push({ label, href: path });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight strokeWidth={1.5} size={10} className="text-muted-foreground/40" />}
            {isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                {i === 0 && <Home strokeWidth={1.5} size={10} />}
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
