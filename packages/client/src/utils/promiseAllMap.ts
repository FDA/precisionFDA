/**
 * Resolves a map (object) with Promise values or arrays of Promises.
 *
 * Given a map with string keys and values that are either:
 * 1. Promises.
 * 2. Arrays containing Promises.
 * This function will resolve all those Promises and return a map
 * with the same keys, but the values will be the resolved values of the Promises.
 *
 * For example:
 * If the input is:
 * {
 *   key1: Promise.resolve(1),
 *   key2: [Promise.resolve(2), Promise.resolve(3)],
 *   key3: "staticValue"
 * }
 * The output will be:
 * {
 *   key1: 1,
 *   key2: [2, 3],
 *   key3: "staticValue"
 * }
 *
 * @param {Record<string, any>} map - The input map with keys as strings and values that are either Promises or arrays of Promises.
 * @returns {Promise<Record<string, any>>} - A new map with the same keys but resolved values.
 */
export async function promiseAllMap(map: Record<string, any>): Promise<Record<string, any>> {
  const keys = Object.keys(map)
  const values = await Promise.all(
    Object.values(map).map(value =>
      Array.isArray(value) ? Promise.all(value) : Promise.resolve(value),
    ),
  )

  const resolvedMap: Record<string, any> = {}
  keys.forEach((key, index) => {
    resolvedMap[key] = values[index]
  })

  return resolvedMap
}
