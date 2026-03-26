export function validateDefined<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null && (typeof x !== 'number' || !Number.isNaN(x))
}
