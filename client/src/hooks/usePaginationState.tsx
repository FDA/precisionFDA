import { useState } from 'react'
import { NumberParam, UrlUpdateType, useQueryParam, withDefault } from 'use-query-params'

const defaultPage = 1
const defaultPerPageCount = 20

export function usePaginationState() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  return { page, perPage, setPerPage, setPage }
}

export function usePaginationParams(initialPerPageCount?: number) {
  const [pageParam, setPageParam] = useQueryParam(
    'page',
    withDefault(NumberParam, defaultPage),
  )
  const [perPageParam, setPerPageParam] = useQueryParam(
    'per_page',
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
