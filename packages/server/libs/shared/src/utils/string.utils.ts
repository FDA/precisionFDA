export class StringUtils {
  static isEmpty(value: string): boolean {
    return value == null || value === ''
  }

  static isInteger(value: string): boolean {
    const number = parseInt(value, 10)

    return !Number.isNaN(number) && String(number) === value
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

  static parseNumberRange(
    range: string,
  ): { lower: number | undefined; upper: number | undefined } | undefined {
    if (range === ',') {
      return { lower: undefined, upper: undefined }
    }
    const [lower, upper] = range.split(',').map((value) => (value ? parseFloat(value) : undefined))
    return { lower, upper }
  }

  // Escape special characters for use in a regular expression
  // Based on Regex.Escape in .NET: https://learn.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regex.escape?view=net-9.0
  static escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
