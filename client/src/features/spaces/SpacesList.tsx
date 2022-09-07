import React, { useMemo, useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../components/Button'
import { PageTitle } from '../../components/Page/styles'
import { hidePagination, Pagination } from '../../components/Pagination'
import { EmptyTable, ReactTableStyles } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { StyledPaginationSection } from '../home/home.styles'
import { IFilter, IMeta, KeyVal } from '../home/types'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useFilterParams } from '../home/useFilterState'
import { useOrderByState } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { toArrayFromObject } from '../../utils/object'
import { useListQuery } from '../home/useListQuery'
import { spacesListRequest } from './spaces.api'
import { columnFilters, ISpace } from './spaces.types'
import { useSpacesColumns } from './useSpacesColumns'

const SpacesHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 32px 20px;
  justify-content: space-between;
`

type ListType = { spaces: ISpace[]; meta: IMeta }

function getWindowHWidth() {
  const { innerWidth: width } = window
  return {
    width,
  }
}

export default function useWindowWidth() {
  const [windowWidth, setWindowDimensions] = useState(getWindowHWidth())

  useLayoutEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowHWidth())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
} 

export const Spaces2List = () => {
  const resource = 'spaces'
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sort, sortBy, setSortBy } = useOrderByState({ defaultOrder: { order_by: 'created_at', order_dir: 'DESC' }})
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const { filterQuery, setSearchFilter } = useFilterParams({ filters: columnFilters })

  const query = useListQuery<ListType>({
    fetchList: spacesListRequest,
    resource,
    pagination: { page: pageParam, perPage: perPageParam },
    order: { order_by: sort.order_by, order_dir: sort.order_dir },
    filter: filterQuery,
  })
  
  const { status, data, error } = query
  const pagination = data?.meta?.pagination

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <>
      <SpacesHeader>
        <PageTitle>Spaces</PageTitle>
        <ButtonSolidBlue as={Link} to="/spaces/new">
          Create new space
        </ButtonSolidBlue>
      </SpacesHeader>

      <TableTable
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        data={data?.spaces}
        isLoading={status === 'loading'}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}/>
      
      <StyledPaginationSection>
        {pagination && <Pagination
          page={pagination?.current_page}
          totalCount={pagination?.total_count}
          totalPages={pagination?.total_pages}
          perPage={perPageParam}
          hide={hidePagination(
            query.isFetched,
            data?.spaces?.length,
            pagination?.total_pages,
            )}
            isPreviousData={pagination?.prev_page !== null}
            isNextData={pagination?.next_page !== null}
            setPage={setPageParam}
            onPerPageSelect={setPerPageParam}
        />}
      </StyledPaginationSection>
    </>
  )
}

const StyledTable = styled.div`
  ${ReactTableStyles} {
    font-size: 14px;
    .table {
      .tr {
        height: 56px;
        .td {
          position: relative;
          padding: 10px;
          height: auto;
          justify-content: flex-start;
          align-items: flex-start;
        }
      }
    }
  }
`

const TableTable = ({
  filters,
  data,
  isLoading,
  setFilters,
  setSortBy,
  sortBy,
  saveColumnResizeWidth,
  colWidths,
}: {
  data?: ISpace[]
  filters: IFilter[]
  setFilters: (val: IFilter[]) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing']
  ) => void

}) => {
  const columns = useSpacesColumns({ colWidths, isAdmin: false })
  const mdata = useMemo(() => data || [], [data])
  return (
    <StyledTable>
      <Table<ISpace>
        name="spaces"
        columns={columns}
        data={mdata}
        loading={isLoading}
        saveColumnResizeWidth={saveColumnResizeWidth}
        manualFilters
        emptyComponent={<EmptyTable>You have no spaces.</EmptyTable>}
        isColsResizable
        isSortable
        isFilterable
        loadingComponent={<div>Loading...</div>}
        sortByPreference={sortBy}
        setSortByPreference={(a) => setSortBy(a)}
        filters={filters}
        setFilters={setFilters}
      />
    </StyledTable>
  )
}
