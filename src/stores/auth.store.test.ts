import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, MOCK_USERS } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('initial state', () => {
    it('defaults to admin user when sessionStorage is empty', () => {
      const store = useAuthStore()
      expect(store.currentUser?.role).toBe('Admin')
    })

    it('restores saved user from sessionStorage', () => {
      sessionStorage.setItem('auth:userKey', 'partner')
      // Re-create pinia so store re-initialises from storage
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.currentUser?.role).toBe('Partner')
    })

    it('falls back to admin if sessionStorage has an unknown key', () => {
      sessionStorage.setItem('auth:userKey', 'superuser')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.currentUser?.role).toBe('Admin')
    })
  })

  describe('computed', () => {
    it('isAdmin is true for admin user', () => {
      const store = useAuthStore()
      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin is false for partner user', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      expect(store.isAdmin).toBe(false)
    })

    it('isPartner is false for admin user', () => {
      const store = useAuthStore()
      expect(store.isPartner).toBe(false)
    })

    it('isPartner is true for partner user', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      expect(store.isPartner).toBe(true)
    })

    it('currentRole returns Admin for admin user', () => {
      const store = useAuthStore()
      expect(store.currentRole).toBe('Admin')
    })

    it('currentRole returns Partner after switch', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      expect(store.currentRole).toBe('Partner')
    })

    it('currentRole returns null after logout', () => {
      const store = useAuthStore()
      store.logout()
      expect(store.currentRole).toBeNull()
    })
  })

  describe('switchUser', () => {
    it('sets currentUser to the specified user', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      expect(store.currentUser).toEqual(MOCK_USERS.partner)
    })

    it('persists the user key to sessionStorage', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      expect(sessionStorage.getItem('auth:userKey')).toBe('partner')
    })

    it('can switch back to admin', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      store.switchUser('admin')
      expect(store.currentUser?.role).toBe('Admin')
    })
  })

  describe('logout', () => {
    it('sets currentUser to null', () => {
      const store = useAuthStore()
      store.logout()
      expect(store.currentUser).toBeNull()
    })

    it('removes the key from sessionStorage', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      store.logout()
      expect(sessionStorage.getItem('auth:userKey')).toBeNull()
    })
  })

  describe('$reset', () => {
    it('restores currentUser to admin', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      store.$reset()
      expect(store.currentUser?.role).toBe('Admin')
    })

    it('clears sessionStorage on reset', () => {
      const store = useAuthStore()
      store.switchUser('partner')
      store.$reset()
      expect(sessionStorage.getItem('auth:userKey')).toBeNull()
    })
  })
})
