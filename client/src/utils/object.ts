import { ExtractNonNullable, MapKeysByObj, MapValuesByFn } from './generics'

export const translateApiKey = <ObjT, OutputKeyT>(translationMap: Record<keyof ObjT, OutputKeyT>, key: keyof ObjT) => translationMap[key]

export const translateApiKeys = <OriginalFmt, Mapper extends {}>(translationMap: Mapper, object: OriginalFmt) =>
  Object.fromEntries(
    Object.entries(object)
      .map(([key, val]) => 
        [translationMap[key as any as keyof Mapper], val],
      ),
  ) as any as MapKeysByObj<OriginalFmt, Mapper>

/**
 * Removes properties with `undefined` or 'null' values from the given object.
 *
 * Given an object, this function will return a new object where all properties with
 * `undefined` values are excluded. This helps in maintaining only the properties with
 * meaningful values, ensuring cleaner data structures.
 *
 * @template T - Type of the input object that extends from an empty object type.
 * @param {T} obj - The object to be cleaned.
 * @returns {ExtractNonNullable<T>} - Returns a new object of type T with properties having `undefined` and 'null' values removed.
 * 
 * @example
 *   const sampleObj = { a: 1, b: undefined, c: "test" };
 *   const cleanedObj = cleanObject(sampleObj); // { a: 1, c: "test" }
 */
export const cleanObject = <T extends {}>(obj: T) => Object.fromEntries(Object.entries(obj).filter(([_, val]) => val != null)) as ExtractNonNullable<T>

export const toArrayFromObject = <ValueT extends any>(ob: Record<string, NonNullable<ValueT>>) => Object.entries(ob).map(([id, value]) => ({ id, value }))
export const toObjectFromArray = (arr: Array<{ id: string | number, value: any }>) => Object.fromEntries(arr.map(({ id, value }) => [id, value]))
export function getSelectedObjectsFromIndexes<IdType extends string | number = string, T extends { id: IdType } = {id: IdType}>(selectedIndexes?: Record<string, boolean>, objectList?: T[]) {
  return objectList?.filter((_, index) => selectedIndexes?.[index.toString()]) ?? []
}
export const mapValues = <
  T,
  MapperT extends (arg: any) => any,
>(obj: T, mapper: MapperT) =>
  Object.fromEntries(Object.entries(([key, value]: [any, any]) => [key, mapper(value)])) as MapValuesByFn<T, MapperT>
