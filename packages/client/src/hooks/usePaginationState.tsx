import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export interface PaginationParams {
  page: number
  perPage: number
  setPerPage: (n: number) => void
  setPage: (n: number) => void
}

const defaultPage = 1
const defaultPerPageCount = 20

export function usePaginationState() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  return { page, perPage, setPerPage, setPage }
}

/** @deprecated use usePaginationParamsV2 instead when endpoints using this are written in Node */
export function usePaginationParams(resourceName?: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [userPerPage, setUserPerPage] = useLocalStorage<Record<string, number>>('userPerPage', {
    [resourceName || 'default']: defaultPerPageCount,
  })

  const pageParam = Number(searchParams.get('page')) || defaultPage
  const perPageParam = userPerPage[resourceName || 'default'] || defaultPerPageCount

  const handleSetPageParam = (v: number | undefined, replace: boolean = false) => {
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)
        if (v === 1 || v === undefined) {
          newParams.delete('page')
        } else {
          newParams.set('page', String(v))
        }
        return newParams
      },
      { replace },
    )
  }

  const handleSetPerPageParam = (v: number, replace: boolean = false) => {
    if (resourceName) {
      setUserPerPage({ ...userPerPage, [resourceName]: v })
    }
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('page')
        newParams.set('per_page', String(v))
        return newParams
      },
      { replace },
    )
  }

  return {
    pageParam,
    perPageParam,
    setPerPageParam: handleSetPerPageParam,
    setPageParam: handleSetPageParam,
  }
}

export function usePaginationParamsV2() {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageParam = Number(searchParams.get('page')) || defaultPage
  const pageSizeParam = Number(searchParams.get('pageSize')) || defaultPerPageCount

  const handleSetPageParam = (v: number, replace: boolean = false) => {
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)
        if (v === 1) {
          newParams.delete('page')
        } else {
          newParams.set('page', String(v))
        }
        return newParams
      },
      { replace },
    )
  }

  const handleSetPageSizeParam = (v: number) => {
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('page')
        newParams.set('pageSize', String(v))
        return newParams
      },
      { replace: false },
    )
  }

  return {
    pageParam,
    pageSizeParam,
    setPageSizeParam: handleSetPageSizeParam,
    setPageParam: handleSetPageParam,
  }
}
