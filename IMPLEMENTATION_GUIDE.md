# Implementation Guide

## Analytics Integration

The analytics service has been added to `/workspaces/aariv/services/analytics.ts`. To start tracking events:

### 1. Import and use analytics
```typescript
import { analytics } from '../services/analytics';

// Track generic events
analytics.track('Button Clicked', { buttonName: 'Submit' }, userId);

// Use convenience methods
analytics.trackPlatformConnected('Gmail', userId);
analytics.trackActionApproved('email_draft', userId);
analytics.trackScreenView('Dashboard', userId);
```

### 2. Setup in auth flow
Add to `services/auth.ts`:
```typescript
import { analytics } from './analytics';

export const signInWithGoogle = async (idToken: string) => {
  // ... existing code ...
  await analytics.identify(user.id, {
    email: user.email,
    name: user.name,
  });
  // ... existing code ...
};

export const signOut = async () => {
  analytics.reset();
  // ... existing code ...
};
```

### 3. Production setup (PostHog, Segment, etc.)
Install your analytics provider:
```bash
npm install posthog-react-native
# or
npm install @segment/analytics-react-native
```

Create custom provider and set it:
```typescript
import { analytics, PostHogProvider } from './services/analytics';

// In app initialization
analytics.setProvider(new PostHogProvider('your-api-key'));
```

## Subscription Middleware

Use in protected routes:

```typescript
import { checkSubscription, requirePro } from '../middleware/subscription';

// Check subscription tier (attaches req.user)
router.post('/premium-feature', checkSubscription, requirePro, handler);

// Or check manually in controller
router.post('/action', checkSubscription, (req: SubscriptionRequest, res) => {
  if (!req.user?.isPro) {
    return res.status(403).json({ error: 'Pro required' });
  }
  // ... handler logic
});
```

## Rate Limiting

Rate limiters are already applied globally. To customize:

```typescript
import { createRateLimiter } from '../middleware/rateLimiter';

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests
  keyGenerator: (req) => req.body.userId, // Custom key
});

router.post('/expensive-operation', customLimiter, handler);
```

## Error Boundary

Already integrated in `app/_layout.tsx`. To add custom error handling:

```typescript
<ErrorBoundary 
  onError={(error, errorInfo) => {
    analytics.track('App Error', {
      error: error.message,
      stack: error.stack,
    });
  }}
>
  <YourApp />
</ErrorBoundary>
```

## Background Sync Enhancement

To integrate analytics in background sync, update `services/backgroundSync.ts`:

```typescript
import { analytics } from './analytics';

TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  // ... existing code ...
  
  analytics.track('Background Sync Completed', {
    messageCount,
    actionCount,
  });
  
  return BackgroundFetch.BackgroundFetchResult.NewData;
});
```
