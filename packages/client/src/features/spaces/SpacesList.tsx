import React, { useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { compactScrollBarV2, Filler, PageTitle } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import { EmptyTable, ReactTableStyles } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { UserLayout } from '../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { QuickActions } from '../home/home.styles'
import { IFilter, IMeta, KeyVal } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { spacesListRequest } from './spaces.api'
import { columnFilters, ISpace } from './spaces.types'
import { useSpaceHiddenMutation } from './useSpaceHiddenMutation'
import { useSpacesColumns } from './useSpacesColumns'

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
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, boolean> | undefined>({})
  const { sortBy, sort, setSortBy } = useOrderByParams({
    onSetSortBy: () => setSelectedIndexes({}),
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const { hiddenColumns, saveHiddenColumns } = useHiddenColumnLocalStorage(resource)
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
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        data={data?.spaces}
        isLoading={isLoading}
        setSortBy={setSortBy}
        sortBy={sortBy}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        isSiteAdmin={userCanAdministerSite}
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
  overflow-x: auto;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;

  ${compactScrollBarV2}

  ${ReactTableStyles} {
    margin-inline: auto;
    width: min(100% - 32px, 100%);
    font-size: 14px;
    .table {
      border-left: 1px solid var(--c-layout-border);
      .tr {
        height: 56px;
        .td {
          position: relative;
          padding: 10px;
          height: auto;
          justify-content: flex-start;
          align-items: flex-start;
        }
        .td.selection {
          padding: 10px 5px;
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
  selectedRows,
  setSelectedRows,
  hiddenColumns,
  saveHiddenColumns,
  isSiteAdmin,
}: {
  data?: ISpace[]
  filters: IFilter[]
  setFilters: (val: IFilter[]) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  colWidths: KeyVal
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  saveHiddenColumns: (cols: string[]) => void
  hiddenColumns: string[]
  isSiteAdmin: boolean
}) => {
  const columns = useSpacesColumns({ colWidths, isSiteAdmin })
  const mdata = useMemo(() => data || [], [data])
  return (
    <StyledTable>
      <Table<ISpace>
        name="spaces"
        columns={columns}
        data={mdata}
        loading={isLoading}
        saveColumnResizeWidth={saveColumnResizeWidth}
        isSelectable={isSiteAdmin}
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        manualFilters
        emptyComponent={<EmptyTable>You have no spaces.</EmptyTable>}
        isColsResizable
        isSortable
        isFilterable
        loadingComponent={<div>Loading...</div>}
        sortByPreference={sortBy}
        setSortByPreference={a => setSortBy(a)}
        filters={filters}
        setFilters={setFilters}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />
      <Filler $size={16} />
    </StyledTable>
  )
}

export default SpacesList
