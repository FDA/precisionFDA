import { parseISO } from 'date-fns'
import { utcToZonedTime, formatInTimeZone } from 'date-fns-tz'


const convertDateToUserTime = (date: string): Date => {
  const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone
  return utcToZonedTime(parseISO(date), userTimeZone)
}

const dateToInput = (date: Date | number | string) : string => {
  const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone
  return formatInTimeZone(date, userTimeZone, 'yyyy-MM-dd HH:mm:ss')
}

export {
  convertDateToUserTime,
  dateToInput,
}
