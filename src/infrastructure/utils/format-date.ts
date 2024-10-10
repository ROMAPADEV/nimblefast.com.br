import {
  parse,
  format as formatFns,
  startOfMonth,
  endOfMonth,
  type Locale,
} from 'date-fns'

interface PropsFormat {
  locale?: Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  firstWeekContainsDate?: number
  useAdditionalWeekYearTokens?: boolean
  useAdditionalDayOfYearTokens?: boolean
}

export function getDateFormatted(
  date: Date,
  format: string,
  options?: PropsFormat,
) {
  if (typeof window !== 'undefined') {
    return formatFns(date, format, options)
  }

  return formatFns(
    new Date(date.toISOString().replace('T', ' ').replace('.000Z', '')),
    format,
    options,
  )
}

export function formatDate(date: string | Date, from: string, to: string) {
  if (typeof date === 'object') return date

  return formatFns(parse(date, from, new Date()), to)
}

export function getDateInterval(date?: Date) {
  const currentDate = date || new Date()

  return {
    initDate: startOfMonth(currentDate),
    endDate: endOfMonth(currentDate),
  }
}
