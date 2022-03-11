import { useState } from 'react'
import { NumberParam, UrlUpdateType, useQueryParam, withDefault } from 'use-query-params'

export interface PaginationState {
  page: number
  setPage: any
  perPage: number
  setPerPage: any
}

export function usePaginationState(): PaginationState {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  return { page, perPage, setPerPage, setPage }
}


export interface PaginationParams {
  pageParam: number,
  setPageParam: any,
  perPageParam: number,
  setPerPageParam: any,
}

export function usePaginationParams(): PaginationParams {
  const [pageParam, setPageParam] = useQueryParam(
    'page',
    withDefault(NumberParam, 1),
  )
  const [perPageParam, setPerPageParam] = useQueryParam(
    'per_page',
    withDefault(NumberParam, 10),
  )

  const handleSetPageParam = (v: number, updateType: UrlUpdateType) => {
    if(v === 1) {
      setPageParam(undefined, updateType)
    } else {
      setPageParam(v, updateType)
    }
  }

  const handleSetPerPageParam = (v: number, updateType: UrlUpdateType) => {
    if(v === 10) {
      setPerPageParam(undefined)
    } else {
      setPageParam(undefined)
      setPerPageParam(v, 'pushIn')
    }
  }

  return { pageParam, perPageParam, setPerPageParam: handleSetPerPageParam, setPageParam: handleSetPageParam }
}
