/* eslint-disable multiline-ternary */
import { BaseEntity } from '../database/base-entity'
import { wrapMaybeNull, parseRegexFilterFromString, parseEnumValueFromString, parseNumericRange } from '../validation/parsers'
import { MapValueObjectByKey, MapValuesToReturnType } from './generics'
import { ColumnNode } from './sql-json-column-utils'

export type FilterType =
  // Filter for search with LIKE SQL operator
  | 'match'
  // Numeric range filter
  | 'range'
  // Exact filter, used for exact matching and enumerated values
  | 'exact'


export type GetValue = (key: string) => string | undefined
type FilterParser<T>= (value: string | undefined) => T

export type FilterSchemaNode<T = any> = {
  type: FilterType
  // getValue Argument parses query string for instance
  // this argument is required so that filter schema nodes aren't dependant on Koa Ctx
  // Advantage of schema being independent of that is that parsed filter types can be preprocessed and being part of the Koa Ctx
  // Which would not be possible if one of input values if `typeof ctx.query`
  parser: (gv: GetValue) => FilterParser<T>
}

// TODO(samuel) write unit-test for this generic type
export type FilterWithColumnNode<
  EntityT extends BaseEntity,
  FilterSchemaT extends Record<string, FilterSchemaNode>,
  ResolvedFilterSchema = MapValuesToReturnType<MapValuesToReturnType<MapValueObjectByKey<'parser', FilterSchemaT, (...args: any[]) => any>>>,
  Result = {
    [key in keyof ResolvedFilterSchema]: {
      value: ResolvedFilterSchema[key]
      columnNode: ColumnNode<EntityT>
    }
  }[keyof ResolvedFilterSchema]
> = Result

export const bindGetValueToSchema = <FilterSchemaT extends Record<string, FilterSchemaNode>>(
  getValue: GetValue,
  schema: FilterSchemaT,
) =>
  Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, {
    ...value,
    parser: value.parser(getValue),
  }])) as MapValuesToReturnType<MapValueObjectByKey<'parser', FilterSchemaT, (...args: any[]) => any>>

export const wrapFilterParser = <T>(
  parser: FilterParser<T>,
  getValue: GetValue,
) => (key: string) => parser(getValue(key))

export const buildFiltersWithColumnNodes = <
  EntityT extends BaseEntity,
  FilterSchemaT extends Record<string, FilterSchemaNode>,
>(
  filters: Partial<MapValuesToReturnType<MapValuesToReturnType<MapValueObjectByKey<'parser', FilterSchemaT, (...args: any[]) => any>>>>,
  jsonColumnTypes: Partial<Record<keyof FilterSchemaT, {
    sqlColumn: keyof EntityT
    path: Array<string | number>
  }>>,
): Array<FilterWithColumnNode<EntityT, FilterSchemaT>> =>
  Object.entries(filters).map(([key, value]) => key in jsonColumnTypes ? {
    columnNode: {
      ...jsonColumnTypes[key],
      type: 'json' as const,
    },
    value,
  } : {
    columnNode: {
      type: 'standard' as const,
      value: key as keyof EntityT,
    },
    value,
  }) as any

// Useful helpers - reusable filter schema nodes

// NOTE(samuel) all the functions are wrapped in `wrapMaybeNull`, as none of the filters are reuiqred by default to perform API call
export const MATCH_FILTER = {
  type: 'match' as const,
  parser: (getValue: GetValue) => wrapFilterParser(
    wrapMaybeNull(parseRegexFilterFromString),
    getValue,
  ),
}

export const NUMERIC_RANGE_FILTER = {
  type: 'range' as const,
  parser: (getValue: GetValue) => wrapFilterParser(
    wrapMaybeNull(parseNumericRange),
    getValue,
  ),
}

// TODO(samuel) add option to map filters
export const createEnumFilter = <T extends Exclude<string, ''>>(
  allowedValues: T[],
) => ({
  type: 'exact' as const,
  parser: (getValue: GetValue) => wrapFilterParser(
    wrapMaybeNull(parseEnumValueFromString(allowedValues)),
    getValue,
  ),
})