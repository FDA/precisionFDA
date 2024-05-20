export class StringUtils {
  static isEmpty(value: string): boolean {
    return value == null || value === ''
  }

  static isInteger(value: string): boolean {
    const number = parseInt(value)

    return !isNaN(number) && String(number) === value
  }
}
