import { parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'


const convertDateToUserTime = (date: string) => {
  const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone
  return utcToZonedTime(parseISO(date), userTimeZone)
}

export {
  convertDateToUserTime,
}
