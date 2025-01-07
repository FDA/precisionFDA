export class TimeUtils {
  private static DAYS_IN_WEEK = 7
  private static HOURS_IN_DAY = 24
  private static MINUTES_IN_HOUR = 60
  private static SECONDS_IN_MINUTE = 60
  private static MILLISECONDS_IN_SECOND = 1000

  static weeksToSeconds(weeks: number) {
    return this.daysToSeconds(weeks * this.DAYS_IN_WEEK)
  }

  static daysToSeconds(days: number) {
    return this.hoursToSeconds(days * this.HOURS_IN_DAY)
  }

  static hoursToSeconds(hours: number) {
    return this.minutesToSeconds(hours * this.MINUTES_IN_HOUR)
  }

  static minutesToSeconds(minutes: number) {
    return minutes * this.SECONDS_IN_MINUTE
  }

  static minutesToMilliseconds(minutes: number) {
    return this.minutesToSeconds(minutes) * this.MILLISECONDS_IN_SECOND
  }

  static minutesAgoInMiliseconds(minutes: number) {
    return Date.now() - this.minutesToMilliseconds(minutes)
  }

  static secondsToMilliseconds(seconds: number) {
    return seconds * this.MILLISECONDS_IN_SECOND
  }

  static floorMilisecondsToSeconds(milliseconds: number) {
    return Math.floor(milliseconds / this.MILLISECONDS_IN_SECOND)
  }

  static milisecondsToSeconds(milliseconds: number) {
    return milliseconds / this.MILLISECONDS_IN_SECOND
  }

  static elapsedTimeSinceStringFormatted(createdAt: Date) {
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
}
