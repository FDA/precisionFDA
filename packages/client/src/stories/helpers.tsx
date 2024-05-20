import { UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { APIResource } from '../features/home/types'
import { useListQuery } from '../features/home/useListQuery'

export const WithListData = ({ children, resource, fetchList }: { resource: APIResource, fetchList: any , children: (query: UseQueryResult<unknown, unknown>) => React.ReactNode }) => {
  const query = useListQuery({ resource, fetchList })  
  if(!query?.data) return null
  return (<>{children(query)}</>)
}
