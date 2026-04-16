---
name: write-tests
description: Generate tests for CalmPilot backend or frontend code. Usage: /write-tests <target>
argument-hint: <target> (e.g., backend chat, backend billing, backend triggers, frontend auth, frontend api)
---

You are a test engineer for CalmPilot. Your job is to read source code and write comprehensive, practical tests.

## Step 1: Parse Target

The user specified: $ARGUMENTS

Match the target to the table below. If no target or unrecognized, show available targets and ask.

### Backend Targets (pytest)

| Target | Source File | Test File |
|--------|-----------|-----------|
| `backend chat` | `python-agent/routers/chat.py` | `python-agent/tests/test_chat.py` |
| `backend dashboard` | `python-agent/routers/dashboard.py` | `python-agent/tests/test_dashboard.py` |
| `backend integrations` | `python-agent/routers/integrations.py` | `python-agent/tests/test_integrations.py` |
| `backend billing` | `python-agent/routers/billing.py` | `python-agent/tests/test_billing.py` |
| `backend triggers` | `python-agent/routers/app_triggers.py` | `python-agent/tests/test_triggers.py` |
| `backend auth` | `python-agent/routers/auth.py` | `python-agent/tests/test_auth.py` |
| `backend review` | `python-agent/routers/review.py` | `python-agent/tests/test_review.py` |
| `backend history` | `python-agent/routers/history.py` | `python-agent/tests/test_history.py` |
| `backend calendar` | `python-agent/routers/calendar.py` | `python-agent/tests/test_calendar.py` |
| `backend actions` | `python-agent/routers/actions.py` | `python-agent/tests/test_actions.py` |
| `backend middleware` | `python-agent/middleware.py` | `python-agent/tests/test_middleware.py` |
| `backend dispatcher` | `python-agent/triggers.py` | `python-agent/tests/test_dispatcher.py` |
| `backend notifications` | `python-agent/config.py` | `python-agent/tests/test_notifications.py` |
| `backend all` | All routers + core | All test files |

### Frontend Targets (vitest or jest)

| Target | Source File | Test File |
|--------|-----------|-----------|
| `frontend auth` | `web/src/context/AuthContext.tsx` | `web/src/__tests__/context/AuthContext.test.tsx` |
| `frontend billing` | `web/src/context/useBilling.tsx` | `web/src/__tests__/context/useBilling.test.tsx` |
| `frontend api` | `web/src/lib/api.ts` | `web/src/__tests__/lib/api.test.ts` |
| `frontend utils` | `web/src/lib/utils.ts`, `web/src/lib/analytics.ts` | `web/src/__tests__/lib/utils.test.ts` |
| `frontend all` | All contexts + libs | All test files |

## Step 2: Read Source Code

Read the source file(s) for the matched target. Understand:
- All functions/methods and their signatures
- What each function does (input → output)
- External dependencies (Supabase, Composio, OpenAI) — these need mocking
- Error cases and edge cases
- Authentication requirements
- Rate limiting

## Step 3: Check Existing Test Infrastructure

Before writing tests, check:

**Backend:**
- Does `python-agent/tests/conftest.py` exist? If not, create it with shared fixtures.
- Is `pytest` in `requirements.txt` or `requirements.in`? If not, note it needs to be added.
- Does `python-agent/tests/__init__.py` exist? Create if not.

**Frontend:**
- Is a test runner configured? Check `web/package.json` for `vitest`, `jest`, or `@testing-library/react`.
- Does a test config exist? (`vitest.config.ts`, `jest.config.js`)
- If no test runner exists, recommend adding vitest (simpler with Vite/Next.js).

## Step 4: Write Tests

### Backend Test Style (pytest)

Use these patterns:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient

# For async endpoint tests
@pytest.mark.asyncio
async def test_endpoint_name():
    """Test description of what this verifies."""
    # Arrange — set up mocks and test data
    # Act — call the endpoint
    # Assert — verify the response
```

**Mocking rules:**
- Mock ALL external services: Supabase, Composio, OpenAI — never hit real APIs
- Mock at the boundary: `@patch("routers.chat.supabase")` not deep internals
- Use `AsyncMock` for async functions
- Create fixtures in `conftest.py` for shared mocks (auth user, supabase client)

**What to test per endpoint:**
1. **Happy path** — valid request returns expected response
2. **Auth required** — request without token returns 401
3. **Invalid input** — bad request body returns 422
4. **Not found** — missing resource returns 404
5. **Rate limited** — exceeded rate limit returns 429
6. **Quota exceeded** — over tier limit returns 402/403
7. **Error handling** — external service failure returns 500 with clean error

### Frontend Test Style (vitest + testing-library)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange + Act
    render(<Component />);
    // Assert
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
```

**What to test:**
- Context providers: values provided, state changes
- API client: correct headers, error handling, auth injection
- Utility functions: pure function input/output

## Step 5: Create conftest.py (Backend) — if it doesn't exist

Write `python-agent/tests/conftest.py` with these shared fixtures:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_user():
    """Authenticated user fixture."""
    return {"userId": "test-user-123", "email": "test@example.com", "name": "Test User"}


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock = MagicMock()
    mock.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    return mock


@pytest.fixture
def mock_composio():
    """Mock Composio client."""
    return MagicMock()


@pytest.fixture
def auth_headers():
    """Auth headers for protected endpoints."""
    return {"Authorization": "Bearer test-jwt-token"}
```

## Step 6: Write and Commit

1. Create `python-agent/tests/__init__.py` if it doesn't exist
2. Create `conftest.py` if it doesn't exist
3. Write the test file(s)
4. Commit with message: `test: add tests for <target>`

## Step 7: Run Tests

After writing, run the tests:

**Backend:**
```bash
cd python-agent && python -m pytest tests/<test_file>.py -v
```

**Frontend:**
```bash
cd web && npx vitest run src/__tests__/<test_file> --reporter verbose
```

If tests fail due to import errors or missing dependencies, fix the test (not the source code). Report any tests that can't pass without real infrastructure.

## Rules

1. NEVER modify source code — only write test files and conftest
2. Mock ALL external services — tests must run offline with no API keys
3. Each test function tests ONE behavior — name it clearly
4. Use descriptive test names: `test_chat_returns_401_without_auth` not `test_chat_1`
5. Include both happy path AND error cases
6. Tests should be fast — no sleeps, no real HTTP calls
7. If `backend all` or `frontend all`, write tests for every target in order
8. Add `pytest` to requirements if not present, add `vitest` + `@testing-library/react` to package.json if not present
