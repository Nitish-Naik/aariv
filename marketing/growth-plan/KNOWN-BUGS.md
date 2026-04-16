# Known Bugs — Track and Fix

## Bug 1: "Review details" from dashboard resets assistant
**Severity:** Medium
**Steps:** Click "Review details" on a briefing item → assistant loads → prompt shows → "Processing" → resets to empty state
**Cause:** Either stream fails (tool call timeout) or component re-renders during streaming
**Fix needed:** Investigate chat.py logs when this prompt runs — likely the Gmail tool call fails or times out
**Impact:** Only affects users clicking review items from dashboard
**Status:** Open

## Bug 2: Calendar shows "You're free today" when not connected
**Severity:** Low
**Status:** FIXED — ActiveState now passes calendarConnected prop

## Bug 3: New user signup 503
**Severity:** Critical
**Status:** FIXED — auto-create profile in middleware

## Bug 4: Gmail bootstrap returns 0 emails
**Severity:** High
**Status:** FIXED — label_ids param was string instead of list
