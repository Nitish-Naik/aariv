"use client";

import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null | undefined>;

/**
 * Fires a named analytics event via Vercel Analytics.
 * Errors are swallowed so analytics failures never interrupt user actions.
 *
 * @param name - Event name (e.g. `"chat_sent"`, `"integration_connected"`).
 * @param props - Optional flat map of string/number/boolean properties
 *   to attach to the event for segmentation.
 *
 * @example
 * ```ts
 * trackEvent("onboarding_completed", { tier: "pro", steps: 3 });
 * ```
 */
export function trackEvent(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // Keep analytics non-blocking for user actions.
  }
}
