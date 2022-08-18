import { formatDistance } from 'date-fns'
import { TimeStatus } from './types'


export const getTimeStatus = (startAt: Date, endAt: Date): TimeStatus => {
  const timeNow = (new Date()).getTime()
  const hasStarted = timeNow > startAt.getTime()
  const hasEnded = timeNow > endAt.getTime()
  if (!hasStarted) {
    return 'upcoming'
  }
  if (!hasEnded) {
    return 'current'
  }
  return 'ended'
}

export const getChallengeTimeRemaining = ({ start_at, end_at }: { start_at: Date, end_at: Date }) => {
  let timeRemainingLabel = 'Ended'
  const timeStatus = getTimeStatus(start_at, end_at)
  switch (timeStatus) {
    case 'upcoming':
      timeRemainingLabel = `Starting in about ${formatDistance(new Date(), start_at).replace('about ', '')}`
      break
    case 'current':
      timeRemainingLabel = `About ${formatDistance(new Date(), end_at).replace('about ', '')  } remaining`
      break
    default:
      break
  }
  return timeRemainingLabel
}


export const extractChallengeContent = (challenge, regionName) => {
  if (!challenge?.meta?.regions?.[regionName]) {
    return ''
  }
  return challenge.meta.regions[regionName]
}
