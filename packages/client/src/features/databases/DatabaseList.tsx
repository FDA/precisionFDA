import { ColumnFiltersState, ColumnSizingState, ColumnSort, VisibilityState } from '@tanstack/react-table'
import React, { useEffect } from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { BackLink } from '../../components/Page/PageBackLink'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions, StyledRight } from '../home/home.styles'
import { ResourceHeader } from '../home/show.styles'
import { HomeScope, MetaV2, NOTIFICATION_ACTION } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { getBasePath } from '../home/utils'
import { fetchDatabaseList } from './databases.api'
import { IDatabase } from './databases.types'
import { useDatabaseColumns } from './useDatabaseColumns'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { useQueryClient } from '@tanstack/react-query'
import { useLastWSNotification } from '../../hooks/useToastWSHandler'
import { ActionsMenu } from '../../components/Menu'
import { Refresh } from '../../components/Page/styles'
import { SyncIcon } from '../../components/icons/SyncIcon'

const DBStyledRight = styled(StyledRight)`
  gap: 20px;
`
const NoDatabases = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
`

type ListType = { data: IDatabase[]; meta: MetaV2 }

export const DatabaseList = ({ homeScope, spaceId }: { homeScope?: HomeScope; spaceId?: number }) => {
  const basePath = getBasePath(spaceId)
  if (homeScope && homeScope !== 'me' && homeScope !== 'spaces') {
    return (
      <NoDatabases>
        <div>Scope: &quot;{homeScope}&quot;, does not have any databases.</div>
        <BackLink linkTo="/home/databases?scope=me">Go to the &quot;My&quot; scope</BackLink>
      </NoDatabases>
    )
  }
  const {
    setSortBy,
    sortBy,
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    setColumnVisibility,
    columnVisibility,
  } = useList<ListType>({
    fetchList: fetchDatabaseList,
    resource: 'dbclusters',
    params: {
      spaceId: spaceId || undefined,
      scope: homeScope || undefined,
    },
  })
  const { isLoading, data, error } = query
  const { data: propertiesData } = usePropertiesQuery('dbCluster', homeScope)

  const queryCache = useQueryClient()

  const lastJsonMessage = useLastWSNotification([
      NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
    ])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: ['dbclusters'],
    })
  }, [lastJsonMessage])

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data)
  const { actions, modals } = useDatabaseSelectActions({
    selectedItems: selectedObjects,
    resourceKeys: ['dbclusters'],
  })

  if (error) return <ResouceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            <Button data-variant="primary" data-testid="databases-create-link" as={Link} to={`${basePath}/databases/create`}>
              <DatabaseIcon height={14} /> Create Database
            </Button>
          </QuickActions>
          <DBStyledRight>
            <Button onClick={() => query.refetch()} disabled={query.isFetching}>
              <Refresh $spin={query.isFetching}>
                <SyncIcon height={13} />
              </Refresh>
              Refresh
            </Button>
            <ActionsMenu data-testid="databases-actions-button">
              <ActionsMenuContent actions={actions} />
            </ActionsMenu>
          </DBStyledRight>
        </ActionsRow>
      </ResourceHeader>

      <DatabaseListTable
        homeScope={homeScope}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        data={data?.data}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        setSortBy={setSortBy}
        sortBy={sortBy}
      />
      <ContentFooter>
        <Pagination
          page={data?.meta?.page}
          totalCount={data?.meta?.total}
          totalPages={data?.meta?.totalPages}
          perPage={perPageParam}
          isHidden={false}
          setPage={p => setPageParam(p, true)}
          onPerPageSelect={p => setPerPageParam(p, true)}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const DatabaseListTable = ({
  filters,
  setFilters,
  data,
  properties,
  isLoading,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  columnSizing,
  setColumnSizing,
  columnVisibility,
  setColumnVisibility,
}: {
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  data?: IDatabase[]
  properties?: string[]
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  isLoading: boolean
  homeScope?: HomeScope
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  const col = useDatabaseColumns({ properties })

  return (
    <StyledPageTable>
      <Table<IDatabase>
        isLoading={isLoading}
        data={data || []}
        columns={col}
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
        emptyText="You don't have any databases yet."
      />
    </StyledPageTable>
  )
}
