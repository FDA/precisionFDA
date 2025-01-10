import { useState } from 'react'
import { NumberParam, UrlUpdateType, useQueryParam, withDefault } from 'use-query-params'

export interface PaginationParams {
  page: number
  perPage: number
  setPerPage: (n: number) => void
  setPage: (n: number) => void
}

const defaultPage = 1
const defaultPerPageCount = 3

export function usePaginationState() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  return { page, perPage, setPerPage, setPage }
}

 /** @deprecated use usePaginationParamsV2 instead when endpoints using this are written in Node */
export function usePaginationParams(initialPerPageCount?: number) {
  const [pageParam, setPageParam] = useQueryParam(
    'page',
    withDefault(NumberParam, defaultPage),
  )
  const [perPageParam, setPerPageParam] = useQueryParam(
    'perPage',
    withDefault(NumberParam, initialPerPageCount ?? defaultPerPageCount),
  )

  const handleSetPageParam = (v: number, updateType: UrlUpdateType) => {
    if(v === 1) {
      setPageParam(undefined, updateType)
    } else {
      setPageParam(v, updateType)
    }
  }

  const handleSetPerPageParam = (v: number, updateType: UrlUpdateType) => {
    setPageParam(undefined)
    setPerPageParam(v, 'pushIn')
  }

  return { pageParam, perPageParam, setPerPageParam: handleSetPerPageParam, setPageParam: handleSetPageParam }
}

export function usePaginationParamsV2(initialPageSizeCount?: number) {
  const [pageParam, setPageParam] = useQueryParam(
    'page',
    withDefault(NumberParam, defaultPage),
  )
  const [pageSizeParam, setPageSizeParam] = useQueryParam(
    'pageSize',
    withDefault(NumberParam, initialPageSizeCount ?? defaultPerPageCount),
  )

  const handleSetPageParam = (v: number, updateType: UrlUpdateType) => {
    if(v === 1) {
      setPageParam(undefined, updateType)
    } else {
      setPageParam(v, updateType)
    }
  }

  const handleSetPageSizeParam = (v: number, updateType: UrlUpdateType) => {
    setPageParam(undefined)
    setPageSizeParam(v, 'pushIn')
  }

  return { pageParam, pageSizeParam, setPageSizeParam: handleSetPageSizeParam, setPageParam: handleSetPageParam }
}
