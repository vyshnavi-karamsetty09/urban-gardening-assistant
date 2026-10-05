# Garden Guide — Final Engineering Verification

Date: 2026-10-05

## Scope
Final engineering pass focused on Settings persistence/synchronization, Garden AI intent/context handling and in-flight request persistence, plus a project-wide regression/static audit.

## Implemented

### Settings
- Partial profile updates no longer overwrite `User.name`, `firstName`, or `lastName` unless those fields were explicitly submitted.
- Nested notification and preference updates preserve unspecified existing values.
- Settings treats successful PUT responses as authoritative instead of immediately re-fetching `/me` and risking stale overwrite.
- Settings loading is protected against an initial-load race overwriting a newer save.
- Profile updates propagate through the authenticated App session to Topbar and other pages.
- Environment saves are server-verified against the submitted core fields.
- Six Settings options render as one integrated navigation surface with hover/focus/active affordances.

### Garden AI
- Added a module-level request manager so an in-flight assistant request survives SPA page unmount/remount.
- Pending requests are persisted per authenticated user and completed responses are written back to the same user-scoped conversation.
- Generic questions no longer automatically bind to a saved plant.
- `which/what rose?` is treated as ambiguous and asks for clarification.
- Rose type-list questions are distinct from rose-suitability/recommendation questions.
- Assistant prompt receives relevant context only and supports a real OpenAI-compatible/Gemini provider when configured server-side.
- Local Garden Guide fallback remains available when a provider is unavailable.
- Profile, garden inventory, environment, and common gardening topics have deterministic fallback handling.
- Clear-chat cancels local pending message state without aborting ordinary navigation-sensitive requests.
- User data used by a pending fallback is snapshotted at request creation to avoid cross-account context after logout/login changes.

## Verification Results

- `node scripts/audit.mjs`: **101/101 passed**
- Server JavaScript `node --check`: **passed for all server JS files**
- JavaScript/JSX/MJS transpile syntax check with TypeScript: **55 files, 0 errors**
- AI behavior regression harness: **passed**
  - `hi` → conversation
  - `what is my name` → profile-name
  - `types of roses` → rose-types
  - `which type of rose is suitable for my garden?` → rose-recommendation
  - `which rose?` → rose-clarification
  - bare rose query does not resolve to a saved plant
  - contextual follow-up topic resolution verified
- Assistant request-manager harness: **passed**
  - pending message is persisted
  - completed response is persisted after promise resolution
  - duplicate request IDs are deduplicated
  - explicit cancel removes pending local record
- Profile-update behavior harness: **passed**
  - partial notification update preserves custom name
  - partial preferences update preserves custom name and unrelated preferences
  - explicit profile name update works
- Final ZIP integrity/source structure checks: **passed after packaging**.

## Not Verified in This Environment

- `npm run lint` could not be completed because the isolated environment did not have the full npm dependency set cached and network installation was unavailable.
- `npm run build` could not be completed for the same dependency-installation limitation.
- Full browser click-through/E2E testing could not be performed in this environment.

These limitations are not represented as passing results.

## Final Package

Final deployment archive created after the verification pass. The archive is intentionally built without `.env`, `node_modules`, `dist`, `.git`, or log files.
