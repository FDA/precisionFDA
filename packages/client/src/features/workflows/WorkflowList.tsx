import React, { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Column, SortingRule, UseResizeColumnsState } from 'react-table'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import {
  ActionsRow,
  QuickActions,
  StyledHomeTable,
} from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, HomeScope } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { useWorkflowColumns } from './useWorkflowColumns'
import { useWorkflowListActions } from './useWorkflowListActions'
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { fetchWorkflowList } from './workflows.api'
import { IWorkflow } from './workflows.types'
import { Button } from '../../components/Button'

type ListType = { workflows: IWorkflow[]; meta: IMeta }

export const WorkflowList = ({
  homeScope,
  spaceId,
}: {
  homeScope?: HomeScope
  spaceId?: string
}) => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (id: string) => navigate(`/home/workflows/${id}`)
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
    hiddenColumns,
    saveHiddenColumns,
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

  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.workflows,
  )
  const actions = useWorkflowSelectActions({
    homeScope,
    spaceId,
    selectedItems: selectedObjects,
    resourceKeys: ['workflows'],
    resetSelected,
  })
  const listActions = useWorkflowListActions({ spaceId })
  const message =
    homeScope === 'spaces' &&
    'To perform other actions on this workflow, access it from the Space'

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {homeScope === 'me' && (
              <Button
                data-variant='primary'
                data-testid="home-workflows-create-link"
                as="a"
                data-turbolinks="false"
                href="/workflows/new"
              >
                <PlusIcon height={12} /> Create Workflow
              </Button>
            )}

            {spaceId && (
              <Button
                data-variant='primary'
                data-testid="spaces-workflows-add-button"
                onClick={() =>
                  listActions['Add Workflow']?.func({ showModal: true })
                }
              >
                <PlusIcon height={12} /> Add Workflow
              </Button>
            )}
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent actions={actions} message={message} />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                data-testid="home-workflows-actions-button"
                active={dropdownProps.isActive}
              />
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
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        sortBy={sortBy}
        setSortBy={setSortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
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
  workflows,
  properties,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  homeScope,
  saveColumnResizeWidth,
  colWidths,
  hiddenColumns,
  saveHiddenColumns,
}: {
  isAdmin?: boolean
  filters: IFilter[]
  workflows?: IWorkflow[]
  properties?: string[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  homeScope?: HomeScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
  saveHiddenColumns: (cols: string[]) => void
  hiddenColumns: string[]
}) => {
  const location = useLocation()

  function filterColsByScope(c: Column<IWorkflow>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (homeScope === 'me' && c.accessor === 'added_by') ||
      
      // Hide 'location' for all homeScopes except 'spaces'.
      (homeScope !== 'spaces' && c.accessor === 'location') ||
      
      // Hide 'featured' for all homeScopes except 'everybody'.
      (homeScope !== 'everybody' && c.accessor === 'featured')
    )
  }


  const col = useWorkflowColumns({ handleRowClick, colWidths, isAdmin, properties }).filter(filterColsByScope)

  const columns = useMemo(() => col, [col, location.search, properties])

  const data = useMemo(() => workflows || [], [workflows])

  return (
    <StyledHomeTable>
      <Table<IWorkflow>
        name="apps"
        columns={columns}
        enableColumnSelect
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        data={data}
        properties={properties}
        isSelectable
        isSortable
        isFilterable
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        sortByPreference={sortBy}
        setSortByPreference={setSortBy}
        manualFilters
        shouldResetFilters={[homeScope]}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no workflows here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
