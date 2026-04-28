export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1000
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(1)} ${units[i]}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString()
}

export function formatRuntime(seconds: number): string {
  if (!seconds) return '0'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}HRS ${String(minutes).padStart(2, '0')}MINS`
  if (minutes > 0) return `${minutes}MINS`
  const secs = Math.floor(seconds % 60)
  return `${secs}SECS`
}
