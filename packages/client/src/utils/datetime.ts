import { parseISO, format } from 'date-fns'
import { TZDate } from '@date-fns/tz'

const convertDateToUserTime = (date: string): TZDate => {
  const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone
  return new TZDate(parseISO(date), userTimeZone)
}

const dateToInput = (date: Date | number | string): string => {
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
  const zoned = new TZDate(new Date(date), userTimeZone)
  return format(zoned, 'yyyy-MM-dd HH:mm:ss')
}

export {
  convertDateToUserTime,
  dateToInput,
}
