# Implementation Report

## Planned vs. Actual

| Area | Planned | Actual | Delta |
|---|---|---|---|
| Project setup (scaffold, types, mock data) | 1.25h | 0.75h | -0.5h — Vite + Tailwind v4 plugin zero-config |
| MSW handlers | 1h | 1h | On target |
| Services (`api.service`, `cache.service`, `deals.service`) | 2.25h | 2.25h | On target |
| Utils (`deduplication`, `sanitize`, `formatters`, `smartTags`) | 0.75h | 0.75h | On target |
| Stores (`auth`, `deals`, `ui`) | 1.75h | 2h | +0.25h — Pinia circular import between auth/api needed dynamic import workaround |
| Composables (`useSearch`, `useFilters`, `usePagination`, `useRealtime`, `useAuth`) | 2h | 2h | On target |
| Components (atoms, deals, layout, common) | 6.25h | 7h | +0.75h — DealTable responsive + sort UX took longer |
| Views + Router | 2.25h | 2.25h | On target |
| i18n (4 locales) | 1h | 1h | On target |
| Production refactoring | — | 2h | Not planned — route constants, guards.ts, error localisation, `$reset()`, ErrorBoundary |
| Unit tests (stores, utils, composables) | 1h | 2h | +1h — scope expanded to 12 files / 142 tests; ESM mock hoisting and lifecycle setup added complexity |
| Docs | 0.5h | 0.5h | On target |
| **Total** | **~20h** | **~23.5h** | **+3.5h** |

## Challenges

**1. Circular store dependency in API interceptors**

`api.service.ts` needs `useAuthStore()` to inject auth headers. Importing the store module at the top level created a circular dependency: `api.service → auth.store → (pinia)`. Solved by using a dynamic `require()` inside the interceptor function, which defers module resolution until Pinia is initialized.

In production I'd use a Pinia plugin or a dedicated token registry singleton that isn't a Pinia store.

**2. Tailwind CSS v4 integration**

Tailwind v4 uses a new Vite plugin (`@tailwindcss/vite`) instead of PostCSS. The `@import "tailwindcss"` directive replaces the old `@tailwind base/components/utilities` directives. Configuration is zero-config by default. This is a positive change but the documentation was sparse — the working pattern was found by reading the v4 changelog directly.

**3. vue-i18n v9 deprecation warning**

`vue-i18n@9` shows a deprecation notice at install time — v9 and v10 are no longer supported and users should migrate to v11. The task specification requires v9, so I used it as specified. In a real project I'd evaluate upgrading to v11 (which has a revised Composition API but the same core interface).

**4. `faker.number.float` fractionDigits parameter**

`@faker-js/faker` v10 changed the `float()` API — `precision` was replaced by `fractionDigits`. Required reading the v10 changelog to generate properly-rounded amounts.

## What I Would Improve

**1. Component tests**
The unit test suite fully covers stores, utils, and composables (142 tests). The next layer would be `@vue/test-utils` component tests for:
- `DealFilters.vue` — verify filter application, validation feedback, and "Clear All" behaviour
- `DealTable.vue` — verify sort toggle cycles and row click navigation
- `DealsListView.vue` — integration test with a real Pinia store and MSW intercepting fetch

**2. TanStack Query**
The manual cache service (`cache.service.ts`) and polling composable (`useRealtime.ts`) reimplement features that `@tanstack/vue-query` provides out of the box: stale-while-revalidate, background refetch, query invalidation, and request deduplication. For a real product I'd replace both with `vue-query`.

**3. Accessibility audit**
Focus management when the filter sidebar opens/closes, ARIA `live` regions for loading state announcements, and correct `role="table"` landmarks were partially implemented. A full WCAG 2.1 AA pass would be needed before shipping.

**4. URL-synced filters**
Currently filters are in-memory state only. For a B2B dashboard, partners expect to bookmark or share a filtered view. I'd sync `filters` and `search` to `?status=Open&search=acme` via Vue Router's `query` params using a `watch` on the route.

**5. Real authentication flow**
The RBAC simulation uses a client-side store switch. In a real system this would be replaced with JWT-based auth, an `/auth/me` endpoint, and `HttpOnly` cookie token storage. The navigation guard in `guards.ts` is already structured to accept real role data from a token payload with no structural changes needed.

## Known Limitations and Technical Debt

| Item | Description | Severity |
|---|---|---|
| Client-side filtering only | All filter/search/sort logic runs in the browser. Works for ≤500 records; beyond that, server-side filtering is required. The `fetchDeals()` function already forwards filter params to MSW, so the switch is a one-line change in `deals.service.ts`. | Medium |
| In-memory cache only | `cache.service.ts` is cleared on page reload and is not shared across browser tabs. A PWA-grade solution would use a service worker cache or `@tanstack/vue-query`. | Low |
| Simulated auth (no real JWT) | Role switching is a UI-only concern — there is no actual token, no `/login` endpoint, no expiry, no silent refresh. The `adminGuard` navigation guard enforces the role check in the router but cannot prevent direct API calls by a determined user in a browser console. | Low (by design — frontend simulation) |
| No E2E tests | Playwright or Cypress tests covering the full user journey (login → filter → navigate to detail → go back) are absent. MSW handlers are already in place to support them. | Medium |
| All locales bundled at build time | All 4 locale JSON files are included in the initial bundle (~8 KB gzip). For 20+ locales, switch to dynamic `import()` with `vue-i18n` lazy loading. | Low |
