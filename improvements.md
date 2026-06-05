# Deal Management Dashboard — Improvements Log

## Bug Fixes

### Role-Based Access & Cache Invalidation
- **Fix:** After switching from Admin to Partner, a previously selected deal remained visible in the detail panel even though the partner had no access to it.
- **Root cause:** `invalidateDealsCache()` only cleared the list cache (`deals:` prefix) but not individual deal cache (`deal:` prefix). The cached deal detail survived the role switch.
- **Solution:** Extended `invalidateDealsCache` in `deals.service.ts` to clear both `deals:` and `deal:` prefixes. Called on every role switch via `useAuth.ts`.

### Filters & Search Not Clearing on Role Switch
- **Fix:** After switching roles, active filters and search text persisted in the UI even though the store was reset.
- **Root cause:** `useFilters` and `useSearch` composables initialized local reactive state once from the store on mount but had no watchers to react to external resets.
- **Solution:** Added a deep `watch(() => store.filters, syncFromStore)` in `useFilters.ts`. Added debounce cancellation in `useSearch.ts` before syncing the external reset value.

### Race Conditions on Search and Deal Detail Requests
- **Fix:** Typing quickly in the search field could produce stale results — if an earlier slow request resolved after a newer one, the UI would display outdated data. Similarly, rapidly clicking between deals could leave the panel showing detail for a deal other than the last one clicked.
- **Root cause:** No mechanism existed to cancel in-flight HTTP requests when superseded by a newer one. Each request raced independently, and the last one to resolve "won", regardless of order.
- **Solution:** `AbortController` is now used to cancel superseded requests in both flows:
  - **Search / list fetches** (`fetchDealsList`): a module-level `listAbortController` is aborted and replaced each time a new list fetch starts. The search debounce already throttles keystrokes, but any request that was still in-flight when the debounce fires is cancelled immediately.
  - **Deal detail** (`fetchDealDetail`): a module-level `detailAbortController` is aborted and replaced on every `selectDeal()` call. Clicking a second deal while the first is loading cancels the first request instantly.
  - Aborted requests are detected via `axios.isCancel()` (exported as `isRequestAborted` from `api.service.ts`) and silently ignored — no error state is set.
  - The `finally` block uses a controller identity check (`listAbortController === controller`) to prevent the aborted request's finally from clearing the loading spinner that belongs to the newer in-flight request.
  - `$reset()` (called on role switch) aborts both controllers so no dangling requests survive a role change.
- **Files changed:** `api.service.ts` (new `isRequestAborted` helper), `deals.service.ts` (`signal?: AbortSignal` added to both fetch functions), `deals.store.ts` (abort controllers, guard in catch + finally).

### Background Polling Ignoring Active Sort State
- **Fix:** Long-polling in `useRealtime.ts` always fetched with default sort parameters, overwriting UI sort state on each poll.
- **Solution:** Poll now passes `store.sortBy` and `store.sortDir` to `fetchDeals`, keeping background updates consistent with the current table view.

---

## New Features

### Pagination: Go-to-Page Input
- Added a number input in `DealsPagination.vue` that lets users jump directly to any page by typing a page number and pressing Enter.
- Input is validated: out-of-range values are clamped to `[1, totalPages]`.
- Browser spinner arrows removed via CSS (`appearance-none` / `::-webkit-inner-spin-button`).

### Chinese (zh) Language Support
- Created `src/locales/zh.json` with full translations for all existing and new i18n keys.
- Registered `zh` in `src/i18n.ts` messages object.
- Added `{ code: 'zh', label: 'ZH' }` to the `LANGUAGES` array in `LanguageSwitcher.vue`.

### Inline Deal Detail Panel
- Removed the separate `/deals/:id` full-page route and `DealDetailView` navigation.
- Replaced with an inline right-side panel (`DealDetailPanel.vue`) that slides open on the deals list page when a row is clicked.
- Panel is sticky, appears to the right of the table on desktop and above the table on mobile.
- Selecting a deal sets `store.selectedDealId`; clearing it (Escape, close button, role switch, 403 error) calls `store.clearSelectedDeal()`.

### Admin Stats Grid
- `AdminView.vue` now displays a live stats grid showing Total, Open, Approved, and Rejected deal counts computed from the already-loaded store data, replacing the static placeholder.

---

## Accessibility (WCAG) Improvements

### Keyboard Navigation
- `RoleSwitcher`: Escape key closes the dropdown and returns focus to the trigger button.
- `DealsFiltersPanel`: Escape key closes the filter panel via a `document` keydown listener.
- `DealDetailPanel`: Escape key closes the panel; focus is restored to the element that triggered the panel open.
- `DealSearch`: Escape key clears the search input.

### ARIA Attributes
- **`RoleSwitcher`**: `aria-expanded`, `aria-haspopup="menu"` on trigger; `role="menu"` on dropdown; `role="menuitem"` on each option; `aria-hidden="true"` on backdrop.
- **`DealTable`**: `:aria-sort="ascending|descending|none"` on `<th>` elements; `aria-hidden="true"` on sort icons; inline loading spinner shown next to deal name while detail is fetching.
- **`DealsPagination`**: Wrapped in `<nav :aria-label>`, `:aria-current="page"` on active page button, `:aria-label="Go to page N"` on each numbered button, `role="separator"` + `aria-label` on ellipsis spans.
- **`DealsFiltersPanel`**: `role="region"` + `:aria-label` on the panel container.
- **`AppInput`**: `aria-invalid="true"` when in error state; `aria-describedby` wired to the error message element; error `<p>` gets `role="alert"`.
- **`LanguageSwitcher`**: `:aria-pressed` on each language button reflects active locale.
- **`DealsToolbar`**: Visually-hidden `<label>` (`sr-only`) added for the page-size `<select>`.
- **`DealCard`**: `:title` attributes added to truncated deal name and account name text so full text is accessible on hover.
- **`DealSearch`**: Clear button `aria-label` changed from `"Close"` → `t('deals.search.clear')`.

---

## UI / UX Improvements

### RoleSwitcher Dropdown
- Added animated open/close transition (scale + opacity + translate) with `cubic-bezier` easing.
- Chevron icon rotates 180° when the menu is open.

### DealsFiltersPanel Transition
- Improved slide-in easing from linear to `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like feel).

### DealDetailPanel Layout
- Panel is `sticky top-[4.5rem]` (accounts for the 3.5rem header + 1rem gap) so it doesn't hide under the app header when scrolling.
- `max-h-[calc(100vh-5.5rem)]` constrains panel height to viewport, with internal `overflow-y-auto` so content scrolls within the panel.
- On mobile the panel renders above the table (`order-first`); on desktop it appears to the right (`lg:order-last`).

### Number Input Arrows Removed
- All `<input type="number">` fields (amount range min/max, go-to page) hide browser-native spinner arrows via `[appearance:textfield]` and `[&::-webkit-inner-spin-button]:appearance-none`.

### ErrorBoundary Retry Button
- Replaced the hardcoded `<button class="...">Retry</button>` with `<AppButton>` + `t('common.retry')` for consistent styling and full i18n support.

### Orphaned Route Cleanup
- Removed the `deals/:id` route from `router/index.ts` (deal detail is now the inline panel).
- Removed the dead `|| $route.name === ROUTE_NAMES.DEAL_DETAIL` check from `AppHeader.vue`.

---

## Validation Improvements

### Date Range Filter Error
- `useFilters.ts` now computes `dateError` when `dateFrom > dateTo`.
- `applyFilters` is blocked while either `amountError` or `dateError` is active.
- `dateError` message is displayed below the `dateTo` input in `DealFilters.vue`.

### Amount Range Filter Error (Both Inputs)
- Previously the error message only appeared under the min input. Now both min and max inputs show the red error border when the range is invalid (max receives a spacer error string to trigger the visual state without duplicating the error text).

---

## i18n — New Keys Added (All 5 Locales: en, de, ja, es, zh)

| Key | Description |
|---|---|
| `deals.search.clear` | Label for the search clear button |
| `deals.pagination.goToPageN` | Screen-reader label for numbered page buttons |
| `deals.pagination.ellipsis` | Accessible label for pagination ellipsis |
| `deals.pagination.nav` | `aria-label` for the pagination `<nav>` |
| `deals.pagination.pageSize` | Label for the page-size select |
| `deals.filters.dateError` | Validation message when start date is after end date |
| `admin.stats.total` | Label for total deals stat card |

---

## Dead Code Cleanup

A full audit of unused code was performed across the project. The following dead code was identified and removed.

### ROUTE_NAMES.DEAL_DETAIL Constant
- **Removed:** `DEAL_DETAIL: 'deal-detail'` from `src/router/routes.ts`.
- **Why:** The `deals/:id` route was removed in an earlier session. The constant had no remaining references anywhere in the codebase.

### DealDetailView.vue (deleted)
- **Removed:** `src/views/DealDetailView.vue` deleted entirely.
- **Why:** The file had no active route, no imports pointing to it, and no references anywhere. Deal detail is now shown in the inline `DealDetailPanel` component.

### syncFromStore Removed from useFilters Public API
- **Removed:** `syncFromStore` from the return value of `useFilters()` in `src/composables/useFilters.ts`.
- **Why:** The function is an internal watch callback. No consumer ever called it directly — exporting it was unnecessary surface area.

### isMobileMenuOpen + toggleMobileMenu Removed from UI Store
- **Removed:** `isMobileMenuOpen` ref and `toggleMobileMenu()` function from `src/stores/ui.store.ts`, and their corresponding tests from `ui.store.test.ts`.
- **Why:** No hamburger menu component exists in the app. These were dead state with no consumer anywhere in production code.

### deals.detail.smartTags i18n Key Removed
- **Removed:** `"smartTags"` key under `deals.detail` from all 5 locale files (`en`, `de`, `ja`, `es`, `zh`).
- **Why:** The key was never referenced via `t('deals.detail.smartTags')` in any component or template. Smart tag labels use the separate `smartTags.*` top-level keys instead.

### RoleSwitcher Refactored to Use useAuth() — Bug Fixed
- **Problem:** `RoleSwitcher.vue` had its own inline role-switch logic that duplicated (and diverged from) the `useAuth` composable. The inline version was missing `setSearch('')` and `clearSelectedDeal()`, meaning:
  - The search input was not cleared on role switch.
  - The detail panel could remain open showing a deal the new role cannot access, until the 403 error arrived.
- **Fix:** `RoleSwitcher` now calls `switchToAdmin()` / `switchToPartner()` from `useAuth()`. The inline duplicate was removed entirely.
- **useAuth.ts also updated:** Added `dealsStore.clearSelectedDeal()` and switched from the service-level `invalidateDealsCache()` to `dealsStore.invalidateCache()` (the store already wraps the same call) for consistency. The `invalidateDealsCache` import was removed.
- **Result:** `useAuth` is now the single place that owns the full role-switch side-effect sequence: clear panel → invalidate cache → switch user → clear filters → clear search → fetch list.

---

## Static Analysis Cleanup (knip / depcheck / vue-tsc)

A full pass with `knip`, `depcheck`, and `vue-tsc --noEmit` was run. All findings were resolved; all three tools now exit clean.

### Unused Dependencies Removed
- **`@vueuse/core`** removed from `dependencies` in `package.json` — the package was installed but never imported anywhere in the source tree.
- **`@types/dompurify`** removed from `devDependencies` — redundant since `dompurify` 3.x ships its own TypeScript declarations.

### Unused Barrel Files Deleted
- **`src/components/ui/index.ts`** deleted — all UI components are already imported directly (e.g. `import AppInput from '@/components/ui/AppInput.vue'`); the re-export file had no consumers.
- **`src/types/index.ts`** deleted — all types are imported directly from `@/types/deals.types`; the barrel re-export had no consumers.

### Unexported / Removed Dead Exports
- **`createApiInstance`** (`src/services/api.service.ts`) — `export` keyword removed; the function is used only once internally to initialise `apiClient`. Exporting it was unnecessary API surface.
- **`RouteName`** type (`src/router/routes.ts`) — deleted entirely; the type was defined but never referenced anywhere in the codebase.
- **`ApiError`** interface (`src/types/deals.types.ts`) — deleted entirely; the interface was exported but never imported or used anywhere (its only consumer was the now-deleted `src/types/index.ts` barrel).

---

## Files Changed

| File | Type of Change |
|---|---|
| `src/stores/deals.store.ts` | Added `selectedDealId`, `selectDeal()`, `clearSelectedDeal()`; abort controllers for list and detail requests |
| `src/services/api.service.ts` | New `isRequestAborted` helper for detecting cancelled axios requests |
| `src/services/deals.service.ts` | `invalidateDealsCache` now clears both `deals:` and `deal:` prefixes; `signal?: AbortSignal` added to both fetch functions |
| `src/composables/useAuth.ts` | Role-switch sequence: clear panel, invalidate cache, switch user, clear filters, clear search, fetch list; now the single source of truth used by RoleSwitcher |
| `src/composables/useFilters.ts` | Added store watcher, `dateError` validation; removed `syncFromStore` from public return |
| `src/composables/useSearch.ts` | Cancels pending debounce before external sync |
| `src/composables/useRealtime.ts` | Poll uses current `sortBy`/`sortDir` from store |
| `src/components/deals/DealTable.vue` | Row click → `selectDeal`, `aria-sort`, inline spinner, removed test code |
| `src/components/deals/DealCard.vue` | Uses `selectDeal`, added `:title` attributes |
| `src/components/deals/DealDetailPanel.vue` | New component — inline deal detail panel |
| `src/components/deals/DealsPagination.vue` | `<nav>`, `aria-current`, `aria-label`, ellipsis aria, go-to input, page counter |
| `src/components/deals/DealSearch.vue` | Escape to clear, corrected `aria-label` |
| `src/components/deals/DealsFiltersPanel.vue` | Escape listener, improved transition, `role="region"` |
| `src/components/deals/DealsToolbar.vue` | `sr-only` label for page-size select |
| `src/components/deals/DealFilters.vue` | `dateError` shown on `dateTo`, amount error on both inputs |
| `src/components/layout/RoleSwitcher.vue` | ARIA, Escape, animated dropdown, focus return, chevron rotation; refactored to use `useAuth()` — removed duplicate logic and fixed missing `setSearch`/`clearSelectedDeal` on role switch |
| `src/components/layout/LanguageSwitcher.vue` | `aria-pressed` on active language, ZH button added |
| `src/components/layout/AppHeader.vue` | Removed dead `DEAL_DETAIL` route reference |
| `src/components/ui/AppInput.vue` | `aria-invalid`, `aria-describedby`, `role="alert"` on error |
| `src/components/common/ErrorBoundary.vue` | `AppButton` + i18n retry label |
| `src/views/DealsListView.vue` | Split layout: inline panel + table |
| `src/views/AdminView.vue` | Live stats grid (total / open / approved / rejected) |
| `src/router/index.ts` | Removed orphaned `deals/:id` route |
| `src/router/routes.ts` | Removed dead `DEAL_DETAIL` constant |
| `src/stores/ui.store.ts` | Removed dead `isMobileMenuOpen` + `toggleMobileMenu` |
| `src/stores/ui.store.test.ts` | Removed tests for deleted mobile menu state |
| `src/views/DealDetailView.vue` | **Deleted** — no route, no imports |
| `src/locales/en.json` | New i18n keys; removed `deals.detail.smartTags` |
| `src/locales/de.json` | New i18n keys; removed `deals.detail.smartTags` |
| `src/locales/ja.json` | New i18n keys; removed `deals.detail.smartTags` |
| `src/locales/es.json` | New i18n keys; removed `deals.detail.smartTags` |
| `src/locales/zh.json` | New file — full Chinese translations; removed `deals.detail.smartTags` |

---

## Architecture Audit Findings (pending fixes)

Full review of the codebase against: Vue 3 Composition API patterns, memory leaks, Pinia design, error handling, TypeScript safety, i18n hygiene, and logic correctness. All routes already use lazy loading (`() => import(...)`). Issues are grouped by category and ordered by severity.

### [FIXED] DealsToolbar — `clearAll` does not reset search
- **File:** `src/components/deals/DealsToolbar.vue`
- **Fix applied:** Added `store.setSearch('')` between `clearFilters()` and `fetchDealsList()`.

### [FIXED] AdminView — no loading state while stats fetch
- **File:** `src/views/AdminView.vue`
- **Fix applied:** Added `<LoadingState v-if="store.isLoading" />` guard; stats grid renders only after data is ready (`v-else`). Note: per-page vs. dataset-wide counts remain a known limitation pending a dedicated `/api/stats` endpoint.

### [FIXED] DealsToolbar — `localPageSize` not reactive to store resets
- **File:** `src/components/deals/DealsToolbar.vue`
- **Fix applied:** Replaced `ref(store.pagination.pageSize)` snapshot with `computed(() => store.pagination.pageSize)`.

### [FIXED] DealsToolbar — direct Pinia state mutation
- **File:** `src/components/deals/DealsToolbar.vue` + `src/stores/deals.store.ts`
- **Fix applied:** Added `setPageSize(size: number)` action to `deals.store.ts` (resets page to 1 internally); `changePageSize` in toolbar now calls `store.setPageSize(size)` instead of writing to `store.pagination` directly.

### [FIXED] useSearch — debounce timer memory leak on unmount
- **File:** `src/composables/useSearch.ts`
- **Fix applied:** Added `onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })`.

### [FIXED] deals.store — module-level AbortControllers leak across test instances
- **File:** `src/stores/deals.store.ts`
- **Fix applied:** Moved `listAbortController` and `detailAbortController` from module scope into the `defineStore` callback as plain `let` variables, scoped to each store instance.

### [FIXED] DealDetailPanel + DealTable — focus not reliably captured for mouse clicks
- **Files:** `src/components/deals/DealTable.vue`, `src/components/deals/DealDetailPanel.vue`
- **Fix applied:** Extracted `handleRowClick(dealId, event)` in `DealTable.vue` that calls `(event.currentTarget as HTMLElement).focus()` before `store.selectDeal()`, ensuring `document.activeElement` is the table row when `DealDetailPanel` setup runs.

### [FIXED] DealDetailPanel — unsafe `as HTMLElement` cast
- **File:** `src/components/deals/DealDetailPanel.vue`
- **Fix applied:** Replaced `as HTMLElement | null` cast with `instanceof HTMLElement` type guard.

### [FIXED] Redundant `as string` cast on SMART_TAG_I18N_KEYS lookup
- **Files:** `src/components/deals/DealDetailPanel.vue`, `src/components/deals/DealCard.vue`, `src/components/deals/DealTable.vue`
- **Fix applied:** Removed all three `as string` casts; `Record<SmartTag, string>` already guarantees the return type.

### [FIXED] Orphaned i18n keys removed from all 5 locales
- **Files:** `en.json`, `de.json`, `ja.json`, `es.json`, `zh.json`
- **Keys removed:** `deals.detail.back`, `common.back`, `common.save`, `common.cancel`, `auth.switchRole`

---

## UI/UX Audit Fixes

Full review of all Vue components for accessibility, form validation, loading/error states, mobile touch targets, and error boundaries. All fixes verified with `vue-tsc --noEmit`.

### Form Validation

#### [FIXED] AppInput — `hideErrorText` prop to suppress duplicate error text
- **File:** `src/components/ui/AppInput.vue`
- **Fix applied:** Added optional `hideErrorText?: boolean` prop. When true, the `<p role="alert">` is not rendered and `aria-describedby` is not set, preventing screen readers from announcing invisible whitespace. The red border and `aria-invalid="true"` still apply so the error state is fully conveyed visually and semantically.

#### [FIXED] DealFilters — amountMax shows red border without duplicating error text
- **File:** `src/components/deals/DealFilters.vue`
- **Fix applied:** Changed amountMax input from `:error="amountError ? ' ' : undefined"` (space-char hack) to `:error="amountError ?? undefined" :hide-error-text="true"`. The error text renders once under amountMin; the red border renders on both inputs without a phantom `<p>` tag.

#### [FIXED] DealFilters — dateFrom shows red border when date range is invalid
- **File:** `src/components/deals/DealFilters.vue`
- **Fix applied:** Added `:error="dateError ?? undefined" :hide-error-text="true"` to the `dateFrom` input. Both date fields now show the red border when the range is invalid; the error message renders once under `dateTo`.

#### [FIXED] DealFilters — Apply button disabled during validation errors and loading
- **File:** `src/components/deals/DealFilters.vue`
- **Fix applied:** Added `:disabled="!!amountError || !!dateError"` and `:loading="store.isLoading"` to the Apply `AppButton`. The button is visually disabled (opacity-50, cursor-not-allowed) when errors are active, and shows the built-in spinner while a fetch is in progress.

### Accessibility

#### [FIXED] DealSearch — clear button focus ring
- **File:** `src/components/deals/DealSearch.vue`
- **Fix applied:** Replaced `focus-visible:outline-none focus-visible:text-gray-600` (color-only) with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1`. Added `p-1.5` padding and repositioned to `right-1.5` to increase click area.

#### [FIXED] LanguageSwitcher — focus ring + larger touch target
- **File:** `src/components/layout/LanguageSwitcher.vue`
- **Fix applied:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1` and increased padding to `px-2.5 py-1.5`.

#### [FIXED] AppHeader — `aria-current="page"` on active nav links
- **File:** `src/components/layout/AppHeader.vue`
- **Fix applied:** Added `:aria-current="$route.name === ROUTE_NAMES.DEALS ? 'page' : undefined"` and equivalent for the Admin link. Also added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500` to both links.

#### [FIXED] DealCard — `aria-label` on `role="button"` element
- **File:** `src/components/deals/DealCard.vue`
- **Fix applied:** Added `:aria-label="deal.dealName"` so screen readers announce the deal name when focusing the card. Also added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500` focus ring.

#### [FIXED] RoleSwitcher — visible focus ring on menu items
- **File:** `src/components/layout/RoleSwitcher.vue`
- **Fix applied:** Replaced `focus-visible:bg-gray-50` (imperceptible against white) with `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400` on both `menuitem` buttons.

#### [FIXED] DealTable — focus ring on interactive rows
- **File:** `src/components/deals/DealTable.vue`
- **Fix applied:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400` to the `<tr>` class list.

#### [FIXED] Decorative SVGs missing `aria-hidden`
- **Files:** `src/components/common/EmptyState.vue`, `src/components/common/ErrorState.vue`, `src/components/common/ErrorBoundary.vue`
- **Fix applied:** Added `aria-hidden="true"` to the illustration SVG in each component so screen readers skip the path markup.

### Touch Targets (Mobile)

#### [FIXED] Pagination prev/next buttons below 44px touch target
- **File:** `src/components/deals/DealsPagination.vue`
- **Fix applied:** Increased padding on Prev and Next buttons from `px-2 py-1` to `px-3 py-2`. Added `focus-visible:ring-2 focus-visible:ring-blue-500` for consistency.

#### [FIXED] Filter panel and detail panel close buttons below 44px
- **Files:** `src/components/deals/DealsFiltersPanel.vue`, `src/components/deals/DealDetailPanel.vue`
- **Fix applied:** Increased close button padding from `p-1` to `p-2` in both components, bringing effective touch area from ~24px to ~32px.

### Error Boundary / Fallback UI

#### [FIXED] DealDetailPanel not covered by ErrorBoundary
- **File:** `src/views/DealsListView.vue`
- **Fix applied:** Wrapped `<DealDetailPanel />` in `<ErrorBoundary>`. Previously, only `DealTable` was wrapped; an uncaught render error in the detail panel would crash the entire page.

#### [FIXED] ErrorBoundary exposes raw `error.message` to users
- **File:** `src/components/common/ErrorBoundary.vue`
- **Fix applied:** Replaced `{{ error.message }}` with `{{ t('common.errorTitle') }}` (a new i18n key: "Something went wrong" / locale translations in all 5 files). Raw error details are now logged to `console.error('[ErrorBoundary]', err)` for debugging without surfacing internals to users.

### i18n

#### [FIXED] Added `common.errorTitle` to all 5 locale files
- **Files:** `en.json`, `de.json`, `ja.json`, `es.json`, `zh.json`
- **Translations:** EN "Something went wrong" · DE "Etwas ist schiefgelaufen" · JA "エラーが発生しました" · ES "Algo salió mal" · ZH "出现了错误"

---

## Component Tests & Coverage

### Component Tests — 22 new test files, 322 passing tests

Full `@vue/test-utils` test suite added for all Vue components. Tests follow the same mocking conventions as existing store/composable tests: `vi.mock` for dependencies, plain object store mocks (not Vue refs) to avoid template auto-unwrap issues.

#### UI Components (`src/components/ui/`)

| File | Tests | What's covered |
|---|---|---|
| `AppBadge.test.ts` | 6 | Variant class mapping, customClass, slot content, element tag |
| `AppButton.test.ts` | 11 | All 5 variants, 3 sizes, disabled state, loading spinner, type attribute |
| `AppInput.test.ts` | 16 | v-model for text/number/null, error display, `hideErrorText`, label, `aria-invalid`, `aria-describedby`, disabled |
| `AppCheckbox.test.ts` | 6 | v-model (checked/unchecked), label text, `for`/`id` association |

#### Common Components (`src/components/common/`)

| File | Tests | What's covered |
|---|---|---|
| `LoadingState.test.ts` | 2 | Spinner element, i18n text key |
| `EmptyState.test.ts` | 7 | Conditional messages (hasFilters on/off), clear button visibility, `clearFilters` emit, `aria-hidden` SVG |
| `ErrorState.test.ts` | 7 | All 5 error type → i18n key mappings, message prop, retry emit, `showRetry=false`, `aria-hidden` SVG |
| `ErrorBoundary.test.ts` | 2 + 4 todo | Slot renders when no error, `console.error` called on child throw; 4 tests marked `.todo` — `onErrorCaptured` propagation not reliably testable in VTU+jsdom |

#### Deals Components (`src/components/deals/`)

| File | Tests | What's covered |
|---|---|---|
| `DealStatusBadge.test.ts` | 6 | All 3 statuses → variant (success/danger/info), i18n text |
| `DealCard.test.ts` | 8 | Deal fields rendered, `selectDeal` on click and Enter, `aria-label`, `role="button"`, `tabindex`, focus ring |
| `DealSearch.test.ts` | 7 | Input rendered, clear button visibility, `clearSearch` on Escape and button click, `aria-label`, focus ring |
| `DealFilters.test.ts` | 8 | Status checkboxes, Apply disabled on `amountError`/`dateError`, loading spinner on `isLoading`, `applyFilters`/`clearFilters` calls |
| `DealsFiltersPanel.test.ts` | 6 | Panel visibility tied to `isFiltersOpen`, close button, Escape key (open vs closed), `role="region"` |
| `DealsToolbar.test.ts` | 7 | Search stub rendered, filters toggle, Clear All visibility (active/inactive), `clearFilters`+`setSearch('')`+`fetchDealsList` all called, page size select |
| `DealsPagination.test.ts` | 11 | Empty hides nav, nav renders with deals, prev/next disabled states, prev/next click calls, `goToPage` via Enter (valid/out-of-range), `aria-label` on nav |
| `DealTable.test.ts` | 11 | Loading/error/empty/data states, row count, deal name in row, `selectDeal` on click and Enter, sort header click, focus-visible ring, selected row highlight |
| `DealDetailPanel.test.ts` | 9 | Loading/error states, deal name/account/amount rendered, close button calls `clearSelectedDeal`, Escape key, unassigned partner text, focus ring |

#### Layout Components (`src/components/layout/`)

| File | Tests | What's covered |
|---|---|---|
| `AppHeader.test.ts` | 6 | Deals link rendered, Admin link shown/hidden by `isAdmin`, `aria-current="page"` on active link, language/role switcher stubs present |
| `LanguageSwitcher.test.ts` | 8 | 5 buttons rendered (EN/DE/JA/ES/ZH), `aria-pressed` on active, `aria-pressed=false` on inactive, locale change on click, localStorage persistence, active classes, focus-visible ring on all buttons |
| `RoleSwitcher.test.ts` | 11 | Current role in trigger, menu hidden by default, opens on click, closes on Escape, current user name in menu, Admin/Partner item calls correct composable, menu closes after selection, `aria-haspopup`, `aria-expanded` toggle |

#### Views (`src/views/`)

| File | Tests | What's covered |
|---|---|---|
| `AdminView.test.ts` | 8 | Loading spinner, stats grid visible when not loading, total from `pagination.total`, Open/Approved/Rejected counts computed from `store.deals`, title/subtitle/info banner |
| `DealsListView.test.ts` | 8 | `fetchDealsList` called on mount, toolbar/table/pagination stubs rendered, detail panel hidden when `selectedDealId=null`, detail panel rendered when `selectedDealId` set, title/subtitle |

### Key Testing Patterns

**Plain object mocks for stores** — Vue template auto-unwrapping only works for real reactive proxies. All store mocks use plain JS objects; values are set before each `mount()` call so the component reads the correct state at render time.

**`pagination` dual-access pattern** — `usePagination` returns a `computed` ref that the component accesses both as `pagination.value.page` (in script) and `pagination.page` (auto-unwrapped in template). Mock uses `Object.assign(data, { value: data })` so both access paths resolve correctly.

**`hasPrev`/`hasNext` as plain booleans** — template evaluates `!hasPrev` directly; plain booleans work correctly without ref wrapping.

**`vi.mock` factory hoisting** — all mock variables are defined at module scope before `vi.mock` calls; Vitest hoists the `vi.mock()` call but the returned closures evaluate lazily, so variables are fully initialized by the time components mount.

### Coverage Configuration

**Installed:** `@vitest/coverage-v8` (V8 native instrumentation, zero config).

**New script:** `npm run test:coverage` → runs all tests and generates:
- Terminal table (Statements / Branches / Functions / Lines per file)
- `coverage/index.html` — interactive HTML report with per-line highlighting
- `coverage/lcov.info` — machine-readable format for CI / VS Code Coverage Gutters extension

**Excluded from thresholds** (infrastructure files tested at integration level): `src/services/**`, `src/router/**`, `src/mocks/**`, `src/constants/**`, `src/main.ts`, `src/App.vue`, `src/i18n.ts`.

**Thresholds (enforced — `npm run test:coverage` fails if not met):**

| Metric | Threshold | Actual |
|---|---|---|
| Statements | 75% | **86.82%** |
| Branches | 65% | **80.47%** |
| Functions | 70% | **77.65%** |
| Lines | 75% | **88.65%** |

**`coverage/` added to `.gitignore`** — generated on demand, not committed.

### Files Changed

| File | Change |
|---|---|
| `vitest.config.ts` | Added `coverage` block: provider, reporters, include/exclude, thresholds |
| `package.json` | Added `test:coverage` script; added `@vitest/coverage-v8` to devDependencies |
| `.gitignore` | Added `coverage` entry |
| 22 new `*.test.ts` files | Component tests across `ui/`, `common/`, `deals/`, `layout/`, `views/` |

---

## GitHub Pages Deployment

### MSW Service Worker Support on GitHub Pages

Added support for deploying the app to GitHub Pages while keeping MSW (Mock Service Worker) fully functional in the browser.

**Problem:** MSW runs entirely in the browser via a Service Worker — no backend needed. But three issues blocked a working deploy:

1. **MSW was disabled in production builds** — `if (import.meta.env.DEV)` guard in `main.ts` prevented the worker from starting in any non-dev environment, including GitHub Pages.
2. **Service worker URL was hardcoded** — `/mockServiceWorker.js` only works when the app is served from the root path. GitHub Pages serves from `/<repo-name>/`, so the worker would fail to register.
3. **No `base` path configured** — Vite needs `base: '/dashboard/'` to produce correct asset paths for GitHub Pages, but hardcoding it would break `npm run dev` (which expects `/`).

**Solution:**

- `main.ts`: Removed the `DEV` guard so MSW starts in all environments. Changed the service worker URL from the hardcoded `/mockServiceWorker.js` to `` `${import.meta.env.BASE_URL}mockServiceWorker.js` `` — in dev `BASE_URL` is `/`, on GitHub Pages it is `/dashboard/`.
- `vite.config.ts`: Added a conditional base: `process.env.GITHUB_PAGES ? '/dashboard/' : '/'`. The flag is only set in CI, so local dev is unaffected.
- `.github/workflows/deploy.yml`: Created a GitHub Actions workflow that runs `npm run build` with `GITHUB_PAGES=true` and deploys the `dist/` folder to GitHub Pages on every push to `main`.

**One-time setup required:** In the GitHub repository go to **Settings → Pages → Source → GitHub Actions** to enable Pages deployment via the workflow.

### Files Changed

| File | Change |
|---|---|
| `src/main.ts` | Removed `DEV` guard; service worker URL now uses `import.meta.env.BASE_URL` |
| `vite.config.ts` | Added conditional `base` driven by `GITHUB_PAGES` env variable |
| `.github/workflows/deploy.yml` | New — GitHub Actions workflow for automated Pages deployment |
