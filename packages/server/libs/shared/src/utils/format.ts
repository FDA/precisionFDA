
export const formatDuration = (duration: number): string => {
  const elapsedSeconds = Math.floor(duration / 1000)
  const days = Math.floor(elapsedSeconds / 86400)
  const hours = (elapsedSeconds % 86400) / 3600
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60

  let result = Math.floor(minutes) + 'm ' + Math.round(seconds) + 's'
  const hoursInt = Math.floor(hours)
  const daysInt = Math.floor(days)
  if (hoursInt) {
    result = `${hoursInt}h ${result}`
  }
  if (daysInt) {
    return `${daysInt}d ${result}`
  }
  return result
}

export const getPluralizedTerm = (itemCount: number, itemName: string): string => {
  return `${itemCount.toString()} ${itemName}${itemCount > 1 ? 's' : ''}`
}
