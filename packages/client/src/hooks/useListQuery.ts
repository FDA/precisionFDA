import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { PaginationInput, SortInput } from '../utils/filters'
import { toArrayFromObject } from '../utils/object'

type UseListQueryParams<T extends Record<string, any>, SortT = SortInput<Extract<keyof T, string>>> = {
  resource: string
  fetchList: Function
  order?: Partial<SortT>
  pagination?: Partial<PaginationInput>
  queryOptions?: UseQueryOptions<T>
  filter?: any
  additionalParams?: Partial<Record<string, string>>
}

export function useListQuery<T>({
  resource,
  fetchList,
  additionalParams = {},
  queryOptions,
  pagination = {},
  order = {},
  filter = {},
}: UseListQueryParams<T>) {
  const cacheKey = [
    resource,
    toArrayFromObject(filter),
    pagination?.page,
    pagination?.perPage,
    order?.orderBy,
    order?.orderDir,
    Object.entries(additionalParams).map(([_, v]) => v),
  ]
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => fetchList(toArrayFromObject(filter), pagination, order),
    refetchOnWindowFocus: false,
    ...queryOptions,
  })
  return {
    query,
    cacheKey,
  }
}

