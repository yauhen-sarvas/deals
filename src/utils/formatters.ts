const MS_PER_DAY = 86_400_000
const DAYS_PER_WEEK = 7
const DAYS_PER_MONTH = 30
const DAYS_PER_YEAR = 365

export function formatCurrency(amount: number, locale: string, currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(isoString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoString))
}

export function formatDateRelative(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / MS_PER_DAY)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (days === 0) return rtf.format(0, 'day')
  if (days < DAYS_PER_WEEK) return rtf.format(-days, 'day')
  if (days < DAYS_PER_MONTH) return rtf.format(-Math.floor(days / DAYS_PER_WEEK), 'week')
  if (days < DAYS_PER_YEAR) return rtf.format(-Math.floor(days / DAYS_PER_MONTH), 'month')
  return rtf.format(-Math.floor(days / DAYS_PER_YEAR), 'year')
}
