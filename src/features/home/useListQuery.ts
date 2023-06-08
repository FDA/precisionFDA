import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { toArrayFromObject } from '../../utils/object'
import { APIResource, IMeta, ResourceScope } from './types'

type ListType = { [key: string]: {}; meta: IMeta }
interface IUseListQuery<T> {
  spaceId?: string
  scope?: ResourceScope
  fetchList: any
  resource: APIResource
  params?: {
    [key: string]: string | undefined
  }
  order?: {
    order_by?: string | null
    order_dir?: string | null
  }
  pagination?: {
    perPage?: number
    page?: number
  }
  queryOptions?: UseQueryOptions<T>
  filter?: any
}


export function useListQuery<T>({ fetchList, resource, params = {}, queryOptions, pagination = {}, order = {}, filter = {} }: IUseListQuery<T>) {
  return useQuery<T>(
    [resource, toArrayFromObject(filter), pagination?.page, pagination?.perPage, order?.order_by, order?.order_dir, ...Object.keys(params).map(k => `${k}=${params[k]}`)],
    () => fetchList(toArrayFromObject(filter), { page: pagination?.page, perPage: pagination?.perPage, sortBy: order, ...params }),
    {
      refetchOnWindowFocus: false,
      ...queryOptions,
    },
  )
}
