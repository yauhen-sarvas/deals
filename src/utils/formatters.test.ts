import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatCurrency, formatDate, formatDateRelative } from './formatters'

const MS_PER_DAY = 86_400_000
const FIXED_NOW = new Date('2025-06-15T12:00:00.000Z').getTime()

describe('formatCurrency', () => {
  it('formats amount as USD for en-US locale', () => {
    const result = formatCurrency(1500, 'en-US')
    expect(result).toContain('1,500')
    expect(result).toContain('$')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'en-US')
    expect(result).toContain('0')
  })

  it('rounds to zero decimal places', () => {
    const result = formatCurrency(1234.99, 'en-US')
    expect(result).not.toContain('.')
    expect(result).toContain('1,235')
  })

  it('formats large amount', () => {
    const result = formatCurrency(50000, 'en-US')
    expect(result).toContain('50,000')
  })

  it('formats amount in German locale', () => {
    const result = formatCurrency(1500, 'de-DE')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2024-03-15T00:00:00.000Z', 'en-US')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('includes the year in the output', () => {
    const result = formatDate('2024-03-15T00:00:00.000Z', 'en-US')
    expect(result).toContain('2024')
  })

  it('formats in Japanese locale without throwing', () => {
    const result = formatDate('2024-03-15T00:00:00.000Z', 'ja-JP')
    expect(typeof result).toBe('string')
    expect(result).toBeTruthy()
  })
})

describe('formatDateRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for the current moment', () => {
    const result = formatDateRelative(new Date(FIXED_NOW).toISOString(), 'en-US')
    expect(result.toLowerCase()).toContain('today')
  })

  it('returns a day-relative string for yesterday', () => {
    const yesterday = new Date(FIXED_NOW - MS_PER_DAY).toISOString()
    const result = formatDateRelative(yesterday, 'en-US')
    expect(result.toLowerCase()).toMatch(/yesterday|1 day ago/)
  })

  it('returns a day-relative string for 3 days ago', () => {
    const threeDaysAgo = new Date(FIXED_NOW - 3 * MS_PER_DAY).toISOString()
    const result = formatDateRelative(threeDaysAgo, 'en-US')
    expect(result).toContain('3')
    expect(result.toLowerCase()).toContain('day')
  })

  it('returns a week-relative string for 14 days ago', () => {
    const twoWeeksAgo = new Date(FIXED_NOW - 14 * MS_PER_DAY).toISOString()
    const result = formatDateRelative(twoWeeksAgo, 'en-US')
    expect(result.toLowerCase()).toContain('week')
  })

  it('returns a month-relative string for 60 days ago', () => {
    const twoMonthsAgo = new Date(FIXED_NOW - 60 * MS_PER_DAY).toISOString()
    const result = formatDateRelative(twoMonthsAgo, 'en-US')
    expect(result.toLowerCase()).toContain('month')
  })

  it('returns a year-relative string for 400 days ago', () => {
    const overAYearAgo = new Date(FIXED_NOW - 400 * MS_PER_DAY).toISOString()
    const result = formatDateRelative(overAYearAgo, 'en-US')
    expect(result.toLowerCase()).toContain('year')
  })
})
