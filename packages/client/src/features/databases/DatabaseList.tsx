import { useQueryClient } from '@tanstack/react-query'
import type { ColumnFiltersState, ColumnSizingState, ColumnSort, VisibilityState } from '@tanstack/react-table'
import { type ComponentProps, type ComponentType, useEffect } from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { DatabaseIcon } from '@/components/icons/DatabaseIcon'
import { SyncIcon } from '@/components/icons/SyncIcon'
import { ActionsMenu } from '@/components/Menu'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { BackLink } from '@/components/Page/PageBackLink'
import { Refresh } from '@/components/Page/styles'
import { Pagination } from '@/components/Pagination'
import { StyledPageTable } from '@/components/Table/components/styles'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../components/Table'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions, StyledRight } from '../home/home.styles'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import { ResourceHeader } from '../home/show.styles'
import { type HomeScope, type MetaV2, NOTIFICATION_ACTION } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { getBasePath } from '../home/utils'
import { fetchDatabaseList } from './databases.api'
import type { IDatabase } from './databases.types'
import { useDatabaseColumns } from './useDatabaseColumns'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'

const DBStyledRight: ComponentType<ComponentProps<typeof StyledRight>> = styled(StyledRight)`
  gap: 20px;
`
const NoDatabases: ComponentType<ComponentProps<'div'>> = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
`

type ListType = { data: IDatabase[]; meta: MetaV2 }
type DatabaseListProps = { homeScope?: HomeScope; spaceId?: number }

export const DatabaseList = ({ homeScope, spaceId }: DatabaseListProps) => {
  if (homeScope && homeScope !== 'me' && homeScope !== 'spaces') {
    return (
      <NoDatabases>
        <div>Scope: &quot;{homeScope}&quot;, does not have any databases.</div>
        <BackLink linkTo="/home/databases?scope=me">Go to the &quot;My&quot; scope</BackLink>
      </NoDatabases>
    )
  }

  return <DatabaseListContent homeScope={homeScope} spaceId={spaceId} />
}

const DatabaseListContent = ({ homeScope, spaceId }: DatabaseListProps) => {
  const basePath = getBasePath(spaceId)

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

  const lastJsonMessage = useLastWSNotification([NOTIFICATION_ACTION.DB_CLUSTER_UPDATED])

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

  if (error) return <ResourceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            <Button
              data-variant="primary"
              data-testid="databases-create-link"
              as={Link}
              to={`${basePath}/databases/create`}
            >
              <DatabaseIcon height={14} /> Create Database
            </Button>
          </QuickActions>
          <DBStyledRight>
            <Button
              onClick={() => {
                void query.refetch()
              }}
              disabled={query.isFetching}
            >
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
          setPage={(p: number): void => setPageParam(p, true)}
          onPerPageSelect={(p: number): void => setPerPageParam(p, true)}
        />
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
