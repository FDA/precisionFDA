/**
 * @fileoverview This file contains utility functions for working with objects.
 * @see https://github.com/dnanexus/precision-fda/blob/main/packages/client/src/utils/object.ts
 */

export type NonNullableProperties<T> = { [P in keyof T]: NonNullable<T[P]> };

/**
 * Removes properties with `undefined` and `null` values from an object.
 * @template T - Type of the input object that extends from an empty object type.
 * @param {T} obj - The object to be cleaned.
 * @returns {ExtractNonNullable<T>} - Returns a new object of type T with properties having `undefined` and 'null' values removed.
 * 
 * @example
 *   const sampleObj = { a: 1, b: undefined, c: "test" };
 *   const cleanedObj = cleanObject(sampleObj); // { a: 1, c: "test" }
 */
export const cleanObject = <T extends object>(obj: T) => Object.fromEntries(Object.entries(obj).filter(([, val]) => val != null)) as T

export const toArrayFromObject = <ValueT>(ob: Record<string, NonNullable<ValueT>>) => Object.entries(ob).map(([id, value]) => ({ id, value }))
export const toObjectFromArray = (arr: Array<{ id: string | number, value: unknown }>) => Object.fromEntries(arr.map(({ id, value }) => [id, value]))
export function getSelectedObjectsFromIndexes<IdType extends string | number, T extends { id: IdType } = {id: IdType}>(selectedIndexes?: Record<string, boolean>, objectList?: T[]) {
  return objectList?.filter((_, index) => selectedIndexes?.[index.toString()]) ?? []
}
