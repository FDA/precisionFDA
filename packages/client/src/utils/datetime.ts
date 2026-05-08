import { TZDate } from '@date-fns/tz'
import { differenceInDays, differenceInMonths, differenceInYears, format, parseISO } from 'date-fns'

const convertDateToUserTime = (date: string): TZDate => {
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
  return new TZDate(parseISO(date), userTimeZone)
}

const dateToInput = (date: Date | number | string): string => {
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
  const zoned = new TZDate(new Date(date), userTimeZone)
  return format(zoned, 'yyyy-MM-dd HH:mm:ss')
}

const relativeTimeAgo = (value: string | null): string | null => {
  if (!value) return null
  const date = new Date(value)
  const now = new Date()
  const days = differenceInDays(now, date)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = differenceInMonths(now, date)
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`
  const years = differenceInYears(now, date)
  const remainingMonths = differenceInMonths(now, date) - years * 12
  const yearsPart = years === 1 ? '1 year' : `${years} years`
  if (remainingMonths === 0) return `${yearsPart} ago`
  const monthsPart = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`
  return `${yearsPart} ${monthsPart} ago`
}

export { convertDateToUserTime, dateToInput, relativeTimeAgo }
