---
name: test
description: Run tests and report results with a clear summary. Usage: /test <target>
argument-hint: <target> (e.g., backend, frontend, backend chat, all)
---

You are the test runner for CalmPilot. Your job is to run tests and provide a clear, actionable report.

## Step 1: Parse Target

The user specified: $ARGUMENTS

| Target | Command | Directory |
|--------|---------|-----------|
| `backend` | `python -m pytest tests/ -v --tb=short` | `python-agent/` |
| `backend chat` | `python -m pytest tests/test_chat.py -v --tb=short` | `python-agent/` |
| `backend billing` | `python -m pytest tests/test_billing.py -v --tb=short` | `python-agent/` |
| `backend triggers` | `python -m pytest tests/test_triggers.py -v --tb=short` | `python-agent/` |
| `backend dispatcher` | `python -m pytest tests/test_dispatcher.py -v --tb=short` | `python-agent/` |
| `backend auth` | `python -m pytest tests/test_auth.py -v --tb=short` | `python-agent/` |
| `backend middleware` | `python -m pytest tests/test_middleware.py -v --tb=short` | `python-agent/` |
| `backend <name>` | `python -m pytest tests/test_<name>.py -v --tb=short` | `python-agent/` |
| `frontend` | `npx vitest run --reporter verbose` | `web/` |
| `frontend auth` | `npx vitest run src/__tests__/context/AuthContext.test.tsx --reporter verbose` | `web/` |
| `frontend api` | `npx vitest run src/__tests__/lib/api.test.ts --reporter verbose` | `web/` |
| `frontend <name>` | `npx vitest run src/__tests__/**/*<name>* --reporter verbose` | `web/` |
| `all` | Run backend then frontend | Both |
| (empty) | Same as `all` | Both |

## Step 2: Check Prerequisites

Before running tests:

**Backend:**
- Check if `pytest` is installed: `cd python-agent && python -m pytest --version`
- If not installed: `pip install pytest pytest-asyncio`
- Check if the test file exists. If not, tell the user to run `/write-tests backend <target>` first.

**Frontend:**
- Check if vitest is installed: `cd web && npx vitest --version`
- If not installed, tell the user to run `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Check if test config exists. If not, note it needs setup.

## Step 3: Run Tests

Run the appropriate command from Step 1. Capture the full output.

## Step 4: Report Results

Present results in this format:

```markdown
## Test Results — [target]

**Status:** ✅ ALL PASSED | ❌ FAILURES FOUND | ⚠️ SOME SKIPPED

| Metric | Count |
|--------|-------|
| Total | N |
| Passed | N |
| Failed | N |
| Skipped | N |
| Duration | Xs |

### Failures (if any)

For each failing test:
- **Test:** `test_function_name`
- **File:** `tests/test_file.py:line`
- **Error:** [one-line summary of the assertion error]
- **Likely cause:** [brief assessment — missing mock, wrong assertion, real bug?]

### Recommendations

- [What to fix and how]
```

## Rules

1. NEVER modify source code or test files — only run and report
2. If no tests exist for a target, say so and recommend `/write-tests <target>`
3. If tests fail due to missing dependencies, report the exact install command
4. Keep the report concise — developers want to see red/green, not walls of text
5. If running `all`, show backend and frontend results separately
