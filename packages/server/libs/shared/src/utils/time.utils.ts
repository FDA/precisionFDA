export type TimeSections = {
  year: number
  month: string
  day: string
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
  microseconds: string
}

export class TimeUtils {
  private static DAYS_IN_WEEK = 7
  private static HOURS_IN_DAY = 24
  private static MINUTES_IN_HOUR = 60
  private static SECONDS_IN_MINUTE = 60
  private static MILLISECONDS_IN_SECOND = 1000

  static weeksToSeconds(weeks: number): number {
    return this.daysToSeconds(weeks * this.DAYS_IN_WEEK)
  }

  static daysToSeconds(days: number): number {
    return this.hoursToSeconds(days * this.HOURS_IN_DAY)
  }

  static hoursToSeconds(hours: number): number {
    return this.minutesToSeconds(hours * this.MINUTES_IN_HOUR)
  }

  static minutesToSeconds(minutes: number): number {
    return minutes * this.SECONDS_IN_MINUTE
  }

  static minutesToMilliseconds(minutes: number): number {
    return this.minutesToSeconds(minutes) * this.MILLISECONDS_IN_SECOND
  }

  static minutesAgoInMiliseconds(minutes: number): number {
    return Date.now() - this.minutesToMilliseconds(minutes)
  }

  static secondsToMilliseconds(seconds: number): number {
    return seconds * this.MILLISECONDS_IN_SECOND
  }

  static floorMilisecondsToSeconds(milliseconds: number): number {
    return Math.floor(milliseconds / this.MILLISECONDS_IN_SECOND)
  }

  static getTimeRangeForYear(year: number): [Date, Date] {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
    return [startDate, endDate]
  }

  static milisecondsToSeconds(milliseconds: number): number {
    return milliseconds / this.MILLISECONDS_IN_SECOND
  }

  static secondsToCeilingMinutes(seconds: number): number {
    return Math.ceil(seconds / this.SECONDS_IN_MINUTE)
  }

  static elapsedTimeSinceStringFormatted(createdAt: Date): string {
    const elapsed = this.milisecondsToSeconds(Date.now() - createdAt.getTime())
    const days = Math.floor(elapsed / this.daysToSeconds(1))
    const hours = Math.floor((elapsed - this.daysToSeconds(days)) / this.hoursToSeconds(1))
    const minutes = Math.floor(
      (elapsed - this.daysToSeconds(days) - this.hoursToSeconds(hours)) / this.minutesToSeconds(1),
    )
    const seconds = Math.floor(
      (elapsed -
        this.daysToSeconds(days) -
        this.hoursToSeconds(hours) -
        this.minutesToSeconds(minutes)) /
        this.SECONDS_IN_MINUTE,
    )
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  static formatTimestamp(date: Date): string {
    const { year, month, day, hours, minutes, seconds, milliseconds, microseconds } =
      this.getFormattedTimeSections(date)

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${microseconds}`
  }

  static formatAtTime(date: Date): string {
    const { year, month, day, hours, minutes, seconds } = this.getFormattedTimeSections(date)

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000`
  }

  private static getFormattedTimeSections(date: Date): TimeSections {
    return {
      year: date.getFullYear(),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
      hours: String(date.getHours()).padStart(2, '0'),
      minutes: String(date.getMinutes()).padStart(2, '0'),
      seconds: String(date.getSeconds()).padStart(2, '0'),
      milliseconds: String(date.getMilliseconds()).padStart(3, '0'),
      // Timestamp in the RoR logs includes microseconds
      microseconds: '000',
    }
  }
}
