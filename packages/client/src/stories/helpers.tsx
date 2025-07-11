import { UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { APIResource, IFilter } from '../features/home/types'
import { useListQuery } from '../features/home/useListQuery'
import { Params } from '../features/home/utils'

interface WithListDataProps<T> {
  resource: APIResource
  fetchList: (filter: IFilter[], params: Params) => Promise<T>
  children: (query: UseQueryResult<T, unknown>) => React.ReactNode
}

export function WithListData<T>({ 
  children, 
  resource, 
  fetchList,
}: WithListDataProps<T>) {
  const query = useListQuery<T>({ 
    resource, 
    fetchList: fetchList as (filter: IFilter[], params: Params) => Promise<T>,
  })  
  if(!query?.data) return null
  return (<>{children(query)}</>)
}
