export class StringUtils {
  static isEmpty(value: string): boolean {
    return value == null || value === ''
  }

  static isInteger(value: string): boolean {
    const number = parseInt(value)

    return !isNaN(number) && String(number) === value
  }

  static parseDateRange(range: string): { lower?: Date; upper?: Date } | undefined {
    const [lower, upper] = range
      .split(',')
      .map((value) => (value && value !== '0' ? new Date(value) : undefined))

    if (range === ',' || (!lower && !upper)) {
      return { lower: undefined, upper: undefined }
    }

    return { lower, upper }
  }

  static parseNumberRange(range: string) {
    const [lower, upper] = range.split(',').map((value) => (value ? parseFloat(value) : undefined))
    return { lower, upper }
  }
}
