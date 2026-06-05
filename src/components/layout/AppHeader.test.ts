import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const authState = { isAdmin: true }
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => authState,
}))

vi.mock('@/router/routes', () => ({
  ROUTE_NAMES: { DEALS: 'deals', ADMIN: 'admin' },
}))

vi.mock('./LanguageSwitcher.vue', () => ({
  default: { template: '<div class="lang-stub" />' },
}))

vi.mock('./RoleSwitcher.vue', () => ({
  default: { template: '<div class="role-stub" />' },
}))

import AppHeader from './AppHeader.vue'

const mountHeader = (routeName = 'deals') => mount(AppHeader, {
  global: {
    stubs: { RouterLink: RouterLinkStub },
    mocks: { $route: { name: routeName } },
  },
})

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.isAdmin = true
  })

  it('renders the Deals nav link', () => {
    const wrapper = mountHeader()
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some(l => l.text().includes('nav.deals'))).toBe(true)
  })

  it('renders the Admin nav link when user is admin', () => {
    authState.isAdmin = true
    const wrapper = mountHeader()
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some(l => l.text().includes('nav.admin'))).toBe(true)
  })

  it('hides the Admin nav link when user is not admin', () => {
    authState.isAdmin = false
    const wrapper = mountHeader()
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some(l => l.text().includes('nav.admin'))).toBe(false)
  })

  it('active Deals link has aria-current=page', () => {
    const wrapper = mountHeader('deals')
    const dealsLink = wrapper.findAllComponents(RouterLinkStub).find(l => l.text().includes('nav.deals'))
    expect(dealsLink!.attributes('aria-current')).toBe('page')
  })

  it('inactive Admin link does not have aria-current', () => {
    const wrapper = mountHeader('deals')
    const adminLink = wrapper.findAllComponents(RouterLinkStub).find(l => l.text().includes('nav.admin'))
    expect(adminLink!.attributes('aria-current')).toBeUndefined()
  })

  it('renders language and role switchers', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.lang-stub').exists()).toBe(true)
    expect(wrapper.find('.role-stub').exists()).toBe(true)
  })
})
