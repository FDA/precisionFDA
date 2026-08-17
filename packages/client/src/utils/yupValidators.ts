import * as Yup from 'yup'

/**
 * Adds a custom validation method to the Yup library for arrays, allowing checking for unique values based on a specified field.
 *
 * Empty rows are skipped, so a row the user has added but not filled in yet is left to
 * `required`. The clash is reported on the second occurrence, the row that introduced it.
 */
Yup.addMethod(Yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (arr: unknown) {
    const array = (arr ?? []) as Record<string, string | undefined>[]
    const seen = new Set<string>()

    for (const [index, row] of array.entries()) {
      const value = row?.[field]?.toLowerCase()
      if (!value) {
        continue
      }
      if (seen.has(value)) {
        return this.createError({
          path: `${this.path}.${index}.${field}`,
          message,
        })
      }
      seen.add(value)
    }

    return true
  })
})
