import { ColumnDefResolved, ColumnFiltersState, ColumnSizingState, ColumnSort, VisibilityState } from '@tanstack/react-table'
import React, { useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { compactScrollBarV2, PageTitle } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { UserLayout } from '../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { QuickActions } from '../home/home.styles'
import { IMeta } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { spacesListRequest } from './spaces.api'
import { columnFilters, ISpace } from './spaces.types'
import { useSpaceHiddenMutation } from './useSpaceHiddenMutation'
import { useSpacesColumns } from './useSpacesColumns'
import { useListSelect } from '../home/useListSelect'

const SpacesHeader = styled.div`
  display: flex;
  padding: 32px 20px;
  justify-content: space-between;
`

const SpacesQuickActions = styled(QuickActions)`
  align-items: center;
`

type ListType = { spaces: ISpace[]; meta: IMeta }

function getWindowHWidth() {
  const { innerWidth: width } = window
  return {
    width,
  }
}

export function useWindowWidth() {
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

const SpacesList = () => {
  const resource = 'spaces'
  const user = useAuthUser()
  const pagination = usePaginationParams()
  // const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { sortBy, sort, setSortBy } = useOrderByParams({
    onSetSortBy: () => setSelectedIndexes({}),
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(resource)
  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: columnFilters,
    onSetFilter: () => {
      setSelectedIndexes({})
      pagination.setPageParam(1, 'replaceIn')
    },
  })

  const query = useListQuery<ListType>({
    fetchList: spacesListRequest,
    resource,
    pagination: {
      page: pagination.pageParam,
      perPage: pagination.perPageParam,
    },
    order: { order_by: sort.order_by, order_dir: sort.order_dir },
    filter: filterQuery,
  })

  const { isLoading, data, error } = query
  const meta = data?.meta
  const userCanAdministerSite = !!user?.can_administer_site

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  const spaceHiddenMutation = useSpaceHiddenMutation()
  const hideSpaces = () => {
    const spaces = getSelectedObjectsFromIndexes(selectedIndexes, data?.spaces) as unknown as ISpace[]
    const ids = spaces.map(s => s.id)
    spaceHiddenMutation.mutateAsync({ ids, hidden: true })
    setSelectedIndexes({})
  }

  return (
    <UserLayout innerScroll>
      <SpacesHeader>
        <PageTitle>Spaces</PageTitle>
        <SpacesQuickActions>
          {userCanAdministerSite && (
            <Button data-variant="primary" disabled={Object.keys(selectedIndexes || {}).length === 0} onClick={hideSpaces}>
              Hide spaces
            </Button>
          )}
          <Button data-variant="primary" as={Link} to="/spaces/new">
            Create new space
          </Button>
        </SpacesQuickActions>
      </SpacesHeader>

      <TableTable
        userCanAdministerSite={userCanAdministerSite}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        data={data?.spaces}
        isLoading={isLoading}
        setSortBy={setSortBy}
        sortBy={sortBy}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <ContentFooter>
        <Pagination
          page={meta?.pagination?.current_page}
          totalCount={meta?.pagination?.total_count}
          totalPages={meta?.pagination?.total_pages}
          perPage={pagination.perPageParam}
          isHidden={false}
          setPage={p => pagination.setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => pagination.setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </UserLayout>
  )
}

const StyledTable = styled.div`
  font-size: 14px;
  overflow-x: auto;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;

  ${compactScrollBarV2}
`

const TableTable = ({
  userCanAdministerSite,
  filters,
  data,
  isLoading,
  setFilters,
  setSortBy,
  sortBy,
  selectedRows,
  setSelectedRows,
  columnSizing,
  setColumnSizing,
  columnVisibility,
  setColumnVisibility,
}: {
  userCanAdministerSite?: boolean,
  data?: ISpace[]
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  isLoading: boolean
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  function filterCols(c: ColumnDefResolved<ISpace>) {
    // Check if any of the conditions is true, then hide the column
    return !(!userCanAdministerSite && (c.accessorKey === 'hidden' || c.id === 'select'))
  }
  const columns = useSpacesColumns().filter(filterCols)
  return (
    <StyledTable>
      <Table<ISpace>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        columnSizing={columnSizing}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows ?? {}}
        setSelectedRows={setSelectedRows}
        setColumnFilters={setFilters}
        columnSortBy={sortBy}
        setColumnSortBy={setSortBy}
        columnFilters={filters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        emptyText="You don't have access to any spaces yet."
      />
    </StyledTable>
  )
}

export default SpacesList
