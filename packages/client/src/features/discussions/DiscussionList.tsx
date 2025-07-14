import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { toArrayFromObject } from '../../utils/object'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ResourceHeader } from '../home/show.styles'
import { HomeScope, MetaV2 } from '../home/types'
import { useList } from '../home/useList'
import { fetchDiscussionsRequest } from './api'
import { Discussion } from './discussions.types'
import { useDiscussionColumns } from './useDiscussionColumns'

type ListType = { data: Discussion[]; meta: MetaV2 }

const DiscussionListTable = ({
  discussions,
  homeScope,
  isLoading,
  columnFilters,
  setColumnFilters,
  sortBy,
  selectedRows,
  setSelectedRows,
  columnVisibility,
  setColumnVisibility,
  columnSizing,
  setColumnSizing,
}: {
  isLoading: boolean
  discussions: Discussion[]
  homeScope?: HomeScope
  columnFilters: ColumnFiltersState
  setColumnFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  selectedRows?: RowSelectionState
  setSelectedRows: (ids: RowSelectionState) => void
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  columnVisibility: VisibilityState
  setColumnVisibility: (cols: VisibilityState) => void
}) => {
  function filterColsByScope(c: ColumnDefResolved<Discussion>): boolean {
    // Hide 'location' for all homeScopes except 'spaces'.
    return !(homeScope !== 'spaces' && c.accessorKey === 'note.scope')
  }

  // @ts-expect-error: type is broken from react-table library
  const col = useDiscussionColumns().filter(filterColsByScope)

  return (
    <StyledPageTable>
      <Table<Discussion>
        isLoading={isLoading}
        data={discussions || []}
        columns={col}
        columnSizing={columnSizing || {}}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows ?? {}}
        setSelectedRows={setSelectedRows}
        columnSortBy={sortBy}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        setColumnFilters={setColumnFilters}
        columnFilters={columnFilters}
        emptyText="No one's started a discussion yet."
        enableColumnFilters={false}
      />
    </StyledPageTable>
  )
}

export const DiscussionList = ({
  spaceId,
  scope,
  canCreateDiscussion,
}: {
  spaceId?: number
  scope?: HomeScope
  canCreateDiscussion?: boolean
}) => {
  const {
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    setColumnVisibility,
    columnVisibility,
    filterQuery,
    setSearchFilter,
    setPageParam,
    setPerPageParam,
    sortBy,
    setSortBy,
  } = useList<ListType>({
    fetchList: fetchDiscussionsRequest,
    resource: 'discussions',
    params: {
      entityScope: spaceId ? `space-${spaceId}` : scope === 'spaces' ? 'spaces' : 'everybody',
    },
  })

  const location = useLocation()

  if (query.error) return <ResouceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {canCreateDiscussion && (
              <Button
                data-variant="primary"
                data-turbolinks="false"
                data-testid="space-discussion-create-link"
                as={Link}
                to={`${location.pathname}/create`}
              >
                <PlusIcon height={12} /> Start a Discussion
              </Button>
            )}
          </QuickActions>
        </ActionsRow>
      </ResourceHeader>
      <DiscussionListTable
        homeScope={scope}
        discussions={query?.data?.data ?? []}
        isLoading={query.isLoading}
        selectedRows={selectedIndexes}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        setSelectedRows={setSelectedIndexes}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        columnFilters={toArrayFromObject(filterQuery).filter(i => i.value !== undefined)}
        setColumnFilters={setSearchFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <ContentFooter>
        <Pagination
          page={query.data?.meta.page}
          totalCount={query.data?.meta.total}
          totalPages={query.data?.meta.totalPages}
          perPage={query.data?.meta.pageSize}
          isHidden={false}
          showPerPage={false}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </>
  )
}
