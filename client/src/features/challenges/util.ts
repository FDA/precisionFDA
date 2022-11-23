import { formatDistance } from 'date-fns'
import { colors } from '../../styles/theme'
import { TimeStatus } from './types'

export const renderEmpty = (ts: TimeStatus) => {
  switch (ts) {
    case 'current':
    case 'upcoming':
      return `There are no ${ts} challenges on precisionFDA at the moment.  Check back regularly or subscribe to the mailing list to be informed of new community challenges.`
    case 'ended':
      return 'No ended challenges.'
    default:
      return 'No challenges found.'
  }
}

export const getTimeStatusName = (ts: TimeStatus) => {
  switch (ts) {
    case 'current':
      return 'Currently Open'
    case 'upcoming':
      return 'Upcoming'
    case 'ended':
      return 'Ended'
    default:
      return null
  }
}

export const getTimeStatusColor = (ts: TimeStatus) => {
  switch (ts) {
    case 'current':
      return colors.highlightGreen
    case 'upcoming':
      return colors.darkYellow
    case 'ended':
      return colors.darkGreyOnGrey
    default:
      return colors.darkGreyOnGrey
  }
}

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
