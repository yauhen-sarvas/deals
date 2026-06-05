import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppCheckbox from './AppCheckbox.vue'

describe('AppCheckbox', () => {
  it('renders label text', () => {
    const wrapper = mount(AppCheckbox, { props: { modelValue: false, label: 'Open' } })
    expect(wrapper.text()).toContain('Open')
  })

  it('checkbox is checked when modelValue is true', () => {
    const wrapper = mount(AppCheckbox, { props: { modelValue: true, label: 'Open' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('checkbox is unchecked when modelValue is false', () => {
    const wrapper = mount(AppCheckbox, { props: { modelValue: false, label: 'Open' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('emits true when checkbox is checked', async () => {
    const wrapper = mount(AppCheckbox, { props: { modelValue: false, label: 'Open' } })
    await wrapper.find('input').setChecked(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits false when checkbox is unchecked', async () => {
    const wrapper = mount(AppCheckbox, { props: { modelValue: true, label: 'Open' } })
    await wrapper.find('input').setChecked(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('associates label with input via id', () => {
    const wrapper = mount(AppCheckbox, {
      props: { modelValue: false, label: 'Open', id: 'cb-open' },
    })
    expect(wrapper.find('label').attributes('for')).toBe('cb-open')
    expect(wrapper.find('input').attributes('id')).toBe('cb-open')
  })
})
