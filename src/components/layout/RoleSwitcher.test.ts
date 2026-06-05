import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const currentRole = ref<'Admin' | 'Partner'>('Admin')
const currentUser = ref({ id: 'u1', name: 'Alice Admin', role: 'Admin' })
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({ currentRole, currentUser }),
  MOCK_USERS: {
    admin: { id: 'u1', name: 'Alice Admin', role: 'Admin' },
    partner: { id: 'u2', name: 'Bob Partner', role: 'Partner' },
  },
}))

const switchToAdmin = vi.fn()
const switchToPartner = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ switchToAdmin, switchToPartner }),
}))

const routerPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
  useRoute: () => ({ name: 'deals', meta: {} }),
}))

vi.mock('@/router/routes', () => ({
  ROUTE_NAMES: { DEALS: 'deals', ADMIN: 'admin' },
}))

import RoleSwitcher from './RoleSwitcher.vue'

describe('RoleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentRole.value = 'Admin'
    currentUser.value = { id: 'u1', name: 'Alice Admin', role: 'Admin' }
  })

  it('shows trigger button with current role', () => {
    const wrapper = mount(RoleSwitcher)
    expect(wrapper.find('button').text()).toContain('Admin')
  })

  it('dropdown menu is hidden by default', () => {
    const wrapper = mount(RoleSwitcher)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('opens dropdown when trigger is clicked', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
  })

  it('closes dropdown when Escape is pressed on trigger', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('keydown.escape')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('shows current user name in menu', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Alice Admin')
  })

  it('calls switchToAdmin when Admin menu item is clicked', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    const menuItems = wrapper.findAll('[role="menuitem"]')
    const adminItem = menuItems.find(m => m.text().includes('auth.admin'))
    await adminItem!.trigger('click')
    expect(switchToAdmin).toHaveBeenCalled()
  })

  it('calls switchToPartner when Partner menu item is clicked', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    const menuItems = wrapper.findAll('[role="menuitem"]')
    const partnerItem = menuItems.find(m => m.text().includes('auth.partner'))
    await partnerItem!.trigger('click')
    expect(switchToPartner).toHaveBeenCalled()
  })

  it('closes menu after role selection', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    const menuItems = wrapper.findAll('[role="menuitem"]')
    await menuItems[0]!.trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('trigger button has aria-haspopup=menu', () => {
    const wrapper = mount(RoleSwitcher)
    expect(wrapper.find('button').attributes('aria-haspopup')).toBe('menu')
  })

  it('trigger button has aria-expanded=false when closed', () => {
    const wrapper = mount(RoleSwitcher)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('trigger button has aria-expanded=true when open', async () => {
    const wrapper = mount(RoleSwitcher)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
  })
})
