const numValues = (myEnum): number[] =>
  Object.values(myEnum)
    .map((value: any) => parseInt(value))
    .filter(value => !isNaN(value))

export { numValues }
