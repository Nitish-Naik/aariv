"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Consistent loading skeletons used across all dashboard pages.
 * Built on shadcn's Skeleton primitive.
 */

export function SkeletonLine({ className = "w-full" }: { className?: string }) {
  return <Skeleton className={`h-3 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-[1rem] sm:rounded-[1.25rem] h-[180px] sm:h-[220px] md:h-[260px] border border-border bg-card"
        >
          <div className="h-full p-3 sm:p-4 md:p-5 flex flex-col">
            <div className="flex justify-end">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center pb-2 sm:pb-4 gap-3">
              <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-lg sm:rounded-xl" />
              <Skeleton className="h-4 w-20 sm:w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
