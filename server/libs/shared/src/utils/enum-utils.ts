const numValues = (myEnum: any): number[] =>
  Object.values(myEnum)
    .map((value: any) => parseInt(value))
    .filter(value => !isNaN(value))

const stringValues = (myEnum: any): string[] =>
  (Object.values(myEnum).filter(
    (value) => typeof value === 'string',
  ) as any) as string[]

const stringValuesDowncased = (myEnum: any): string[] =>
  Object.values(myEnum)
    .filter((value) => typeof value === 'string')
    .map((strValue: any) => strValue.toLowerCase())

export { numValues, stringValues, stringValuesDowncased }
