import { KeysOfUnion } from './generics'
import { cleanObject, translateApiKeys } from './object'
import { camelToSnakeMapping } from './snakeCaseMapping'

export type FilterT<AllowedKeys extends string, AllowedValues = string> = {
  id: AllowedKeys
  value: AllowedValues
}

type FilterParamsFromEntries<
  FilterType extends { id: string, value: any },
  VerboseFilterType = FilterType extends FilterT<infer KeyT, infer ValueT> ? {
    [key in KeyT]: {
      id: KeyT,
      value: ValueT,
    }
  } : never,
  Result = FilterType['id'] extends KeysOfUnion<VerboseFilterType> ? {
    [key in FilterType['id']]: string extends key
      ? FilterType['value']
      : Extract<VerboseFilterType, Record<key, any>>[key]['value']
  } : never
> = Result

export type PaginationInput = {
  perPage: number
  page: number
}

export type SortInput<AllowedKeys extends string> = {
  orderBy: AllowedKeys,
  orderDir: 'ASC' | 'DESC'
}

export function prepareFilterParams<
  FilterType extends { id: string, value: any }
>(filters: FilterType[]): FilterParamsFromEntries<FilterType> {
  return Object.fromEntries(
    filters
      .filter(({ value }) => value !== undefined)
      .map(({ id, value }) => [id, value] as const)
  ) as any
}

export function prepareListFetchArgs<
  FilterType extends {id: string, value: any},
  SortableKeys extends string,
>(
  filters: FilterType[],
  pagination: Partial<PaginationInput>,
  sort: Partial<SortInput<SortableKeys>>
) {
  const mappedFilters = prepareFilterParams(filters)
  const snakeCasePagination = translateApiKeys(camelToSnakeMapping, pagination)
  const snakeCaseSorting = translateApiKeys(camelToSnakeMapping, sort)
  return {
    ...snakeCasePagination,
    ...snakeCaseSorting,
    // TODO(samuel): filters are not merged because they have to be wrapped like this
    // .map(({id, value}) => [`filters[${id}]` as const, value] as const)
    // TODO(samuel): refactor to flat structure
    filters: mappedFilters
  }
}

// TODO(samuel) this is temporary function as soon as │ this transformation is implemented in typescript
                                            // TODO   ▼
// .map(({id, value}) => [`filters[${id}]` as const, value] as const)

export const prepareListFetch = <
  FilterType extends {id: string, value: any},
  SortableKeys extends string,
>(
  filters: FilterType[],
  pagination: Partial<PaginationInput>,
  sort: Partial<SortInput<SortableKeys>>
) => {
  const { filters: outputFilters, ...rest } = prepareListFetchArgs(filters, pagination, sort )
  return cleanObject({
    ...rest,
    ...Object.fromEntries(Object.entries(outputFilters).map(([key, value]) => [`filters[${key}]`, value] as const))
  })
}

// ┌───────────────────────────────┐
// │                               │
// │                               │
// │  PLAYGROUND / Unit-test area  │
// │  Uncomment and hover to test  │
// │                               │
// │                               │
// └───────────────────────────────┘

// const testFilters = [{
//   id: "filter1" as const,
//   value: 34
// }, {
//   id: "filter2" as const,
//   value: false
// }, {
//   id: "filter3" as const,
//   value: 'string'
// }, {
//   id: 'filter4' as const,
//   value: {
//     nestedValue: 'Rick Astley' as const
//   }
// }]

// const testPaginatino = {
//   page: 5,
//   perPage: 20
// }

// const testSortInput = {
//   orderBy: 'filter1' as const,
//   orderDir: 'ASC' as const
// }

// const x = prepareListFetch(testFilters, testPaginatino, testSortInput)
