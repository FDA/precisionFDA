const numValues = (myEnum): number[] =>
  Object.values(myEnum)
    .map((value: any) => parseInt(value))
    .filter(value => !isNaN(value))

const stringValues = (myEnum): string[] =>
  (Object.values(myEnum).filter(
    (value: string | number) => typeof value === 'string',
  ) as any) as string[]

const stringValuesDowncased = (myEnum): string[] =>
  Object.values(myEnum)
    .filter((value: string | number) => typeof value === 'string')
    .map((strValue: string) => strValue.toLowerCase())

export { numValues, stringValues, stringValuesDowncased }
