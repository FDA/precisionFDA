export const getEnumKeyByValue = <T>(enumObj: T, value: T[keyof T]): keyof T | undefined => {
  return Object.keys(enumObj).find(key => enumObj[key as keyof T] === value) as keyof T | undefined
}
