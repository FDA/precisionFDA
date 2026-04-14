import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { type SortParams, toSortConfig } from '@/types/sorting'
import { toArrayFromObject } from '@/utils/object'
import type { APIResource, FilterVal, HomeScope, IFilter } from './types'
import type { OrderBy, Params } from './utils'

interface IUseListQuery<T> {
  spaceId?: string
  scope?: HomeScope
  fetchList: (filter: IFilter[], params: Params, scope?: HomeScope) => Promise<T>
  resource: APIResource
  params?: Params
  sort?: SortParams
  pagination?: {
    perPage?: number
    page?: number
  }
  queryOptions?: UseQueryOptions<T>
  filter?: Record<string, FilterVal>
}

export function useListQuery<T>({
  fetchList,
  resource,
  scope,
  params = {},
  queryOptions,
  pagination = {},
  sort = {},
  filter = {},
}: IUseListQuery<T>) {
  const sortBy = toSortConfig<OrderBy>(sort)

  return useQuery<T>({
    queryKey: [
      resource,
      scope,
      toArrayFromObject(filter),
      pagination?.page,
      pagination?.perPage,
      sort?.order_by,
      sort?.order_dir,
      ...Object.keys(params).map(k => `${k}=${params[k]}`),
    ],
    queryFn: () =>
      fetchList(
        toArrayFromObject(filter),
        {
          page: pagination?.page,
          perPage: pagination?.perPage,
          sortBy,
          ...params,
        },
        scope,
      ),
    refetchOnWindowFocus: false,
    ...queryOptions,
  })
}
