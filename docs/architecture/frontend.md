# Frontend Architecture — CalmPilot

## Overview

CalmPilot's frontend is built with **Next.js 14 App Router** and **React 18**, styled with **Tailwind CSS** and **shadcn/ui** component primitives. It is deployed on **Vercel** and communicates with a Python FastAPI backend over a typed HTTP client that automatically injects Supabase session tokens. Authentication is handled entirely through Supabase Auth with Google OAuth, and real-time billing state is synced via Supabase Realtime.

---

## Directory Structure

```
web/src/
├── app/                        # Next.js App Router — pages, layouts, routes
│   ├── layout.tsx              # Root layout: fonts, metadata, JSON-LD, PWA, analytics
│   ├── providers.tsx           # Global provider tree (Theme, Auth, Toast, Tooltip)
│   ├── globals.css             # Tailwind base styles + CSS variables
│   ├── page.tsx                # Landing page (/)
│   ├── login/page.tsx          # Google OAuth sign-in
│   ├── pricing/page.tsx        # Public pricing page
│   ├── blog/page.tsx           # Blog listing
│   ├── integrations/
│   │   ├── page.tsx            # Integrations directory
│   │   └── [slug]/page.tsx     # Per-integration detail page
│   ├── terms/page.tsx          # Terms of Service
│   ├── privacy/page.tsx        # Privacy Policy
│   ├── checkout/page.tsx       # Stripe checkout redirect
│   ├── auth/callback/route.ts  # OAuth code-exchange route
│   ├── robots.ts               # robots.txt generation
│   ├── sitemap.ts              # sitemap.xml generation
│   └── dashboard/
│       ├── layout.tsx          # Dashboard shell: auth guard, Sidebar, StatusBanner, BillingProvider
│       ├── page.tsx            # Dashboard home / overview
│       ├── assistant/page.tsx  # AI chat assistant with SSE streaming
│       ├── feed/page.tsx       # Activity feed / daily briefing
│       ├── review/page.tsx     # Human-in-the-loop review queue
│       ├── triggers/page.tsx   # Smart triggers management
│       ├── integrations/page.tsx # Connected app integrations
│       └── settings/page.tsx   # User settings
│
├── components/
│   ├── Sidebar.tsx             # Collapsible nav sidebar
│   ├── ErrorBoundary.tsx       # Per-page React error boundary
│   ├── ConfirmDialog.tsx       # Reusable confirmation dialog
│   ├── FeedbackWidget.tsx      # In-app feedback button
│   ├── UpgradeDialog.tsx       # Plan upgrade modal + UpgradeDialogProvider
│   ├── PulsingAvatar.tsx       # Animated avatar indicator
│   ├── DataCard.tsx            # Structured tool-output cards (email/calendar/message)
│   ├── index.ts                # Barrel exports
│   ├── dashboard/
│   │   ├── EmptyState.tsx      # Empty state for lists
│   │   └── WeeklyStats.tsx     # Weekly usage stats widget
│   ├── secure-agent/           # Landing page sections
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── WhatIsCalmPilot.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── UseCaseList.tsx
│   │   ├── IntegrationsShowcase.tsx
│   │   ├── PricingSection.tsx
│   │   ├── SecurityBand.tsx
│   │   ├── SocialProof.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   ├── FinalCTA.tsx
│   │   ├── Footer.tsx
│   │   └── Logo.tsx
│   └── ui/                     # shadcn/ui primitives
│       ├── accordion.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       ├── Sheet.tsx
│       ├── skeleton.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
│
├── context/                    # React Context providers
│   ├── AuthContext.tsx         # User session, Google OAuth, backend sync
│   ├── ThemeContext.tsx        # Dark/light mode toggle + persistence
│   ├── useBilling.tsx          # Subscription tier, usage limits, Realtime sync
│   ├── ToastContext.tsx        # Toast notifications
│   └── LogoContext.tsx         # App logo resolution + session cache
│
├── lib/
│   ├── api.ts                  # Typed HTTP client with auth injection
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── supabase.ts             # Supabase browser client
│   ├── supabase-server.ts      # Supabase server client (for middleware/RSC)
│   ├── utils.ts                # cn() Tailwind class merge utility
│   ├── prompt-store.ts         # Zustand store for cross-page prompt passing
│   ├── analytics.ts            # Analytics helper
│   ├── platform-logos.ts       # Inline SVG logos + slug normalization
│   └── integrations-data.ts    # Static integrations metadata
│
└── middleware.ts               # Edge middleware: auth guard + OAuth code redirect
```

---

## Pages

| Route | File | Purpose | Auth Required? |
|---|---|---|---|
| `/` | `app/page.tsx` | Landing page (marketing) | No |
| `/login` | `app/login/page.tsx` | Google OAuth sign-in | No |
| `/pricing` | `app/pricing/page.tsx` | Public pricing page | No |
| `/blog` | `app/blog/page.tsx` | Blog listing | No |
| `/integrations` | `app/integrations/page.tsx` | App integrations directory | No |
| `/integrations/[slug]` | `app/integrations/[slug]/page.tsx` | Per-integration detail page | No |
| `/terms` | `app/terms/page.tsx` | Terms of Service | No |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy | No |
| `/checkout` | `app/checkout/page.tsx` | Stripe checkout redirect page | Yes |
| `/auth/callback` | `app/auth/callback/route.ts` | Supabase OAuth code exchange | No |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard overview / home | Yes |
| `/dashboard/assistant` | `app/dashboard/assistant/page.tsx` | AI chat with SSE streaming | Yes |
| `/dashboard/feed` | `app/dashboard/feed/page.tsx` | Activity feed / daily briefing | Yes |
| `/dashboard/review` | `app/dashboard/review/page.tsx` | Human-in-the-loop review queue | Yes |
| `/dashboard/triggers` | `app/dashboard/triggers/page.tsx` | Smart triggers management | Yes |
| `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` | Connected OAuth integrations | Yes |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | User account settings | Yes |

---

## Components

### Core Components

| Component | File | Description |
|---|---|---|
| `Sidebar` | `components/Sidebar.tsx` | Collapsible left-nav with links to all dashboard sections, user avatar, and upgrade button. Uses shadcn Sheet for mobile. |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | Per-route React class component boundary; catches render errors and shows a retry prompt. |
| `ConfirmDialog` | `components/ConfirmDialog.tsx` | Generic confirmation dialog built on shadcn Dialog; takes `onConfirm`/`onCancel` props. |
| `FeedbackWidget` | `components/FeedbackWidget.tsx` | Floating feedback button for in-app user feedback submission. |
| `UpgradeDialog` | `components/UpgradeDialog.tsx` | Plan upgrade modal with pricing; provides `UpgradeDialogProvider` and `useUpgradeDialog` hook. |
| `PulsingAvatar` | `components/PulsingAvatar.tsx` | Animated avatar with a pulsing ring indicator (used for AI activity state). |
| `DataCard` | `components/DataCard.tsx` | Renders structured tool-output cards: email, calendar event, or Slack message. |

### Dashboard Components

| Component | File | Description |
|---|---|---|
| `EmptyState` | `components/dashboard/EmptyState.tsx` | Empty state illustration + CTA for lists with no data. |
| `WeeklyStats` | `components/dashboard/WeeklyStats.tsx` | Weekly usage bar chart widget shown on the dashboard overview. |

### Landing Page Components (`components/secure-agent/`)

| Component | Description |
|---|---|
| `Navbar` | Top navigation bar with links and sign-in CTA |
| `Hero` | Above-the-fold hero section with headline and primary CTA |
| `WhatIsCalmPilot` | Explainer section describing the product |
| `FeaturesGrid` | Grid of feature cards |
| `HowItWorks` | Step-by-step flow diagram section |
| `UseCaseList` | Horizontal use case examples |
| `IntegrationsShowcase` | Grid of supported integrations with logos |
| `PricingSection` | Pricing tiers with feature comparison |
| `SecurityBand` | Trust/security badge strip |
| `SocialProof` | User count / social proof indicators |
| `Testimonials` | Customer testimonial cards |
| `FAQ` | Accordion-based FAQ using shadcn Accordion |
| `FinalCTA` | Bottom CTA section |
| `Footer` | Site footer with links |
| `Logo` | CalmPilot logo component |

### UI Primitives (`components/ui/`)

Thin wrappers from **shadcn/ui** built on Radix UI and styled with Tailwind:

`accordion` · `avatar` · `badge` · `button` · `card` · `dialog` · `dropdown-menu` · `input` · `label` · `separator` · `Sheet` · `skeleton` · `tabs` · `tooltip`

---

## Context Providers

The global provider tree (in `app/providers.tsx`) wraps the entire app:

```
ErrorBoundary
  ThemeProvider
    AuthProvider
      TooltipProvider
        ToastProvider
          {children}
```

Inside the dashboard layout, additional providers are layered:

```
BillingProvider
  UpgradeDialogProvider
    LogoProvider
      {children}
```

### 1. AuthContext

**File:** `web/src/context/AuthContext.tsx`

**Provides:**
| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | Currently authenticated user (mapped from Supabase session) |
| `isLoading` | `boolean` | True while the initial session is being resolved |
| `signInWithGoogle` | `() => Promise<void>` | Triggers Supabase Google OAuth redirect |
| `signOut` | `() => Promise<void>` | Signs out and redirects to `/login` |

**Hook:** `useAuth()`

**Key implementation details:**
- On mount, calls `supabase.auth.getSession()` to hydrate the initial user state.
- Subscribes to `supabase.auth.onAuthStateChange` to reactively update state on login/logout.
- On `SIGNED_IN` or `INITIAL_SESSION` events, calls `syncWithBackend()` which POSTs to `/auth/sync` with the user's name, avatar, and timezone. This is deduplicated per session via a ref so it fires at most once per user ID.
- `signOut` calls `supabase.auth.signOut()` then hard-navigates to `/login` via `window.location.href` to ensure a full React state reset.
- The `User` type mapped from Supabase includes `id`, `email`, `name`, `avatar`, and `googleId`.

---

### 2. ThemeContext

**File:** `web/src/context/ThemeContext.tsx`

**Provides:**
| Value | Type | Description |
|---|---|---|
| `theme` | `"light" \| "dark"` | Current theme name |
| `isDark` | `boolean` | Convenience boolean |
| `toggleTheme` | `() => void` | Switches between light and dark |

**Hook:** `useTheme()`

**Key implementation details:**
- Persists the selected theme to `localStorage` under the key `calmpilot-theme`.
- Migrates the legacy key `aariv-theme` to `calmpilot-theme` on first load.
- Falls back to the OS preference (`prefers-color-scheme`) if no stored preference exists.
- Applies the `dark` class to `document.documentElement` to enable Tailwind dark mode.
- Defaults to `"dark"` on server render to prevent hydration mismatch (`suppressHydrationWarning` is set on `<html>`).

---

### 3. BillingContext (useBilling)

**File:** `web/src/context/useBilling.tsx`

**Provides:**
| Value | Type | Description |
|---|---|---|
| `balanceData` | `BillingBalance \| null` | Current usage and subscription data |
| `isLoading` | `boolean` | True while fetching balance |
| `error` | `string \| null` | Fetch error message if any |
| `refetch` | `() => Promise<BillingBalance \| null>` | Manually re-fetches balance from backend |

**`BillingBalance` shape:**
```ts
{
  subscription_tier: "free" | "starter" | "pro";
  chat_messages_used: number;
  chat_messages_limit: number;
  trigger_fires_today: number;
  trigger_fires_limit: number;
  in_grace_period?: boolean;
  grace_period_ends?: string;
}
```

**Hook:** `useBilling()` — throws if used outside `BillingProvider`

**Key implementation details:**
- Only mounted inside the dashboard layout, so it is not loaded on public pages.
- Initial fetch is deferred with `requestAnimationFrame` to avoid blocking first paint.
- After a 3-second delay, opens a **Supabase Realtime** channel (`billing:{userId}`) that listens for `UPDATE` events on the `user_credits` table filtered by `user_id`. When a change arrives, it merges the new row into local state without a full refetch.
- The dashboard's `StatusBanner` component uses this context to show usage warnings and upgrade prompts to free-tier users.

---

### 4. ToastContext

**File:** `web/src/context/ToastContext.tsx`

**Provides:**
| Value | Type | Description |
|---|---|---|
| `toast` | `(msg, type?, duration?) => void` | Show a toast with explicit type |
| `success` | `(msg) => void` | Show a success toast |
| `error` | `(msg) => void` | Show an error toast |
| `info` | `(msg) => void` | Show an info toast |

**Hook:** `useToast()`

**Key implementation details:**
- Toasts are rendered in a fixed bottom-center container using `framer-motion` `AnimatePresence` for enter/exit animations (blur + slide + scale).
- Each toast has a unique ID (`Date.now() + random`) and auto-dismisses after its `duration` (default 4000 ms).
- Supports three types: `"success"` (emerald), `"error"` (red), `"info"` (blue), each with a distinct Lucide icon.

---

### 5. LogoContext

**File:** `web/src/context/LogoContext.tsx`

**Provides:**
| Value | Type | Description |
|---|---|---|
| `logoMap` | `Record<string, string>` | Slug-to-URL map cached in sessionStorage |
| `getLogo` | `(slug: string) => string \| undefined` | Returns a logo URL for a given app slug |

**Hook:** `useLogo()`

**Key implementation details:**
- Logo resolution uses a three-tier fallback: local `logoMap` state → `getAppLogo()` (inline SVG data URIs from `platform-logos.ts`) → Composio CDN.
- The map is persisted to `sessionStorage` under `calmpilot_logo_map_v1` so lookups survive in-session navigation without re-fetching.
- Slug normalization via `normalizeAppSlug()` handles casing and dash variants (e.g. `"Gmail"` → `"gmail"`).
- Dashboard logo images are preloaded during browser idle time in `dashboard/layout.tsx` using `requestIdleCallback`.

---

## API Client

**File:** `web/src/lib/api.ts`

The `api` object is the single HTTP client used throughout the frontend. It wraps the native `fetch` API.

### Auth Header Injection

Every request calls `getAuthHeaders()` before it is sent. This function retrieves the active Supabase session and adds:
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

If there is no active session, the Authorization header is omitted (the backend will return 401).

### Available Methods

| Method | Signature | Notes |
|---|---|---|
| `api.get(endpoint, options?)` | GET request | 30s timeout via AbortController |
| `api.post(endpoint, body, options?)` | POST request | 30s timeout |
| `api.put(endpoint, body, options?)` | PUT request | 30s timeout |
| `api.patch(endpoint, body, options?)` | PATCH request | 30s timeout |
| `api.delete(endpoint, options?)` | DELETE request | 30s timeout, optional body |
| `api.stream(endpoint, body, signal?)` | POST returning raw `Response` | No timeout; used for SSE |
| `api.getConnections()` | GET `/chat/connections` | Shorthand for connection check |
| `api.getBaseUrl()` | Returns `NEXT_PUBLIC_API_URL` | Used to construct custom URLs |

### Error Handling

| Status | Behavior |
|---|---|
| `401` | Calls `supabase.auth.signOut()` and redirects to `/login` |
| `402` | Throws an error with code `QUOTA_EXCEEDED` (or the backend-provided code); `.response.status === 402` is set on the error for callers to detect |
| Other non-2xx | Parses `errorData.message` or `errorData.error`; if `USER_NOT_FOUND`, signs out and redirects to `/login` |
| Timeout (30s) | Throws `"Request timeout. Please try again."` |
| Network failure | Throws `"Could not connect to server. Is the backend running?"` |

### Streaming Support

`api.stream()` returns a raw `fetch` `Response` object with no timeout. The caller is responsible for reading the SSE stream from `response.body`. An `AbortSignal` can be passed to cancel the stream.

---

## SSE Streaming

The AI assistant page (`/dashboard/assistant`) uses Server-Sent Events (SSE) to stream responses token-by-token from the backend.

**Flow:**
1. The user submits a message. The page calls `api.stream("/chat/stream", { message, conversationId, ... }, abortSignal)`.
2. The returned `Response.body` is a `ReadableStream`. The page reads it with a `TextDecoder` and processes each `data: {...}` line.
3. Tokens are appended to the in-progress assistant message as they arrive, producing a typewriter effect.
4. The backend sends a final `[DONE]` sentinel or closes the stream to signal completion.
5. If the user navigates away or sends a new message, the `AbortController` signal cancels the in-flight stream cleanly.

Tool-call logs, auth action prompts, and data cards are delivered as structured JSON events within the same SSE stream and rendered as they arrive.

---

## Styling

- **Tailwind CSS** (v3) is the primary styling approach. All utility classes are configured in `tailwind.config.ts`.
- **shadcn/ui** provides accessible, unstyled base components (Radix UI primitives) wrapped in Tailwind classes.
- **Dark mode** is managed by `ThemeContext`, which toggles the `dark` class on `<html>`. All Tailwind `dark:` variants respond to this class.
- **`cn()` utility** (`lib/utils.ts`) combines `clsx` and `tailwind-merge` to safely compose conditional class strings:
  ```ts
  cn("base-class", condition && "conditional-class", "another-class")
  ```
- **Framer Motion** is used for toast animations, modal transitions, and micro-interactions.
- **Inter** (Google Font) is loaded via `next/font/google` with the CSS variable `--font-sans`.
- Static assets (`/images/`, `/icons/`) are served with 1-year immutable cache headers.

---

## State Management

CalmPilot uses a hybrid state approach:

| Concern | Solution | Scope |
|---|---|---|
| Auth session | `AuthContext` (React Context) | Global — all pages |
| Theme preference | `ThemeContext` (React Context) | Global — all pages |
| Toast notifications | `ToastContext` (React Context) | Global — all pages |
| Billing / usage | `BillingContext` (React Context) | Dashboard only |
| App logos | `LogoContext` (React Context) | Dashboard only |
| Upgrade modal state | `UpgradeDialogContext` (React Context) | Dashboard only |
| Cross-page prompt passing | `usePromptStore` (Zustand) | In-memory, session-scoped |
| Per-page UI state | `useState` / `useReducer` | Component-local |

**Zustand prompt store** (`lib/prompt-store.ts`): Allows any dashboard page to set a `pendingPrompt` string that the assistant page reads and auto-submits on mount. This enables "Ask AI about this" shortcuts from other pages.

---

## Middleware

**File:** `web/src/middleware.ts` (Next.js Edge Middleware)

The middleware runs on every request matched by the `config.matcher` (all non-static routes):

1. **OAuth code redirect**: If a `?code=` param is present on any page, redirects to `/auth/callback` to exchange it. This handles OAuth redirects that land on unexpected pages.
2. **Public route bypass**: Routes matching `/login`, `/auth`, `/blog`, `/integrations`, `/terms`, `/privacy`, and `/` skip the Supabase auth check entirely, saving ~200–500 ms TTFB.
3. **Auth guard**: For all other routes, calls `supabase.auth.getUser()`. If no user is found, redirects to `/login`.

---

## Security Headers

Configured in `web/next.config.js` and applied to all routes (`/(.*)`):

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` (no iframe embedding) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (production only) |
| `Content-Security-Policy` | Restricts scripts, styles, images, and connections to known origins |
| `Permissions-Policy` | Disables `identity-credentials-get` |

In development, `connect-src` allows `localhost:*` and `ws://localhost:*`. In production it restricts to Supabase, Render, and Resend domains.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the FastAPI backend (e.g. `https://api.calmpilot.app/api`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `NEXT_PUBLIC_SIMPLE_ANALYTICS_ENABLED` | No | Set to `"true"` in dev to enable Simple Analytics |

All `NEXT_PUBLIC_` variables are inlined at build time and safe to expose to the browser. The Supabase anon key is intentionally public — row-level security (RLS) policies on the database enforce access control.

---

## Common Tasks

### How do I add a new dashboard page?

1. Create the file at `web/src/app/dashboard/<route>/page.tsx`.
2. The page is automatically protected by `dashboard/layout.tsx` (auth guard + sidebar + billing context).
3. Add a nav link to `web/src/components/Sidebar.tsx`.
4. Add the route to the Pages table above.

Example minimal page:
```tsx
"use client";

export default function MyNewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">My New Page</h1>
    </div>
  );
}
```

To call the backend, import `api`:
```tsx
import { api } from "@/lib/api";

const data = await api.get("/my-endpoint");
```

### How do I add a new context provider?

1. Create `web/src/context/MyContext.tsx` following the pattern of existing contexts:
   - Define your context type interface.
   - Create the context with `createContext`.
   - Export a `MyProvider` component.
   - Export a `useMyContext` hook.

2. Decide on scope:
   - **Global** (needed on all pages including landing): Add to the `Providers` component in `web/src/app/providers.tsx`.
   - **Dashboard-only**: Add to `web/src/app/dashboard/layout.tsx` inside the existing provider tree.

3. Keep providers lean — avoid fetching data in global providers that public pages don't need. Prefer dashboard-scoped providers for authenticated data.

Example skeleton:
```tsx
"use client";

import { createContext, useContext, useState } from "react";

interface MyContextValue {
  value: string;
  setValue: (v: string) => void;
}

const MyContext = createContext<MyContextValue | null>(null);

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState("");
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext(): MyContextValue {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error("useMyContext must be used within MyProvider");
  return ctx;
}
```
