import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from './AppInput.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('AppInput', () => {
  it('renders an input element', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', label: 'Deal Name', id: 'deal' } })
    expect(wrapper.find('label').text()).toBe('Deal Name')
  })

  it('does not render label when not provided', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('emits update:modelValue with string on text input', async () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', type: 'text' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('emits update:modelValue with parsed float on number input', async () => {
    const wrapper = mount(AppInput, { props: { modelValue: null, type: 'number' } })
    const el = wrapper.find('input').element as HTMLInputElement
    el.value = '42.5'
    await wrapper.find('input').trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([42.5])
  })

  it('emits null when number input is cleared', async () => {
    const wrapper = mount(AppInput, { props: { modelValue: 10, type: 'number' } })
    const el = wrapper.find('input').element as HTMLInputElement
    el.value = ''
    await wrapper.find('input').trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '', error: 'Required field', id: 'f1' },
    })
    expect(wrapper.find('p').text()).toBe('Required field')
  })

  it('does not show error paragraph when no error', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('does not show error text when hideErrorText is true', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '', error: 'Invalid', hideErrorText: true },
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('adds border-red-400 class when error is set', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', error: 'bad' } })
    expect(wrapper.find('input').classes()).toContain('border-red-400')
  })

  it('sets aria-invalid=true when error is set', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', error: 'bad', id: 'f2' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('does not set aria-invalid when no error', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('sets aria-describedby when error and id are provided', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '', error: 'bad', id: 'f3' },
    })
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('f3-error')
  })

  it('does not set aria-describedby when hideErrorText is true', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '', error: 'bad', id: 'f4', hideErrorText: true },
    })
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', disabled: true } })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('passes placeholder to input', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '', placeholder: 'Type here...' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Type here...')
  })
})
