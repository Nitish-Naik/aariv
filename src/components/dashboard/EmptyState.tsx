"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
}

/**
 * Consistent empty state used across all dashboard pages.
 *
 * Usage:
 *   <EmptyState
 *     icon={Activity}
 *     title="Your feed is quiet"
 *     description="Once your triggers start capturing events, they'll appear here."
 *     primaryAction={{ label: "Set up triggers", href: "/dashboard/triggers" }}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/[0.06] flex items-center justify-center">
        <Icon strokeWidth={1.5} size={20} className="text-neutral-600" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 pt-1">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-100 transition-colors"
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
