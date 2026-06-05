import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const locale = ref('en')
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale }),
}))

const setItemMock = vi.fn()
vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: setItemMock })

vi.mock('@/constants/storage', () => ({
  STORAGE_KEYS: { LOCALE: 'locale' },
}))

import LanguageSwitcher from './LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    locale.value = 'en'
  })

  it('renders 5 language buttons', () => {
    const wrapper = mount(LanguageSwitcher)
    expect(wrapper.findAll('button')).toHaveLength(5)
  })

  it('renders EN, DE, JA, ES, ZH buttons', () => {
    const wrapper = mount(LanguageSwitcher)
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toEqual(expect.arrayContaining(['EN', 'DE', 'JA', 'ES', 'ZH']))
  })

  it('active language button has aria-pressed=true', () => {
    locale.value = 'en'
    const wrapper = mount(LanguageSwitcher)
    const enBtn = wrapper.findAll('button').find(b => b.text() === 'EN')
    expect(enBtn!.attributes('aria-pressed')).toBe('true')
  })

  it('inactive language buttons have aria-pressed=false', () => {
    locale.value = 'en'
    const wrapper = mount(LanguageSwitcher)
    const deBtn = wrapper.findAll('button').find(b => b.text() === 'DE')
    expect(deBtn!.attributes('aria-pressed')).toBe('false')
  })

  it('clicking a language button changes locale', async () => {
    const wrapper = mount(LanguageSwitcher)
    const deBtn = wrapper.findAll('button').find(b => b.text() === 'DE')
    await deBtn!.trigger('click')
    expect(locale.value).toBe('de')
  })

  it('clicking a language button saves to localStorage', async () => {
    const wrapper = mount(LanguageSwitcher)
    const jaBtn = wrapper.findAll('button').find(b => b.text() === 'JA')
    await jaBtn!.trigger('click')
    expect(setItemMock).toHaveBeenCalledWith('locale', 'ja')
  })

  it('active language button has correct active classes', () => {
    locale.value = 'en'
    const wrapper = mount(LanguageSwitcher)
    const enBtn = wrapper.findAll('button').find(b => b.text() === 'EN')
    expect(enBtn!.classes()).toContain('bg-blue-600')
    expect(enBtn!.classes()).toContain('text-white')
  })

  it('all language buttons have focus-visible:ring class', () => {
    const wrapper = mount(LanguageSwitcher)
    wrapper.findAll('button').forEach(btn => {
      expect(btn.classes().join(' ')).toContain('focus-visible:ring-2')
    })
  })
})
