export const formatDuration = (duration: number): string => {
  const elapsedSeconds = Math.floor(duration / 1000)
  const days = Math.floor(elapsedSeconds / 86400)
  const hours = (elapsedSeconds % 86400) / 3600
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60

  let result = `${Math.floor(minutes)}m ${Math.round(seconds)}s`
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

/**
 * Especially useful for creating URLs of licenses and other entities, because
 * id of the license in dash and lowercase is used in the URL.
 * @param str
 */
export const lowercaseAndDash = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, '-')
}

export const humanizeFileSize = (bytes: number | undefined | null): string => {
  if (bytes == null || bytes === 0) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes < 1024) {
    return `${bytes} ${bytes === 1 ? 'Byte' : 'Bytes'}`
  }

  let index = 0
  let size = bytes
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }

  const digitsBeforeDecimal = Math.floor(Math.log10(size)) + 1
  const decimals = Math.max(0, 3 - digitsBeforeDecimal)
  const rounded = Number(size.toFixed(decimals))

  return `${rounded.toString()} ${units[index]}`
}
