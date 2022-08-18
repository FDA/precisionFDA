export const getKeysDifferenceFromObject = <ObjectT extends {}, KeyT extends keyof ObjectT>(
  obj: ObjectT,
  keys: KeyT[],
) => {
  const objKeys = Object.keys(obj)
  const missingKeys: KeyT[] = keys.filter((key) => !objKeys.includes(key as any))
  const extraKeys = objKeys.filter((key) => !keys.includes(key as any))
  return {
    missingKeys,
    extraKeys,
  }
}

export const validateNonNegativeInteger = (n: number) => Number.isInteger(n) && n > 0

export function validateDefined<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null && (typeof x !== 'number' || !Number.isNaN(x))
}
