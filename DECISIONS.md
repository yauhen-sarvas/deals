# Architecture Decision Records

## 1. Architecture: Feature-Based Directory Structure

**Decision**: Organize source into `types/`, `services/`, `stores/`, `composables/`, `utils/`, `components/{ui,deals,layout,common}`, `views/`.

**Rationale**: A flat-by-type structure (`components/`, `stores/`) works for small apps but creates accidental coupling as the codebase grows — you navigate across many directories to understand one feature. Feature-based co-location (all deal-related code in `components/deals/`, `stores/deals.store.ts`, `services/deals.service.ts`) makes ownership clear and keeps related files a search away.

The `ui/` layer is kept intentionally separate from `deals/` because atomic components (Button, Badge, Input) are shared across features and have no domain knowledge. Mixing them with domain components makes both harder to reuse.

**Alternative considered**: Monolithic `components/` folder — rejected because it degrades into an undifferentiated pile of files above ~30 components.

---

## 2. State Management: Pinia with Composition API Style

**Decision**: Pinia (`defineStore` with Composition API setup function), not Vuex.

**Rationale**:
- Vuex 4 is in maintenance mode; Pinia is the official successor recommended by the Vue team.
- Composition API store syntax (`ref`, `computed`, `watch`) is identical to component setup — no mental model switch, no `mutations` boilerplate.
- Pinia has first-class TypeScript support without manually typing commit payloads.
- DevTools integration is equivalent (timeline, state snapshot, hot-reload).

**Tradeoff**: Pinia stores are less opinionated about mutations-vs-actions than Vuex, which can lead to stores mutating state directly from outside. Mitigated by keeping store state private and exposing only action functions from the store's return value.

---

## 3. Scalability Considerations

**Client-side filtering (current approach)**:
- Works for ≤500 records. The MSW mock API already accepts server-side filter params so switching is a one-line URL change in `deals.service.ts`.
- At scale, push all filtering/sorting/pagination to the server. The `fetchDeals()` function already forwards all filter params.

**Virtualization**:
- Not implemented — 20 rows per page renders in <1ms. Add `vue-virtual-scroller` if pageSize > 200 or rows contain heavy child components.

**i18n CDN bundling**:
- Currently all 4 locales are bundled at build time (adds ~8KB gzip). For 20+ locales, switch to dynamic import: `() => import(`./locales/${locale}.json`)` with `vue-i18n` lazy loading. Each locale loads on first switch and is cached by the browser.

**Cache service**:
- Current in-memory LRU works for a single tab. At scale, consider `@tanstack/vue-query` for stale-while-revalidate, background refetch, and shared cache across component trees.

---

## 4. Bottlenecks and Real-Time Strategy

**Polling vs. WebSocket**:

Polling (30-second interval) was chosen over WebSocket for the following reasons:

| Factor | Polling | WebSocket |
|---|---|---|
| Infrastructure | Zero extra server-side state | Requires persistent connection management |
| Scale | Trivial at <1000 concurrent users | Needs horizontal scaling with sticky sessions or pub/sub broker |
| Deal update frequency | Minutes between updates | Milliseconds if needed |
| Reconnect logic | Free — HTTP is stateless | Must implement reconnect, backoff, heartbeat |
| Browser compatibility | Universal | Universal but more failure modes |
| Debuggability | Plain HTTP in DevTools | Requires WebSocket tab |

For a B2B partner portal where deals change every few minutes, the UX difference between 30-second polling and true push is imperceptible. WebSocket would add operational overhead with no meaningful user benefit at this scale.

**Page-based pagination vs. infinite scroll**:
Pagination was chosen for two reasons:
1. **Deduplication**: Infinite scroll accumulates all pages in memory; when a real-time update inserts a new record, it can appear on a page the user already scrolled past, making deduplication invisible. With page-based pagination, each page is a clean slice — re-fetching page 2 always shows the current server state.
2. **Deep linking**: Partners often share URLs like `?page=4` to hand off to colleagues. Infinite scroll has no meaningful URL state to share.

---

## 5. Production Refactoring Decisions

### 5.1 Route Name Constants (`router/routes.ts`)

**Decision**: Extract route name strings into a `ROUTE_NAMES` constant object; reference only the constant across the codebase.

**Rationale**: Inline string route names (`'deals'`, `'deal-detail'`) are silently wrong when mistyped — the app navigates to the catch-all redirect with no error. A `ROUTE_NAMES` constant makes the compiler catch typos at import time, and renaming a route is a one-line change instead of a global string search.

**Pattern**: `as const` ensures TypeScript narrows the type to the literal values, enabling `RouteName` union type extraction via `typeof ROUTE_NAMES[keyof typeof ROUTE_NAMES]`.

---

### 5.2 Navigation Guard in Separate File (`router/guards.ts`)

**Decision**: Move `router.beforeEach` logic from `index.ts` to `guards.ts`; place `RouteMeta` augmentation there as well.

**Rationale**: The router index file's responsibility is wiring up routes. Guards are a separate concern — they contain auth logic and may import from stores. Co-locating the `declare module 'vue-router'` augmentation with the guard that uses it keeps the type extension close to its consumer.

---

### 5.3 Error Message Localisation via `i18n.global.t()`

**Decision**: Stores use `i18n.global.t()` directly (not `useI18n()`) for error messages; composables use `useI18n()`.

**Rationale**: Pinia stores are initialised outside component setup context, so `useI18n()` (which relies on `getCurrentInstance()`) is unavailable. `i18n.global.t()` is the documented approach for use outside components. Composables are always called from setup, so they use `useI18n()` normally. The distinction is enforced by the runtime — using `useI18n()` in a store throws at startup.

**Trade-off**: The store is now coupled to the `i18n` singleton. In a server-side rendering context this would require per-request i18n instances. For this SPA, the singleton is appropriate.

---

### 5.4 `$reset()` Pattern in Pinia Stores

**Decision**: Add an explicit `$reset()` function to each Composition API store.

**Rationale**: Options API Pinia stores get `$reset()` for free. Composition API stores do not — Pinia intentionally omits it because the store author controls what state exists. An explicit `$reset()` makes the reset contract visible (what state is included, what the defaults are) and allows callers (e.g. logout, test teardown) to restore a known state without bypassing encapsulation via `$patch`.

**Implementation**: A shared `initialState()` factory function drives both the initial `ref()` values and the reset, eliminating the risk of the two getting out of sync.

---

### 5.5 `ErrorBoundary` Component via `onErrorCaptured`

**Decision**: Add a generic `ErrorBoundary.vue` that wraps sections of the UI and catches descendant errors via `onErrorCaptured`.

**Rationale**: Vue's `onErrorCaptured` hook is the component-level equivalent of React's `componentDidCatch`. Without it, an unhandled error in a child component can unmount the entire app subtree. Wrapping independently-failing sections (e.g. the deals table, the filter panel) in an `ErrorBoundary` limits the blast radius. The boundary resets when the user clicks Retry, giving a recovery path without a full page reload.

---

### 5.6 Unit Test Strategy

**Decision**: Cover critical pure logic (deduplication, smartTags) and stateful logic (deals.store, useSearch, useFilters) with Vitest unit tests. No component tests for this phase.

**Rationale**:
- **Deduplication** and **smartTags** are pure functions with a large edge-case surface (tie-breaking on timestamps, threshold boundary conditions). They are the highest-value targets for unit tests.
- **deals.store** tests verify the async state machine: loading flags, error assignment, pagination updates. These catch regressions when the fetch/error logic is changed.
- **Composables** tests verify coordination logic (filter validation blocking submit, search clearing). Component tests would add jsdom rendering overhead without additional confidence for this logic.
- **MSW** is available for integration tests if needed in a future phase — the handlers already model real API behaviour including error and timeout simulation.
