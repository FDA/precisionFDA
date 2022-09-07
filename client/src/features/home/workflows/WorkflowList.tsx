import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useAuthUser } from '../../auth/useAuthUser'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import {
  ActionsRow,
  QuickActions,
  StyledHomeTable,
  StyledPaginationSection,
} from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { useWorkflowColumns } from './useWorkflowColumns'
import { useWorkflowListActions } from './useWorkflowListActions'
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { fetchWorkflowList } from './workflows.api'
import { IWorkflow } from './workflows.types'

type ListType = { workflows: IWorkflow[]; meta: IMeta }

export const WorkflowList = ({
  scope,
  spaceId,
}: {
  scope?: ResourceScope
  spaceId?: string
}) => {
  const history = useHistory()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (id: string) => history.push(`/home/workflows/${id}`)
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
  } = useList<ListType>({
    fetchList: fetchWorkflowList,
    resource: 'workflows',
    params: {
      spaceId: spaceId || undefined,
      scope: scope || undefined,
    },
  })
  const { status, data, error } = query

  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.workflows,
  )
  const actions = useWorkflowSelectActions({
    scope,
    spaceId,
    selectedItems: selectedObjects,
    resourceKeys: ['workflows'],
    resetSelected,
  })
  const listActions = useWorkflowListActions({ spaceId })
  const message =
    scope === 'spaces' &&
    'To perform other actions on this workflow, access it from the Space'

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <div>
        <ActionsRow>
          <QuickActions>
            {scope === 'me' && (
              <ButtonSolidBlue
                data-testid="home-workflows-create-link"
                as="a"
                href="/workflows/new"
              >
                <PlusIcon height={12} /> Create Workflow
              </ButtonSolidBlue>
            )}

            {spaceId && (
              <ButtonSolidBlue
                data-testid="spaces-workflows-add-button"
                onClick={() =>
                  listActions['Add Workflow']?.func({ showModal: true })
                }
              >
                <PlusIcon height={12} /> Add Workflow
              </ButtonSolidBlue>
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
      </div>

      <WorkflowListTable
        isAdmin={isAdmin}
        scope={scope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        workflows={data?.workflows}
        isLoading={status === 'loading'}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        sortBy={sortBy}
        setSortBy={setSortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <StyledPaginationSection>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={hidePagination(
            query.isFetched,
            data?.workflows?.length,
            data?.meta?.pagination?.total_pages,
          )}
          isPreviousData={data?.meta?.pagination?.prev_page !== null}
          isNextData={data?.meta?.pagination?.next_page !== null}
          setPage={setPageParam}
          onPerPageSelect={setPerPageParam}
        />
      </StyledPaginationSection>
      {listActions['Create Workflow']?.modal}
      {listActions['Add Workflow']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Delete']?.modal}
      {actions['Export to']?.modal}
      {actions['Edit tags']?.modal}
    </ErrorBoundary>
  )
}

export const WorkflowListTable = ({
  isAdmin,
  filters,
  workflows,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  scope,
  saveColumnResizeWidth,
  colWidths,
}: {
  isAdmin?: boolean
  filters: IFilter[]
  workflows?: IWorkflow[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  scope?: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
}) => {
  const col = useWorkflowColumns({ handleRowClick, colWidths, isAdmin })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>([])

  useEffect(() => {
    // Show or hide the Featured column based on scope
    const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
    const locationColumnHide = scope !== 'spaces' ? 'location' : null
    const addedByColumnHide = scope === 'me' ? 'added_by' : null
    const cols = [
      featuredColumnHide,
      locationColumnHide,
      addedByColumnHide,
    ].filter(Boolean) as string[]
    sethiddenColumns(cols)
  }, [scope])

  const columns = useMemo(() => col, [col])

  const data = useMemo(() => workflows || [], [workflows])

  return (
    <StyledHomeTable>
      <Table<IWorkflow>
        name="apps"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={data}
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
        shouldResetFilters={scope as any}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no workflows here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
