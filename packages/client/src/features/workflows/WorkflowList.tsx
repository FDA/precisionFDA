import { ColumnDefResolved, ColumnFiltersState, ColumnSizingState, ColumnSort, VisibilityState } from '@tanstack/react-table'
import React from 'react'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { useWorkflowColumns } from './useWorkflowColumns'
import { useWorkflowListActions } from './useWorkflowListActions'
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { fetchWorkflowList } from './workflows.api'
import { IWorkflow } from './workflows.types'
import { StyledPageTable } from '../../components/Table/components/styles'

type ListType = { workflows: IWorkflow[]; meta: IMeta }

export const WorkflowList = ({
  homeScope,
  spaceId,
  isContributorOrHigher,
}: {
  homeScope?: HomeScope
  spaceId?: number
  isContributorOrHigher?: boolean
}) => {
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const {
    sortBy,
    setSortBy,
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
    resetSelected,
    columnVisibility,
    setColumnVisibility,
  } = useList<ListType>({
    fetchList: fetchWorkflowList,
    resource: 'workflows',
    params: {
      spaceId: spaceId || undefined,
      scope: homeScope || undefined,
    },
  })
  const { isLoading, data, error } = query
  const { data: propetiesData } = usePropertiesQuery('workflowSeries', homeScope, spaceId)

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.workflows)
  const actions = useWorkflowSelectActions({
    homeScope,
    spaceId,
    selectedItems: selectedObjects,
    resourceKeys: ['workflows'],
    resetSelected,
  })
  const listActions = useWorkflowListActions({ spaceId })
  const message = homeScope === 'spaces' && 'To perform other actions on this workflow, access it from the Space'

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {homeScope === 'me' && (
              <Button
                data-variant="primary"
                data-testid="home-workflows-create-link"
                as="a"
                data-turbolinks="false"
                href="/workflows/new"
              >
                <PlusIcon height={12} /> Create Workflow
              </Button>
            )}

            {spaceId && isContributorOrHigher && (
              <Button
                data-variant="primary"
                data-testid="spaces-workflows-add-button"
                onClick={() => listActions['Add Workflow']?.func({ showModal: true })}
              >
                <PlusIcon height={12} /> Add Workflow
              </Button>
            )}
          </QuickActions>
          <Dropdown trigger="click" content={<ActionsDropdownContent actions={actions} message={message} />}>
            {dropdownProps => (
              <ActionsButton {...dropdownProps} data-testid="home-workflows-actions-button" active={dropdownProps.isActive} />
            )}
          </Dropdown>
        </ActionsRow>
      </ResourceHeader>

      <WorkflowListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        workflows={data?.workflows}
        properties={propetiesData?.keys}
        isLoading={isLoading}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        sortBy={sortBy}
        setSortBy={setSortBy}
        columnSizing={colWidths}
        setColumnSizing={saveColumnResizeWidth}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <ContentFooter>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={false}
          isPreviousData={data?.meta?.pagination?.prev_page !== null}
          isNextData={data?.meta?.pagination?.next_page !== null}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      {listActions['Create Workflow']?.modal}
      {listActions['Add Workflow']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Delete']?.modal}
      {actions['Export to']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
    </ErrorBoundary>
  )
}

export const WorkflowListTable = ({
  isAdmin,
  filters,
  setFilters,
  workflows,
  properties,
  isLoading,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  homeScope,
  columnSizing,
  setColumnSizing,
  setColumnVisibility,
  columnVisibility,
}: {
  isAdmin?: boolean
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  workflows?: IWorkflow[]
  properties?: string[]
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  isLoading: boolean
  homeScope?: HomeScope
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  function filterColsByScope(c: ColumnDefResolved<IWorkflow>) {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessorKey === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessorKey === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessorKey === 'featured')
      )
    )
  }
  // @ts-expect-error filter
  const col = useWorkflowColumns({ isAdmin, properties }).filter(filterColsByScope)

  return (
    <StyledPageTable>
      <Table<IWorkflow>
        isLoading={isLoading}
        data={workflows || []}
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
        emptyText="You don't have any workflows yet."
      />
    </StyledPageTable>
  )
}
