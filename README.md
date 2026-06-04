# Deal Management Dashboard — Partner Portal

A production-style Deal Management Dashboard for the Partner Portal.

## Quick Start

```bash
npm install
npm run dev       # Dev server with MSW (Mock Service Worker)
npm run test      # Run unit tests (vitest)
npm run test:watch  # Watch mode
npm run build     # Production build (type-check + vite build)
npm audit         # Dependency vulnerability scan (run before deploy)
```

## Architecture

```
src/
├── types/          # Shared TypeScript interfaces (deals.types.ts)
├── constants/      # Named constants by domain: api, cache, http, pagination, storage, smartTags
├── mocks/          # MSW handlers + seeded faker data (120 deals)
├── services/       # Axios client (retry + backoff), deals API wrapper, LRU cache
├── stores/         # Pinia stores: auth, deals, ui — all Composition API style with $reset()
├── composables/    # Feature hooks: useSearch, useFilters, usePagination, useRealtime, useAuth
├── utils/          # Pure functions: deduplication, formatters, sanitize, smartTags
├── components/
│   ├── ui/         # Atomic, reusable: AppButton, AppBadge, AppInput, AppCheckbox
│   ├── deals/      # Domain components: DealTable, DealCard, DealDetailPanel, DealFilters, DealSearch, DealStatusBadge
│   ├── layout/     # AppLayout, AppHeader, LanguageSwitcher, RoleSwitcher
│   └── common/     # LoadingState, ErrorState, EmptyState, ErrorBoundary
├── views/          # Route-level pages: DealsListView, AdminView
├── router/         # routes.ts (ROUTE_NAMES constants), guards.ts, index.ts
├── locales/        # en, de, ja, es, zh JSON translation files
└── i18n.ts         # vue-i18n v9 Composition API setup, locale persisted to localStorage
```

## Responsive Design

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Card-based deal list, stacked toolbar |
| 768px–1280px (tablet) | Table view, collapsible filter sidebar |
| > 1280px (desktop) | Full table + persistent sidebar when filters open |

Implemented via Tailwind CSS `md:` breakpoint — no JS-based breakpoint detection. The `DealTable` component renders `<DealCard>` on mobile (`md:hidden`) and a sortable table on larger screens (`hidden md:block`).

## i18n Strategy

- **Runtime**: `vue-i18n` v9 with Composition API (`useI18n()`)
- **Locales**: `en`, `de`, `ja`, `es`, `zh` — all messages translated at build time
- **Number/Date formatting**: `Intl.NumberFormat` and `Intl.DateTimeFormat` for locale-aware currency and dates; no external library dependency
- **Locale switching**: instant via reactive `locale` ref — no page reload required
- **Fallback**: `en` for any missing keys

## State Management

Pinia (Composition API style) with three stores:
- `auth.store` — current user, role, user switching
- `deals.store` — deals list, filters, search, sort, pagination, loading/error state
- `ui.store` — filter sidebar visibility

Stores are lean; business logic lives in composables that coordinate multiple stores.

## Deduplication Strategy

The dashboard deduplicates deals at every data ingestion point: initial load, page navigation, and real-time polling.

**Algorithm** (`src/utils/deduplication.ts`):
1. Build a `Map<dealId, Deal>` from all existing records.
2. For each incoming record, check if `dealId` already exists in the Map.
3. If it does, keep whichever record has the later `updatedAt` timestamp.
4. Return `Array.from(map.values())` — no duplicates, latest version wins.

**Applied at**:
- `deals.store.ts → fetchDealsList()` — after each paginated API response
- `deals.store.ts → mergeDeals()` — after each real-time polling tick
- Deduplication runs before the store writes to `deals` ref, so the UI never sees duplicate rows

## Security

### Top 5 Frontend Security Risks

| # | Risk | Mitigation in this project |
|---|---|---|
| 1 | **XSS (Cross-Site Scripting)** | Vue auto-escapes all template interpolations. No `v-html` is used with user-controlled data anywhere. `sanitize.ts` wraps DOMPurify for any future rich-text rendering path. All search/filter inputs are treated as untrusted and passed only to client-side filter logic — never injected into DOM or SQL. |
| 2 | **Token / Credential Storage Issues** | Auth state is held in memory only — no `localStorage`, no `sessionStorage` for tokens. Simulated user preference (`partner`/`admin`) is stored in `sessionStorage` solely to survive page refresh within the tab; it carries no secret or privilege on its own. In production, `HttpOnly` cookies managed by the backend are the correct token storage. |
| 3 | **Sensitive Data Leakage** | API interceptors log HTTP status codes only — never response bodies, user objects, or tokens. Error messages shown to users are i18n keys resolved at display time; raw error objects and stack traces are never surfaced in the UI. MSW handlers return sanitized mock data with no PII. |
| 4 | **Improper Error Handling** | All `fetch` paths use typed `HttpError` with status codes. Catch blocks map errors to i18n message keys via `toStoreError()` — users see localised, actionable messages. HTTP 500 and timeout scenarios are simulated in MSW and covered by unit tests. The `ErrorBoundary` component prevents a render error in one subtree from breaking the entire app. |
| 5 | **Dependency Vulnerabilities** | Run `npm audit` before every deploy. Production dependencies are minimal: no jQuery, no lodash, no outdated utility libraries. `DOMPurify` (the sanitisation library) is actively maintained and CVE-free as of the last audit. `faker` and MSW are dev-only dependencies that are not bundled into production output. |

## AI Disclosure

Smart Tagging feature uses rule-based logic (see `src/utils/smartTags.ts`). No external AI API calls are made. See `readmeAI.md` for details.
