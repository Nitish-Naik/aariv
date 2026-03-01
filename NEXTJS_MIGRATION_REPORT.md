# Aariv Frontend Codebase — Comprehensive Research Report for Next.js Migration

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Navigation & Route Structure](#2-navigation--route-structure)
3. [App Screens (app/)](#3-app-screens)
4. [Tab Screens (app/(tabs)/)](#4-tab-screens)
5. [Auth & Legal (app/auth/, app/legal/)](#5-auth--legal)
6. [Reusable Components (components/)](#6-reusable-components)
7. [Screen Components (screens/)](#7-screen-components)
8. [App-Level Components (app/components/)](#8-app-level-components)
9. [Services](#9-services)
10. [Context / State Management](#10-context--state-management)
11. [Hooks](#11-hooks)
12. [Theme System](#12-theme-system)
13. [Types / Interfaces](#13-types--interfaces)
14. [API Endpoints Inventory](#14-api-endpoints-inventory)
15. [External Dependencies Inventory](#15-external-dependencies-inventory)
16. [React Native–Specific APIs to Replace](#16-react-native-specific-apis-to-replace)
17. [Migration Complexity Assessment](#17-migration-complexity-assessment)

---

## 1. Architecture Overview

| Aspect        | Current (Expo/RN)                         | Next.js Target                            |
| ------------- | ----------------------------------------- | ----------------------------------------- |
| Routing       | Expo Router (file-based, `app/` dir)      | Next.js App Router (`app/` dir)           |
| Rendering     | Client-only                               | SSR / RSC + Client                        |
| Styling       | RN `StyleSheet.create()` + design tokens  | CSS Modules / Tailwind / CSS-in-JS        |
| State         | React Context (Auth, Theme, Subscription) | Same Context or Zustand/Jotai             |
| API Client    | Custom fetch w/ Supabase JWT              | Same (isomorphic fetch)                   |
| Auth          | Supabase Auth + Google OAuth              | Supabase Auth + Next-Auth or Supabase SSR |
| Subscriptions | RevenueCat (IAP)                          | Stripe / LemonSqueezy (web payments)      |
| Notifications | expo-notifications                        | Web Push API / service worker             |
| Audio         | expo-av                                   | Web Audio API / MediaRecorder             |

**Provider Hierarchy (current):**

```
ErrorBoundary
  └─ SafeAreaProvider
       └─ AuthProvider
            └─ SubscriptionProvider
                 └─ ThemeProvider
                      └─ RootNavigation (Stack)
```

---

## 2. Navigation & Route Structure

### Current Expo Router Layout

```
app/
├── _layout.tsx          → Root Stack layout + auth guard + providers
├── index.tsx            → Home screen (legacy, pre-tabs)
├── login.tsx            → Login screen
├── onboarding.tsx       → 4-slide onboarding flow
├── paywall.tsx          → Subscription upgrade modal
├── toolkits.tsx         → Integration management (modal)
├── voice-mode.tsx       → Voice conversation (modal)
├── zen-mode.tsx         → Swipe action review (fullScreenModal)
├── action-status.tsx    → Post-action status viewer
├── edit-action.tsx      → Draft action editor
├── event-detail.tsx     → Calendar event detail
├── (tabs)/
│   ├── _layout.tsx      → Tab bar (5 visible tabs)
│   ├── index.tsx        → Home tab
│   ├── assistant.tsx    → AI Chat / Copilot tab
│   ├── calendar.tsx     → Calendar (Horizon) tab
│   ├── inbox.tsx        → Review tab
│   ├── settings.tsx     → Settings tab
│   └── connect-platforms.tsx → Platform mgmt (hidden tab)
├── auth/
│   └── callback.tsx     → OAuth callback handler
├── components/
│   └── MarkdownText.tsx → Inline markdown renderer
└── legal/
    ├── privacy.tsx      → Privacy policy
    └── terms.tsx        → Terms of Service
```

### Stack Presentation Modes

| Route         | Presentation      |
| ------------- | ----------------- |
| `paywall`     | `modal`           |
| `zen-mode`    | `fullScreenModal` |
| `voice-mode`  | `modal`           |
| `toolkits`    | `modal`           |
| `edit-action` | default (push)    |
| All others    | default (push)    |

### Auth Navigation Guard (in `_layout.tsx`)

```
if (!isAuthenticated) → redirect /login
if (authenticated && !onboardingComplete) → redirect /onboarding
else → show /(tabs)
```

### Proposed Next.js Route Mapping

```
app/
├── layout.tsx           → Providers, auth guard (middleware.ts for redirects)
├── page.tsx             → Home
├── login/page.tsx
├── onboarding/page.tsx
├── paywall/page.tsx     → Dialog/Sheet component (or Parallel Route @modal)
├── toolkits/page.tsx
├── voice-mode/page.tsx
├── zen-mode/page.tsx
├── action-status/page.tsx
├── edit-action/page.tsx
├── event/[id]/page.tsx
├── (tabs)/
│   ├── layout.tsx       → Tab bar UI (client component)
│   ├── page.tsx         → Home tab
│   ├── assistant/page.tsx
│   ├── calendar/page.tsx
│   ├── inbox/page.tsx
│   ├── settings/page.tsx
│   └── connect-platforms/page.tsx
├── auth/callback/page.tsx
└── legal/
    ├── privacy/page.tsx
    └── terms/page.tsx
```

---

## 3. App Screens

### `app/_layout.tsx` (207 lines)

- **Purpose:** Root layout — providers, auth guard, font loading, startup tasks
- **Key Exports:** `RootLayout` (default), `RootNavigation`, `ThemedStack`
- **Auth Logic:** Reads `isAuthenticated`, `onboardingStatus.complete`, redirects accordingly
- **Startup Tasks:** Register push notifications, schedule daily briefing, register background sync, init subscription service
- **RN-Specific:** `View`, `ActivityIndicator`, `Platform`, `Stack` (expo-router), `useFonts`
- **External Deps:** `@expo/vector-icons`, `@vercel/speed-insights`, `expo-font`, `expo-router`, `expo-splash-screen`, `react-native-safe-area-context`
- **Migration:** Replace `Stack` with Next.js layout nesting. Auth guard → `middleware.ts`. Startup tasks → `useEffect` in root client layout or Next.js `instrumentation.ts`.

### `app/index.tsx`

- **Purpose:** Legacy home screen with time-of-day greeting, "Nothing needs your attention" message, bottom nav icons
- **Key Exports:** `Index` (default)
- **RN-Specific:** `View`, `Text`, `StyleSheet`, `TouchableOpacity`, `Platform`
- **External Deps:** `@expo/vector-icons` (Ionicons, MaterialIcons, Feather, FontAwesome5)
- **Migration:** Simple — replace with standard HTML/CSS. Icons → `lucide-react` or `react-icons`.

### `app/login.tsx`

- **Purpose:** Login screen — "Continue with Google" button, branding, legal links
- **Key Exports:** `LoginRoute` (default)
- **Calls:** `signInWithGoogle()` from `services/auth`
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `ActivityIndicator`, `Alert`, `Dimensions`
- **External Deps:** `expo-linear-gradient`, `expo-router`
- **Migration:** Replace `LinearGradient` with CSS `linear-gradient`. Supabase OAuth flow is browser-native.

### `app/onboarding.tsx`

- **Purpose:** 4-slide horizontal FlatList. Final slide connects Google Calendar via API. Polls for Gmail connection.
- **Key Exports:** `OnboardingScreen` (default)
- **API Calls:** `POST /integrations/connect` → opens OAuth URL
- **RN-Specific:** `FlatList` (horizontal paging), `Dimensions`, `Platform`, `Linking`
- **External Deps:** `expo-router`, `expo-web-browser`, `@react-navigation/native` (useFocusEffect)
- **Migration:** FlatList → CSS scroll-snap carousel or Embla Carousel. `Linking.openURL` → `window.open()`. `useFocusEffect` → `useEffect` or Next.js `usePathname`.

### `app/paywall.tsx`

- **Purpose:** Subscription upgrade modal. Pro ($12/mo) and Business ($29/mo) plans.
- **Key Exports:** `PaywallScreen` (default)
- **Uses:** `useSubscriptionService()` for offerings, purchase, restore
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `ScrollView`, `ActivityIndicator`, `StatusBar`, `Platform`
- **Migration:** RevenueCat → Stripe Checkout or LemonSqueezy. UI straightforward.

### `app/toolkits.tsx` (552 lines)

- **Purpose:** Integration management — search/filter, connect/disconnect, permission scopes modal
- **API Calls:** `GET /toolkits?userId=`, `GET /toolkits/bundles`
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `FlatList`, `Modal`, `ScrollView`, `TextInput`, `Alert`, `KeyboardAvoidingView`, `Platform`
- **Migration:** `Modal` → Radix Dialog or Headless UI. `FlatList` → mapped `<div>`. `Alert` → toast/dialog.

### `app/voice-mode.tsx`

- **Purpose:** Record audio → send to backend → receive text + audio → play back with pulse animation
- **API Calls:** `POST ${API_URL}/voice` (FormData with audio file + userId)
- **RN-Specific:** `Animated`, `ScrollView`, `Alert`
- **External Deps:** `expo-av` (Audio recording/playback), `expo-haptics`
- **Migration:** HIGH COMPLEXITY. `expo-av` → Web MediaRecorder API for recording, `<audio>` or Web Audio API for playback. `Animated` → Framer Motion or CSS animations. `expo-haptics` → remove or use Vibration API.

### `app/zen-mode.tsx` (512 lines)

- **Purpose:** Tinder-like swipe card queue. Swipe right = approve, left = reject. Shows execution status.
- **API Calls:** `GET /dashboard/briefing?userId=`, `POST /actions/execute`
- **RN-Specific:** `Animated` (pan gesture, spring animations), `Alert`
- **External Deps:** `expo-haptics`
- **Migration:** MEDIUM-HIGH. `PanResponder` + `Animated` → Framer Motion `drag` or `react-spring`. Swipe gestures need pointer/touch event handling.

### `app/action-status.tsx`

- **Purpose:** Thin route wrapper for `ExecutionStatusScreen`. Parses route params.
- **RN-Specific:** None beyond `expo-router`
- **Migration:** Simple — destructure `searchParams` from Next.js.

### `app/edit-action.tsx`

- **Purpose:** Route wrapper for `EditActionScreen`. Calls `POST /actions/execute` with `SAVE_DRAFT`.
- **API Calls:** `POST /actions/execute` (`{ userId, actionType: 'SAVE_DRAFT', actionData }`)
- **Migration:** Simple.

### `app/event-detail.tsx`

- **Purpose:** Calendar event detail — date/time, duration, location, attendees with RSVP, description, action buttons
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `ScrollView`, `Linking`
- **External Deps:** `date-fns`
- **Migration:** Simple. `Linking.openURL` → `window.open()`.

---

## 4. Tab Screens

### `app/(tabs)/_layout.tsx`

- **Purpose:** Tab navigator with 5 visible tabs + 1 hidden. Cross-fade animation on tab change.
- **Tabs:** Home (`index`), Copilot (`assistant`), Review (`inbox`), Horizon (`calendar`), Settings (`settings`), Hidden: `connect-platforms`
- **RN-Specific:** `Animated`, `Easing`, `Platform`, `Tabs` (expo-router)
- **Migration:** Replace `Tabs` component with a custom tab bar (bottom nav). Cross-fade → CSS transitions.

### `app/(tabs)/index.tsx` (Home Tab)

- **Purpose:** Greeting + calm state with floating particle animation OR actionable proposal cards
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `ScrollView`, `Animated`
- **Mock Data:** `INITIAL_PROPOSALS` array (hardcoded)
- **Migration:** Floating `✦` animation → CSS keyframe animation. Proposal cards → standard divs.

### `app/(tabs)/assistant.tsx` (713 lines) — MOST COMPLEX

- **Purpose:** AI chat with SSE streaming, markdown rendering, status logs (thinking process), auth action cards, proactive notification stream
- **API Calls:**
  - `POST /chat` (SSE: userId, message) — Events: `log`, `auth_required`, `result`, `error`
  - `GET /notifications/{userId}` (SSE proactive summaries)
- **Features:** Suggestion chips, code blocks, link detection, auto-scroll
- **RN-Specific:** `FlatList` (inverted for chat), `TextInput`, `KeyboardAvoidingView`, `Linking`, `Platform`
- **External Deps:** Uses `PulsingAvatar`, `ActionReviewCard`, `StatusLogCard`, `MarkdownText`
- **Migration:** HIGH COMPLEXITY. SSE streaming works the same in web. `FlatList inverted` → flex-direction column-reverse div. Markdown → `react-markdown` or `@mdx-js/react`. KeyboardAvoidingView → not needed on web.

### `app/(tabs)/calendar.tsx` (Horizon Tab)

- **Purpose:** Calendar timeline with hourly slots for today/tomorrow. Pull-to-refresh.
- **API Calls:** `GET /calendar?userId=&timeMin=&timeMax=`
- **RN-Specific:** `ScrollView`, `RefreshControl`
- **External Deps:** `date-fns`
- **Migration:** `RefreshControl` → button or SWR revalidation.

### `app/(tabs)/inbox.tsx` (Review Tab)

- **Purpose:** Question-based review cards. Dismiss/Later/Yes actions. Mock data.
- **RN-Specific:** `ScrollView`, `RefreshControl`
- **Migration:** Simple.

### `app/(tabs)/settings.tsx` (407 lines)

- **Purpose:** Connected sources, surfacing preferences (switches), copilot behaviour, theme toggle, account management
- **RN-Specific:** `Switch`, `Alert`, `ScrollView`
- **Auth Actions:** `signOut()`, `deleteAccount()`
- **Migration:** `Switch` → HTML `<input type="checkbox">` or Radix Switch. `Alert` → confirm dialog.

### `app/(tabs)/connect-platforms.tsx`

- **Purpose:** Fetches connected toolkits, connect/disconnect via OAuth.
- **API Calls:** `GET /toolkits?userId=`, `POST /integrations/connect`, `POST /integrations/disconnect`
- **Migration:** Simple — uses `ConnectPlatformsScreen` component.

---

## 5. Auth & Legal

### `app/auth/callback.tsx`

- **Purpose:** OAuth callback. Checks Supabase session, redirects to `/` or `/login`.
- **Migration:** Supabase has official Next.js helpers (`@supabase/auth-helpers-nextjs`). This becomes a server-side route handler or `auth/callback/route.ts`.

### `app/legal/privacy.tsx` & `app/legal/terms.tsx`

- **Purpose:** Static legal content rendered with `Section/Bullet` helper components.
- **RN-Specific:** `ScrollView`, `View`, `Text`
- **Migration:** Trivial. Convert to static React/HTML.

---

## 6. Reusable Components (`components/`)

### Barrel Export (`components/index.ts`)

Exports: `ActionReviewCard`, `Button`, `Card`, `ErrorBoundary`, `Input`, `PlatformIcon`, `PulsingAvatar`, `StatusLogCard`, `SwipeCard`

### `ActionReviewCard.tsx`

- **Purpose:** Card showing a list of actions for user review (approve/reject buttons)
- **Props:** `actions: ActionItem[]`, `onApprove`, `onReject`, `isExecuting`
- **RN-Specific:** `StyleSheet`, `View`, `Text`, `TouchableOpacity`
- **External:** `lottie-react-native` (loading animations)
- **Migration:** `lottie-react-native` → `@lottiefiles/react-lottie-player` or `lottie-web`.

### `Button.tsx`

- **Purpose:** Reusable button — variants: primary/secondary/outline/ghost, sizes: small/medium/large
- **Props:** `title`, `onPress`, `variant`, `size`, `loading`, `disabled`, `style`, `textStyle`
- **RN-Specific:** `TouchableOpacity`, `ActivityIndicator`, `StyleSheet`
- **Migration:** Replace with `<button>` + CSS classes. Loading spinner → CSS or Lucide `Loader2`.

### `Card.tsx`

- **Purpose:** Wrapper card with surface color, border, optional elevation
- **Props:** `children`, `style`, `elevated`, `padding`
- **RN-Specific:** `View`, shadow properties
- **Migration:** `<div>` with `box-shadow` CSS.

### `ConflictResolutionCard.tsx`

- **Purpose:** Calendar conflict notification with reschedule/notify/decline actions
- **Props:** `conflict: ConflictProposal`, `onResolve`, `onDismiss`
- **Types Exported:** `ConflictProposal` interface
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `StyleSheet`
- **Migration:** Simple div/button conversion.

### `ErrorBoundary.tsx` (155 lines)

- **Purpose:** Class component error boundary with fallback UI showing error details in dev
- **Props:** `children`, `fallback`, `onError`
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`
- **Migration:** Next.js has built-in `error.tsx` convention. Can also use `react-error-boundary`.

### `FloatingCopilotBar.tsx`

- **Purpose:** Floating input bar with pulsing AI dot, text input, mic button. Positioned above tab bar.
- **Props:** `onTextSubmit`, `onVoicePress`
- **RN-Specific:** `Animated` (pulsing dot), `KeyboardAvoidingView`, `TextInput`, `Keyboard`
- **External:** `expo-router`
- **Migration:** `Animated` pulsing → CSS `@keyframes`. `KeyboardAvoidingView` → not needed. Fixed positioning with `position: fixed`.

### `HighlightCard.tsx`

- **Purpose:** Insight/alert cards with severity levels (info/attention/urgent), analytics tracking
- **Props:** `id`, `title`, `description`, `severity`, `actionLabel`, `onActionPress`, telemetry props
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `StyleSheet`
- **External:** `analytics` service
- **Migration:** Simple.

### `Input.tsx`

- **Purpose:** Reusable text input with label and error states
- **Props:** Extends `TextInputProps` + `label`, `error`, `containerStyle`
- **RN-Specific:** `TextInput`, `View`, `Text`
- **Migration:** `<input>` or `<textarea>` with CSS.

### `OnboardingOverlay.tsx`

- **Purpose:** 4-step guided overlay with positioned highlight boxes and step cards
- **Props:** `isVisible`, `onComplete`, `currentStep`, `onNextStep`, `onSkip`
- **RN-Specific:** `Modal`, `View`, `Text`, `TouchableOpacity`
- **Migration:** `Modal` → portal-based overlay or Radix Dialog. Highlight positioning works similarly with CSS absolute.

### `PlatformIcon.tsx`

- **Purpose:** Renders platform brand icon (letter initial in colored circle) or logo image
- **Props:** `platform`, `size`, `logo`
- **Platforms:** gmail, google-calendar, slack, notion, linear, discord, maps, github, twitter
- **RN-Specific:** `View`, `Text`, `Image` (expo-image)
- **Migration:** `expo-image` → Next.js `<Image>` or plain `<img>`.

### `PulsingAvatar.tsx`

- **Purpose:** Animated pulsing sparkle icon indicating AI thinking state
- **Props:** `isThinking`, `size`
- **RN-Specific:** `Animated` (loop, timing, interpolation)
- **Migration:** CSS `@keyframes` pulse + `animation-play-state`.

### `SideMenu.tsx` (438 lines)

- **Purpose:** Slide-in side menu with user profile, menu items, connected accounts management, sign out, delete account
- **Uses:** `useIntegrations` hook, `getCurrentUser()`, `supabase.auth.signOut()`
- **API Calls (via hook):** `GET /integrations`, `POST /integrations/connect`, `POST /integrations/disconnect`
- **RN-Specific:** `Modal`, `ScrollView`, `Alert`, `Linking`, `ActivityIndicator`
- **External:** `react-native-safe-area-context`
- **Migration:** `Modal` → off-canvas sidebar with Radix Dialog or CSS `transform: translateX`. `Alert` → confirm dialog. `useSafeAreaInsets` → remove.

### `StatusLogCard.tsx`

- **Purpose:** Shows AI tool execution step with status (loading spinner or checkmark animation)
- **Props:** `label`, `status`, `tool`, `minimal`
- **External:** `lottie-react-native`
- **Migration:** Lottie → `lottie-web` wrapper.

### `SwipeCard.tsx` (241 lines)

- **Purpose:** Draggable card with PanResponder — swipe right to approve, left to reject. Rotation + color interpolation.
- **Props:** `action: ActionItem`, `onSwipeRight`, `onSwipeLeft`
- **RN-Specific:** `PanResponder`, `Animated` (spring, interpolation, pan)
- **External:** `date-fns`
- **Migration:** HIGH COMPLEXITY. `PanResponder` → pointer events + Framer Motion `drag` with `dragConstraints`. Color interpolation → Framer Motion `useTransform`.

### `UpcomingMeetingCard.tsx`

- **Purpose:** Shows upcoming meeting with time-until-start, attendees summary, Join Now button
- **Props:** `meeting: UpcomingMeeting`, `onDismiss`
- **RN-Specific:** `View`, `Text`, `TouchableOpacity`, `Linking`
- **Migration:** Simple. `Linking.openURL` → `window.open`.

### `WebContainer.tsx`

- **Purpose:** Width-constraining wrapper for web platform (max 1024px, centered)
- **RN-Specific:** `Platform.OS` check, `View`
- **Migration:** NOT NEEDED. Use CSS `max-width` directly.

---

## 7. Screen Components (`screens/`)

### `ConnectPlatformsScreen.tsx` (522 lines)

- **Purpose:** Full platform management screen with search, grid of platform cards, connect/disconnect, paywall gate for PRO integrations
- **Props:** `connections`, `onConnect`, `onDisconnect`, `onBack`, `actionLabel`, `onAction`
- **RN-Specific:** `Modal`, `ScrollView`, `TextInput`, `Alert`, `SafeAreaView`
- **External:** `date-fns`, `react-native-safe-area-context`
- **Migration:** MEDIUM. Replace RN primitives with HTML. PaywallScreen inline modal → Radix Dialog.

### `EditActionScreen.tsx`

- **Purpose:** Form to edit action title and content/details with platform badge and AI hint
- **Props:** `initialTitle`, `initialDescription`, `platform`, `onSave`, `onCancel`, `isLoading`
- **RN-Specific:** `KeyboardAvoidingView`, `TextInput`, `SafeAreaView`, `Platform`
- **Migration:** Simple form with `<input>` and `<textarea>`.

### `ExecutionStatusScreen.tsx`

- **Purpose:** Read-only view of action execution status with metadata card
- **Props:** `action: ActionItem`, `onBack`
- **RN-Specific:** `ScrollView`, `View`, `Text`
- **Uses:** `Card` component, `PlatformIcon`
- **Migration:** Simple.

### `PaywallScreen.tsx` (437 lines)

- **Purpose:** Full paywall with monthly/annual plan cards, feature list, purchase button, restore button
- **Props:** `onClose`, `onSuccess`, `highlightTier`
- **Uses:** `useSubscription()` hook
- **RN-Specific:** `StatusBar`, `ScrollView`, `SafeAreaView`
- **Migration:** MEDIUM. RevenueCat purchase flow → Stripe Checkout. UI is standard.

---

## 8. App-Level Components

### `app/components/MarkdownText.tsx`

- **Purpose:** Custom markdown parser. Supports: `#/##/###` headers, `- ` bullet lists, `**bold**`, `[links](url)`, `@mentions`, `#hashtags`.
- **Implementation:** Regex-based line-by-line parsing, splits into `Text` elements with styles
- **RN-Specific:** `Text`, `Linking.openURL`
- **Migration:** Replace with `react-markdown` + `remark-gfm` or `@mdx-js/react`. Or keep custom parser with `<span>/<a>/<strong>`.

---

## 9. Services

### `services/api.ts` — Core API Client

- **Key Exports:** `api` object with `get()`, `post()`, `delete()`, `stream()`, `getConnections()`, `getBaseUrl()`
- **Auth:** Sends `Authorization: Bearer <supabase_jwt>` from `supabase.auth.getSession()`
- **Auto-logout:** On 401 or `USER_NOT_FOUND` → clears tokens + signs out
- **Timeout:** 30 seconds via `AbortController`
- **SSE Streaming:** `stream()` method reads `ReadableStream` chunks, parses `data:` lines
- **Base URL:** `process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api'`
- **RN-Specific:** None significant (uses standard `fetch`)
- **Migration:** Rename env var to `NEXT_PUBLIC_API_URL`. Otherwise largely portable. Can use for both client and server.

### `services/auth.ts` — Google OAuth

- **Key Exports:** `signInWithGoogle()`, `signOut()`, `getCurrentUser()`, `isSignedIn()`, `deleteAccount()`
- **OAuth Flow:** Uses `expo-auth-session` to build redirect URI → opens browser with `expo-web-browser` → extracts tokens from callback URL hash → calls `supabase.auth.setSession()`
- **RN-Specific:** `expo-auth-session`, `expo-web-browser`, `Platform`, `Linking`
- **Migration:** HIGH COMPLEXITY. Replace entire OAuth flow with Supabase's built-in `supabase.auth.signInWithOAuth({ provider: 'google' })` which handles redirects natively in browsers. Use `@supabase/ssr` package.

### `services/supabaseClient.ts`

- **Key Exports:** `supabase` client
- **Config:** URL and anon key from env vars with fallback defaults
- **Storage:** Uses `AsyncStorage` adapter
- **Migration:** Replace `AsyncStorage` with cookie-based storage via `@supabase/ssr`.

### `services/notifications.ts`

- **Key Exports:** `registerForPushNotifications()`, `sendLocalNotification()`, `useNotificationHandler()`, `scheduleDailyBriefing()`
- **RN-Specific:** `expo-notifications` (guarded import)
- **Migration:** Web Push API + Service Workers. Or remove initially and add later.

### `services/subscription.ts` (542 lines)

- **Key Exports:** `initializeRevenueCat()`, `identifyUser()`, `logoutUser()`, `getSubscriptionState()`, `getOfferings()`, `purchasePackage()`, `restorePurchases()`, `addSubscriptionListener()`, `canPerformAction()`, `canConnectIntegration()`, `isProUser()`
- **Types Exported:** `SubscriptionTier` (free/pro/business/enterprise), `SubscriptionLimits`, `SubscriptionState`, `PricingPackage`
- **Tier Limits:**
  - Free: 30 messages, 1 integration, Google Calendar only, no inbox/slack/teams
  - Pro: 500 messages, 5 integrations, multiple calendars, inbox, no slack/teams
  - Business: 2000 messages, 15 integrations, all features
  - Enterprise: unlimited
- **Product IDs:** `aariv_pro_monthly`, `aariv_pro_annual`, `aariv_business_monthly`, `aariv_business_annual`
- **Entitlements:** `aariv_pro`, `aariv_business`, `aariv_enterprise`
- **RN-Specific:** `react-native-purchases` (RevenueCat SDK), `Platform`
- **Migration:** HIGH COMPLEXITY. Replace RevenueCat entirely with Stripe (Checkout + Webhooks + Customer Portal). Tier limits logic is portable.

### `services/analytics.ts` (212 lines)

- **Key Exports:** `Analytics` class, `analytics` singleton
- **Providers:** ConsoleProvider (dev) and PostHogProvider
- **Events Tracked:** Screen views, platform connect/disconnect, chat sent/received, voice mode start/stop, zen mode actions, subscription changes, paywall views, highlight views/clicks, onboarding steps
- **RN-Specific:** None
- **Migration:** Portable. PostHog has a web SDK too.

### `services/backgroundSync.ts`

- **Key Exports:** `registerBackgroundSync()`, `unregisterBackgroundSync()`
- **RN-Specific:** `expo-background-fetch`, `expo-task-manager` (guarded imports)
- **API Calls:** `GET /inbox?userId=&filter=high_priority`, `GET /dashboard/briefing?userId=`
- **Migration:** Not applicable for web. Replace with Service Worker background sync or server-side cron. Or remove.

### `services/tokenManager.ts`

- **Key Exports:** `decodeToken()`, `isTokenExpired()`, `getStoredToken()`, `ensureValidToken()`, `storeToken()`, `storeGoogleIdToken()`, `clearTokens()`
- **RN-Specific:** `@react-native-async-storage/async-storage`, `jwt-decode`
- **Migration:** Replace `AsyncStorage` with cookies or `localStorage`. `jwt-decode` is universal.

---

## 10. Context / State Management

### `context/AuthContext.tsx`

- **Key Exports:** `useAuth()` hook (returns `{ user, isLoading, signOut }`), `AuthProvider`
- **Behavior:**
  - Listens to `supabase.auth.onAuthStateChange`
  - On SIGNED_IN: syncs with backend via `POST /auth/sync` (sends email, name, googleId, avatar)
  - Maps Supabase user → app `User` type
  - Tracks `onboardingStatus` (checked via `AsyncStorage`)
- **RN-Specific:** `AsyncStorage` for onboarding status persistence
- **Migration:** Replace `AsyncStorage` → cookies or `localStorage`. Supabase auth listener works identically. Consider moving auth check to middleware.

### `context/ThemeContext.tsx`

- **Key Exports:** `useTheme()` hook (returns `{ theme, isDark, colors, toggleTheme, setTheme }`), `ThemeProvider`
- **Behavior:** Persists theme preference to `AsyncStorage`. Merges light/dark color schemes.
- **Color Merge:** Deep merges `light/dark` theme colors with `shared` colors (neutral, primary, semantic, action, platforms)
- **RN-Specific:** `AsyncStorage`, `useColorScheme()` from `react-native`
- **Migration:** `AsyncStorage` → `localStorage` or cookie. `useColorScheme` → `window.matchMedia('(prefers-color-scheme: dark)')`. Consider `next-themes` package.

---

## 11. Hooks

### `hooks/useIntegrations.ts`

- **Key Exports:** `useIntegrations(userId)` → `{ integrations, loading, refetch, connectIntegration, disconnectIntegration }`
- **Interface:** `Integration { id, appName, status, email, createdAt }`
- **API Calls:** `GET /integrations?userId=`, `POST /integrations/connect { userId, appName }`, `POST /integrations/disconnect { connectionId }`
- **RN-Specific:** None
- **Migration:** Fully portable. Consider SWR or React Query wrapper.

### `hooks/useSubscription.tsx` (284 lines)

- **Key Exports:** `SubscriptionProvider`, `useSubscription()` hook
- **Context Value:**
  - State: `subscription`, `usage`, `isLoading`, `offerings`
  - Computed: `tier`, `limits`, `isPro`, `isBusiness`, `isEnterprise`, `isPaid`
  - Actions: `purchase()`, `restore()`, `refreshSubscription()`, `updateUsage()`
  - Permission Checks: `canSendMessage()`, `canConnectApp()`, `canAccessFeature()`, `canConnectIntegration()`
- **Usage Tracking:** Messages used, apps connected, reset date (monthly)
- **RN-Specific:** `react-native-purchases` (RevenueCat)
- **Migration:** HIGH. Replace RevenueCat purchase/restore with Stripe API calls. Permission check logic is portable.

---

## 12. Theme System

### Token Structure

```typescript
// theme/colors.ts
colors = {
  primary: { 50-900, gradient },  // Slate-blue #8b95b0
  neutral: { 50-950 },            // Warm gray tones
  dark: { background, surface, surfaceElevated, text, textSecondary, textTertiary, border },
  light: { background, surface, surfaceElevated, text, textSecondary, textTertiary, border },
  semantic: { success, warning, error, info },
  action: { approve, reject, pending },
  platforms: { gmail, calendar, slack, notion, linear, discord, maps, github, twitter },
}

// theme/spacing.ts
spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96 }
borderRadius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 }
shadows = { sm, md, lg }  // RN shadow properties

// theme/typography.ts
fontFamily = { primary: 'System', mono: 'monospace' }
fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 }
lineHeight = { tight: 1.2, normal: 1.5, relaxed: 1.75 }
fontWeight = { normal: '400', medium: '500', semibold: '600', bold: '700' }
textStyles = { h1, h2, h3, h4, body, bodySmall, caption, button }
```

### Migration Strategy

- **Option A (Tailwind CSS):** Map tokens → `tailwind.config.js` `extend` section. Colors, spacing, borderRadius, typography all map cleanly.
- **Option B (CSS Variables):** Convert to CSS custom properties: `--color-primary-500`, `--spacing-4`, etc.
- **Shadows:** RN `shadowColor/shadowOffset/shadowOpacity/shadowRadius` → CSS `box-shadow`.
- **textStyles:** Convert to Tailwind `@apply` rules or CSS classes.

---

## 13. Types / Interfaces

### `types/index.ts` — Core Types

```typescript
type Platform = string;

interface PlatformConnection {
  id: string;
  platform: Platform;
  name: string;
  connected: boolean;
  connectedAt?: Date;
  lastSync?: Date;
  logo?: string;
  isPro?: boolean;
}

interface ActionItem {
  id: string;
  type:
    | "email"
    | "calendar"
    | "slack"
    | "notion"
    | "linear"
    | "discord"
    | "maps";
  platform: Platform;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "executed" | "expired";
  priority: "high" | "medium" | "low";
  proposedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: Array<{ name: string; email: string; responseStatus: string }>;
  meetingLink?: string;
  isAllDay?: boolean;
  source: string;
}

interface InboxItem {
  id: string;
  type: "email" | "message" | "notification";
  from: string;
  subject: string;
  preview: string;
  receivedAt: Date;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  platform: Platform;
  actionRequired: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  subscriptionTier?: string;
}

interface AuthAction {
  type: "connect_app";
  appName: string;
  description: string;
  redirectUrl: string;
}
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}
```

### `types/chat.ts` — Chat Message Types

```typescript
interface UserMessage {
  id: string;
  role: "user";
  content: string;
  timestamp: Date;
}
interface AssistantMessage {
  id: string;
  role: "assistant";
  content: string;
  timestamp: Date;
  tone?: "calm" | "proactive" | "urgent";
  followUp?: string;
  suggestions?: string[];
}
interface SystemMessage {
  id: string;
  role: "system";
  content: string;
  timestamp: Date;
}
interface ToolExecutionMessage {
  id: string;
  role: "tool";
  toolName: string;
  status: "running" | "completed" | "failed";
  result?: any;
}
interface DebugMessage {
  id: string;
  role: "debug";
  content: string;
  level: "info" | "warn" | "error";
}
type SuggestedAction = { label: string; action: string; icon?: string };
```

### `types/subscription.ts`

```typescript
interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}
interface SubscriptionPlan {
  id: string;
  name: string;
  planName: "Breeze" | "Flow" | "Zen";
  price: number;
  period: "monthly" | "annual";
  features: SubscriptionFeature[];
  highlighted?: boolean;
}
```

### Migration

Types are 100% portable — no RN dependency.

---

## 14. API Endpoints Inventory

| Method | Endpoint                              | Used In                               | Purpose                                                        |
| ------ | ------------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| POST   | `/auth/sync`                          | AuthContext                           | Sync user profile on sign-in                                   |
| POST   | `/chat`                               | assistant.tsx                         | SSE streaming chat (events: log, auth_required, result, error) |
| GET    | `/notifications/{userId}`             | assistant.tsx                         | SSE stream for proactive AI summaries                          |
| GET    | `/calendar?userId=&timeMin=&timeMax=` | calendar.tsx                          | Fetch calendar events                                          |
| GET    | `/dashboard/briefing?userId=`         | zen-mode.tsx, backgroundSync          | Get daily briefing actions                                     |
| POST   | `/actions/execute`                    | zen-mode, edit-action                 | Execute or save-draft an action                                |
| GET    | `/toolkits?userId=`                   | toolkits.tsx, connect-platforms       | List available toolkits                                        |
| GET    | `/toolkits/bundles`                   | toolkits.tsx                          | Get toolkit bundles                                            |
| GET    | `/integrations?userId=`               | useIntegrations hook                  | List user integrations                                         |
| POST   | `/integrations/connect`               | onboarding, useIntegrations, SideMenu | Initiate OAuth connection                                      |
| POST   | `/integrations/disconnect`            | useIntegrations, SideMenu             | Remove integration                                             |
| DELETE | `/auth/account`                       | SideMenu, settings                    | Delete user account                                            |
| POST   | `/voice`                              | voice-mode.tsx                        | Send audio, get response (FormData)                            |
| GET    | `/inbox?userId=&filter=`              | backgroundSync                        | Background sync inbox items                                    |
| GET    | `/chat/connections?userId=`           | api.ts                                | Get user connections for chat context                          |

---

## 15. External Dependencies Inventory

### Must Replace for Web

| Package                                     | Usage                | Web Replacement                    |
| ------------------------------------------- | -------------------- | ---------------------------------- |
| `react-native`                              | All UI primitives    | HTML/CSS + React                   |
| `expo-router`                               | File-based routing   | Next.js App Router                 |
| `expo-font`                                 | Font loading         | CSS `@font-face` / `next/font`     |
| `expo-splash-screen`                        | Splash screen        | Loading state / CSS                |
| `expo-auth-session`                         | OAuth redirect URI   | Supabase built-in OAuth            |
| `expo-web-browser`                          | OAuth browser popup  | `window.open()` / redirect         |
| `expo-notifications`                        | Push notifications   | Web Push API                       |
| `expo-background-fetch`                     | Background sync      | Service Worker / cron              |
| `expo-task-manager`                         | Task scheduling      | Service Worker                     |
| `expo-av`                                   | Audio record/play    | MediaRecorder + Web Audio          |
| `expo-haptics`                              | Haptic feedback      | Vibration API or remove            |
| `expo-linear-gradient`                      | Gradient backgrounds | CSS `linear-gradient`              |
| `expo-image`                                | Optimized images     | `next/image`                       |
| `react-native-purchases`                    | RevenueCat IAP       | Stripe / LemonSqueezy              |
| `react-native-safe-area-context`            | Safe area insets     | Not needed on web                  |
| `@react-native-async-storage/async-storage` | Key-value storage    | `localStorage` / cookies           |
| `@expo/vector-icons`                        | Icon sets            | `lucide-react` / `react-icons`     |
| `lottie-react-native`                       | Lottie animations    | `@lottiefiles/react-lottie-player` |
| `react-native-reanimated`                   | Animations           | Framer Motion / CSS                |

### Can Keep / Portable

| Package                  | Notes                           |
| ------------------------ | ------------------------------- |
| `@supabase/supabase-js`  | Use `@supabase/ssr` for Next.js |
| `date-fns`               | Fully portable                  |
| `jwt-decode`             | Fully portable                  |
| `posthog-js`             | Use web SDK                     |
| `@vercel/speed-insights` | Has Next.js integration         |

---

## 16. React Native–Specific APIs to Replace

### UI Primitives

| RN Component           | Web Replacement                                                |
| ---------------------- | -------------------------------------------------------------- |
| `View`                 | `<div>`                                                        |
| `Text`                 | `<p>`, `<span>`, `<h1>`-`<h6>`                                 |
| `TouchableOpacity`     | `<button>` with `hover:opacity`                                |
| `ScrollView`           | `<div>` with `overflow-y: auto`                                |
| `FlatList`             | `<div>` with `.map()` (virtualized: `@tanstack/react-virtual`) |
| `TextInput`            | `<input>` / `<textarea>`                                       |
| `Modal`                | Radix Dialog / Headless UI Dialog                              |
| `Switch`               | `<input type="checkbox">` or Radix Switch                      |
| `Alert.alert()`        | `window.confirm()` / toast / Radix AlertDialog                 |
| `ActivityIndicator`    | CSS spinner or Lucide `Loader2`                                |
| `StatusBar`            | `<meta name="theme-color">`                                    |
| `KeyboardAvoidingView` | Not needed on web                                              |
| `SafeAreaView`         | Not needed on web                                              |
| `RefreshControl`       | Pull-to-refresh button or SWR's `mutate()`                     |
| `Dimensions.get()`     | CSS media queries / `useMediaQuery`                            |

### Animations

| RN API                 | Web Replacement                            |
| ---------------------- | ------------------------------------------ |
| `Animated.Value`       | Framer Motion `useMotionValue`             |
| `Animated.timing`      | Framer Motion `animate` or CSS transitions |
| `Animated.spring`      | Framer Motion spring                       |
| `Animated.loop`        | CSS `@keyframes` with `infinite`           |
| `PanResponder`         | Pointer events + Framer Motion `drag`      |
| `Animated.interpolate` | Framer Motion `useTransform`               |

### Platform APIs

| RN API                 | Web Replacement                                     |
| ---------------------- | --------------------------------------------------- |
| `Platform.OS`          | User agent detection or remove                      |
| `Linking.openURL()`    | `window.open()`                                     |
| `Linking.canOpenURL()` | Not needed                                          |
| `Keyboard.dismiss()`   | `document.activeElement.blur()`                     |
| `useColorScheme()`     | `window.matchMedia('(prefers-color-scheme: dark)')` |

---

## 17. Migration Complexity Assessment

### By Screen — Effort Levels

| Screen                | Complexity | Key Challenges                                |
| --------------------- | ---------- | --------------------------------------------- |
| `login`               | LOW        | Replace gradient, OAuth flow                  |
| `onboarding`          | MEDIUM     | Horizontal carousel, OAuth connect            |
| `(tabs)/index` (Home) | LOW        | Floating animation                            |
| `(tabs)/assistant`    | **HIGH**   | SSE streaming, chat UI, markdown, status logs |
| `(tabs)/calendar`     | LOW-MEDIUM | Timeline layout, API call                     |
| `(tabs)/inbox`        | LOW        | Mock data, simple cards                       |
| `(tabs)/settings`     | LOW        | Switches, toggles                             |
| `toolkits`            | MEDIUM     | Modal, search, permissions                    |
| `voice-mode`          | **HIGH**   | Audio recording/playback, pulse animation     |
| `zen-mode`            | **HIGH**   | Swipe gestures, pan animations                |
| `paywall`             | MEDIUM     | Stripe integration replacement                |
| `event-detail`        | LOW        | Static detail view                            |
| `edit-action`         | LOW        | Form with inputs                              |
| `action-status`       | LOW        | Status display                                |
| Legal pages           | LOW        | Static content                                |

### Recommended Migration Order

1. **Phase 1 — Foundation:** Layout, theme (Tailwind config), auth (Supabase SSR), API client, types
2. **Phase 2 — Simple screens:** Login, legal pages, settings, event-detail, action-status, edit-action
3. **Phase 3 — Core tabs:** Home, Calendar, Inbox (Review), Connect Platforms
4. **Phase 4 — Complex features:** Assistant (chat + SSE), Toolkits
5. **Phase 5 — Advanced:** Zen Mode (swipe), Voice Mode (audio), Paywall (Stripe)
6. **Phase 6 — Polish:** Notifications (Web Push), Background Sync, Analytics, Onboarding overlay

### Critical Decision Points

1. **Styling:** Tailwind CSS recommended (most direct mapping from current token system)
2. **Animation:** Framer Motion (handles all current animation patterns)
3. **Payments:** Stripe Checkout + webhooks (replaces RevenueCat entirely)
4. **Auth:** `@supabase/ssr` + Next.js middleware (replaces expo-auth-session)
5. **State:** Keep React Context or upgrade to Zustand (lighter, no provider nesting needed)
6. **Data Fetching:** SWR or React Query (replaces manual `useEffect` + `useState` patterns)
7. **Icons:** `lucide-react` (clean, tree-shakeable, covers most Ionicons used)

---

_Generated from comprehensive codebase analysis of all frontend files._
| `RefreshControl` | Pull-to-refresh button or SWR's `mutate()` |
| `Dimensions.get()` | CSS media queries / `useMediaQuery` |

### Animations

| RN API | Web Replacement |
|---|---|
| `Animated.Value` | Framer Motion `useMotionValue` |
| `Animated.timing` | Framer Motion `animate` or CSS transitions |
| `Animated.spring` | Framer Motion spring |
| `Animated.loop` | CSS `@keyframes` with `infinite` |
| `PanResponder` | Pointer events + Framer Motion `drag` |
| `Animated.interpolate` | Framer Motion `useTransform` |

### Platform APIs

| RN API | Web Replacement |
|---|---|
| `Platform.OS` | User agent detection or remove |
| `Linking.openURL()` | `window.open()` |
| `Linking.canOpenURL()` | Not needed |
| `Keyboard.dismiss()` | `document.activeElement.blur()` |
| `useColorScheme()` | `window.matchMedia('(prefers-color-scheme: dark)')` |

---

## 17. Migration Complexity Assessment

### By Screen — Effort Levels

| Screen | Complexity | Key Challenges |
|---|---|---|
| `login` | LOW | Replace gradient, OAuth flow |
| `onboarding` | MEDIUM | Horizontal carousel, OAuth connect |
| `(tabs)/index` (Home) | LOW | Floating animation |
| `(tabs)/assistant` | **HIGH** | SSE streaming, chat UI, markdown, status logs |
| `(tabs)/calendar` | LOW-MEDIUM | Timeline layout, API call |
| `(tabs)/inbox` | LOW | Mock data, simple cards |
| `(tabs)/settings` | LOW | Switches, toggles |
| `toolkits` | MEDIUM | Modal, search, permissions |
| `voice-mode` | **HIGH** | Audio recording/playback, pulse animation |
| `zen-mode` | **HIGH** | Swipe gestures, pan animations |
| `paywall` | MEDIUM | Stripe integration replacement |
| `event-detail` | LOW | Static detail view |
| `edit-action` | LOW | Form with inputs |
| `action-status` | LOW | Status display |
| Legal pages | LOW | Static content |

### Recommended Migration Order

1. **Phase 1 — Foundation:** Layout, theme (Tailwind config), auth (Supabase SSR), API client, types
2. **Phase 2 — Simple screens:** Login, legal pages, settings, event-detail, action-status, edit-action
3. **Phase 3 — Core tabs:** Home, Calendar, Inbox (Review), Connect Platforms
4. **Phase 4 — Complex features:** Assistant (chat + SSE), Toolkits
5. **Phase 5 — Advanced:** Zen Mode (swipe), Voice Mode (audio), Paywall (Stripe)
6. **Phase 6 — Polish:** Notifications (Web Push), Background Sync, Analytics, Onboarding overlay

### Critical Decision Points

1. **Styling:** Tailwind CSS recommended (most direct mapping from current token system)
2. **Animation:** Framer Motion (handles all current animation patterns)
3. **Payments:** Stripe Checkout + webhooks (replaces RevenueCat entirely)
4. **Auth:** `@supabase/ssr` + Next.js middleware (replaces expo-auth-session)
5. **State:** Keep React Context or upgrade to Zustand (lighter, no provider nesting needed)
6. **Data Fetching:** SWR or React Query (replaces manual `useEffect` + `useState` patterns)
7. **Icons:** `lucide-react` (clean, tree-shakeable, covers most Ionicons used)

---

*Generated from comprehensive codebase analysis of all frontend files.*
