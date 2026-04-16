"use client";

import { Button } from "@/components/ui/button";
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
 * Uses shadcn Button for CTAs.
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
      <div className="w-12 h-12 rounded-2xl bg-muted border border-white/[0.08] flex items-center justify-center">
        <Icon strokeWidth={1.5} size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 pt-1">
          {primaryAction && (
            <Button size="sm" render={<Link href={primaryAction.href} />}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" size="sm" render={<Link href={secondaryAction.href} />}>
                {secondaryAction.label}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
