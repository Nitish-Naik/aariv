"use client";

import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // Keep analytics non-blocking for user actions.
  }
}
