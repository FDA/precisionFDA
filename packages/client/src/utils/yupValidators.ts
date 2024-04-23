import * as Yup from 'yup'

/**
 * Adds a custom validation method to the Yup library for arrays, allowing checking for unique values based on a specified field.
 */
Yup.addMethod(Yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (array: any) {
    const uniqueData = Array.from(
      new Set(array.map((row) => row[field]?.toLowerCase())),
    )
    const isUnique = array.length === uniqueData.length
    if (isUnique) {
      return true
    }
    const index = array.findIndex(
      (row, i) => row[field]?.toLowerCase() !== uniqueData[i],
    )
    if (array[index][field] === '') {
      return true
    }
    return this.createError({
      path: `${this.path}.${index}.${field}`,
      message,
    })
  })
})
