/**
 * In-memory LRU cache with TTL.
 *
 * Trade-offs:
 *  + Zero network round-trips for repeated identical queries within TTL.
 *  + Simple — no IndexedDB, no service worker cache API, no external lib.
 *  - Memory only: cleared on page reload and not shared across tabs.
 *  - LRU eviction at maxSize=100 prevents unbounded growth but means stale
 *    entries can linger until evicted (mitigated by TTL).
 *  - Invalidation is pattern-based (prefix match), not tag-based — granular
 *    invalidation requires callers to maintain consistent key prefixes.
 *
 * Production alternative: react-query / TanStack Query provides a more
 * sophisticated cache with stale-while-revalidate, background refetch, and
 * devtools. For a Vue project at scale, consider `@tanstack/vue-query`.
 */

import { CACHE_TTL_MS, CACHE_MAX_SIZE } from '@/constants/cache'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    this.#touch(key, entry)
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) this.cache.delete(firstKey)
    }
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  #touch(key: string, entry: CacheEntry<unknown>): void {
    this.cache.delete(key)
    this.cache.set(key, entry)
  }
}

export const cacheService = new CacheService()
