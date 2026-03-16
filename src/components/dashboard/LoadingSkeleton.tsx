"use client";

/**
 * Consistent loading skeletons used across all dashboard pages.
 *
 * Usage:
 *   <SkeletonCard />              — single card
 *   <SkeletonList count={5} />    — list of rows
 *   <SkeletonGrid count={8} />    — grid of cards
 */

export function SkeletonLine({ className = "w-full" }: { className?: string }) {
  return (
    <div className={`h-3 rounded bg-white/[0.06] animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-neutral-900 p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2 pt-1">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-1/2" />
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

export function SkeletonGrid({ count = 8, cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-[1rem] sm:rounded-[1.25rem] h-[180px] sm:h-[220px] md:h-[260px] bg-[#111319] border border-white/[0.06] animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-full p-3 sm:p-4 md:p-5 flex flex-col">
            <div className="flex justify-end">
              <div className="h-6 w-16 rounded-full bg-white/[0.06]" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center pb-2 sm:pb-4 gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-lg sm:rounded-xl bg-white/[0.06]" />
              <div className="h-4 w-20 sm:w-28 rounded-lg bg-white/[0.04]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
