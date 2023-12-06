export class ArrayUtils {
  static isEmpty(input: unknown[] | null | undefined): input is [] {
    if (!Array.isArray(input)) {
      return true
    }

    return !input.length
  }

  static batchArray<T>(input: T[], batchSize: number): T[][] | null {
    if (input == null) {
      return null
    }

    const result: T[][] = []

    for (let i = 0; i < input.length; i += batchSize) {
      result.push(input.slice(i, i + batchSize))
    }

    return result
  }
}
