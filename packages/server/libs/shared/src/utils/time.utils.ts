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
}
