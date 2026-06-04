# Work Breakdown Structure & Estimation

## Method

**T-shirt sizing + hour conversion** (Senior Frontend Developer baseline, AI-assisted tooling):

| Size | Hours |
|---|---|
| XS | 0.25h |
| S | 0.5h |
| M | 1h |
| L | 1.5h |
| XL | 3h |

---

## WBS Table

| # | Task | Size | Est. h | Confidence | Depends on | Notes |
|---|---|---|---|---|---|---|
| 1 | Project scaffold (Vite, TS, Tailwind, deps) | S | 0.5h | High | — | Template + config |
| 2 | Types (`deals.types.ts`) | XS | 0.25h | High | 1 | Straightforward interfaces |
| 3 | Mock data — 120 seeded deals | S | 0.5h | High | 1, 2 | faker + deterministic seed |
| 4 | MSW handlers (list, detail, errors, RBAC) | M | 1h | Medium | 3 | Filter logic + error simulation |
| 5 | `api.service.ts` (Axios, interceptors, retry) | M | 1h | Medium | 1 | Exponential backoff |
| 6 | `cache.service.ts` (LRU + TTL) | M | 1h | Medium | 5 | LRU eviction + invalidation |
| 7 | `deals.service.ts` (cache integration) | XS | 0.25h | High | 5, 6 | Wraps API + cache |
| 8 | `deduplication.ts` | XS | 0.25h | High | 2 | Simple Map-based algo |
| 9 | `sanitize.ts`, `formatters.ts`, `smartTags.ts` | S | 0.5h | High | 2 | Pure utilities |
| 10 | `auth.store.ts` | S | 0.5h | High | 2, 5 | Two mock users, role switching |
| 11 | `deals.store.ts` | M | 1h | Medium | 7, 8, 10 | Full state + computed + actions |
| 12 | `ui.store.ts` | XS | 0.25h | High | 1 | Simple UI flags |
| 13 | `useSearch.ts` (debounce) | XS | 0.25h | High | 11 | |
| 14 | `useFilters.ts` (validation) | S | 0.5h | High | 11 | |
| 15 | `usePagination.ts` (page numbers) | S | 0.5h | Medium | 11 | Ellipsis logic |
| 16 | `useRealtime.ts` (polling + visibilityState) | S | 0.5h | Medium | 11 | |
| 17 | `useAuth.ts` | XS | 0.25h | High | 10 | |
| 18 | UI atoms (Button, Badge, Input, Checkbox) | M | 1h | High | 1 | Variant + accessibility |
| 19 | `DealStatusBadge.vue` | XS | 0.25h | High | 18 | |
| 20 | `DealSearch.vue` | XS | 0.25h | High | 18, 13 | |
| 21 | `DealFilters.vue` | M | 1h | Medium | 18, 14 | Multi-field + validation |
| 22 | `DealCard.vue` (mobile) | S | 0.5h | High | 18, 11 | |
| 23 | `DealTable.vue` (desktop + mobile) | L | 1.5h | Medium | 18, 22, 11 | Responsive + sortable |
| 24 | `LoadingState`, `ErrorState`, `EmptyState` | S | 0.5h | High | 18 | |
| 25 | `AppHeader`, `AppLayout`, `LanguageSwitcher` | M | 1h | Medium | 18, 10 | Role switcher UX |
| 26 | `DealsListView.vue` | L | 1.5h | Medium | 20–25, 13–17 | Full integration |
| 27 | `DealDetailPanel.vue` (inline panel, replaced separate view) | S | 0.5h | High | 18, 11 | |
| 28 | Router (constants, guards, lazy routes) | XS | 0.25h | High | 26, 27 | Includes `routes.ts`, `guards.ts` |
| 29 | i18n — 5 locales (en/de/ja/es/zh) | M | 1h | Medium | 1 | ~90 keys × 5 |
| 30 | `ErrorBoundary.vue` | XS | 0.25h | High | 18 | `onErrorCaptured` pattern |
| 31 | Unit tests — stores, utils, composables | M | 1h | Medium | 8–17 | 12 files, 142 tests |
| 32 | README, DECISIONS, ESTIMATION, REPORT, readmeAI | S | 0.5h | High | All | |
| **Total** | | | **~20h** | | | |

---

## Assumptions

1. Developer is senior-level (fluent in Vue 3 Composition API and TypeScript) and uses AI-assisted tooling (code generation, boilerplate acceleration). Estimates reflect this baseline.
2. No design files provided — UI is built to match Tailwind defaults and a corporate B2B aesthetic.
3. No backend needed — MSW simulates all API behavior including errors and latency.
4. Vitest test coverage target: all stores, composables, and utils (142 tests across 12 files). Component tests out of scope.
5. Accessibility: keyboard navigation and ARIA on interactive elements, but full WCAG 2.1 AA audit is out of scope.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| vue-i18n v9 API churn between minor versions | Medium | Pin exact version; tested with 9.14.x |
| MSW v2 service worker registration blocked by CSP | Low | CSP `connect-src 'self'` permits SW fetch |
| TypeScript strict mode errors from Pinia stores accessing each other | Medium | Use dynamic import in API interceptor to avoid circular imports |
| ESM incompatibility in Vitest with `require()` inside `vi.mock` factories | Medium | Use `vi.hoisted()` to hoist mock variables so they are accessible inside factory functions |
| Faker seed produces non-deterministic results across Node versions | Low | `faker.seed(42)` is deterministic within a major faker version |
