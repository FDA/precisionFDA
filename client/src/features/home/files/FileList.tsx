import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  BreadcrumbDivider,
  BreadcrumbLabel,
  StyledBreadcrumbs
} from '../../../components/Breadcrumb'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { cleanObject, getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useAuthUser } from '../../auth/useAuthUser'
import { ISpace } from '../../spaces/spaces.types'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import {
  ActionsRow,
  LoadingList,
  QuickActions,
  StyledHomeTable,
  StyledPaginationSection
} from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, MetaPath, ResourceScope } from '../types'
import { useList } from '../useList'
import { fetchFiles } from './files.api'
import { IFile } from './files.types'
import { useFilesColumns } from './useFilesColumns'
import { useFilesSelectActions } from './useFilesSelectActions'
import { useFolderActions } from './useFolderActions'

type ListType = { files: IFile[]; meta: IMeta }

export const FileList = ({ scope, space, showFolderActions = false }: { scope?: ResourceScope, space?: ISpace, showFolderActions?: boolean }) => {
  const { path } = useRouteMatch()
  const location = useLocation()
  
  const [folderIdParam, setFolderIdParam] = useQueryParam(
    'folder_id',
    StringParam,
  )
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const history = useHistory()
  const onRowClick = (id: string) => history.push(`${path}/${id}`, { from: location.pathname, fromSearch: location.search })

  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    sortBy,
    setSortBy,
    perPageParam,
    query,
    selectedIndexes,
    setSelectedIndexes,
    resetSelected,
    saveColumnResizeWidth,
    colWidths,
  } = useList<ListType>({
    fetchList: fetchFiles,
    resource: 'files',
    params: {
      folderId: folderIdParam || undefined,
      spaceId: space?.id || undefined,
      scope: scope || undefined,
    },
  })

  const { status, data, error } = query

  const onFolderClick = async (folderId: string) => {
    resetSelected()
    setFolderIdParam(folderId, 'pushIn')
    setPageParam(1, 'replaceIn')
  }

  // If the component is rendering for the first time, skip setting folderIdParam
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setFolderIdParam(undefined, 'pushIn')
  }, [scope])

  const files = data?.files || data?.entries

  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    files,
  )
  const actions = useFilesSelectActions({
    scope,
    space,
    fileId: folderIdParam!,
    selectedItems: selectedObjects,
    resetSelected,
    resourceKeys: ['files'],
  })
  delete actions['Comments']
  delete actions['Request license approval']
  if(scope) {
    delete actions['Copy to My Home (private)']
  }

  const listActions = useFolderActions(scope, folderIdParam!, space?.id)

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <div>
        <ActionsRow>
          <QuickActions>
            {showFolderActions && (
              <>
                <ButtonSolidBlue
                  data-testid="home-files-add-folder-button"
                  onClick={() =>
                    listActions['Add Folder']?.func({ showModal: true })
                  }
                >
                  <PlusIcon height={12} /> Add Folder
                </ButtonSolidBlue>
                <ButtonSolidBlue
                  data-testid="home-files-add-files-button"
                  onClick={() =>
                    listActions[space?.id ? 'Choose Add Option' : 'Add Files']?.func({ showModal: true })
                  }
                >
                  <PlusIcon height={12} /> Add Files
                </ButtonSolidBlue>
              </>
            )}
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={
                  scope === 'spaces' &&
                  'To perform other actions on this file, access it from the Space'
                }
              />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                active={dropdownProps.isActive}
                data-testid="home-files-actions-button"
              />
            )}
          </Dropdown>
        </ActionsRow>
        <ActionsRow>
          {breadcrumbs(path, data?.meta?.path, scope)}
          {status === 'loading' && <LoadingList>Loading...</LoadingList>}
        </ActionsRow>
      </div>

      <FilesListTable
        isAdmin={isAdmin}
        scope={scope}
        isLoading={status === 'loading'}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        files={files}
        onFolderClick={onFolderClick}
        onFileClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      
      <StyledPaginationSection>
        <Pagination
          page={data?.meta?.pagination?.current_page!}
          totalCount={data?.meta?.pagination?.total_count!}
          totalPages={data?.meta?.pagination?.total_pages!}
          perPage={perPageParam}
          isHidden={hidePagination(
            query.isFetched,
            data?.files?.length,
            data?.meta?.pagination?.total_pages,
            )}
            isPreviousData={data?.meta?.pagination?.prev_page! !== null}
            isNextData={data?.meta?.pagination?.next_page! !== null}
            setPage={setPageParam}
            onPerPageSelect={setPerPageParam}
          />
      </StyledPaginationSection>

      {listActions['Add Folder']?.modal}
      {listActions['Add Files']?.modal}
      {listActions['Copy Files']?.modal}
      {listActions['Choose Add Option']?.modal}
      {actions['Open']?.modal}
      {actions['Download']?.modal}
      {actions['Edit file info']?.modal}
      {actions['Edit folder info']?.modal}
      {actions['Delete']?.modal}
      {actions['Organize']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Copy to My Home (private)']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
      {actions['Accept License']?.modal}
      {actions['Edit tags']?.modal}
    </ErrorBoundary>
  )
}

const createSearchParam = (params: Record<string, any>) => {
  const query = cleanObject(params)
  const paramQ = `?${  new URLSearchParams(query as any).toString()}`
  return paramQ
}

const breadcrumbs = (basePath: string, metaPath: MetaPath[] = [], scope?: ResourceScope) => (
  <StyledBreadcrumbs>
    <BreadcrumbLabel>You are here:</BreadcrumbLabel>
    {[{ id: 0, name: 'Files', href: `${basePath}${createSearchParam({ scope })}` }]
      .concat(
        metaPath.map(folder => ({
          id: folder.id,
          name: folder.name,
          href: `files${createSearchParam({ scope, folder_id: folder.id })}`,
        })),
      )
      .map(folder => (
        <Link key={`folder-${folder.id}`} to={folder.href || ''}>
          {folder.name}
        </Link>
      ))
      // @ts-ignore
      .reduce((prev, curr) => [prev,<BreadcrumbDivider key={`divider-${prev.id}`}>/</BreadcrumbDivider>,curr])}
  </StyledBreadcrumbs>
)

export const FilesListTable = ({
  isAdmin,
  filters,
  files,
  onFolderClick,
  onFileClick,
  setFilters,
  isLoading,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  scope,
  saveColumnResizeWidth,
  colWidths,
}: {
  isAdmin: boolean
  filters: IFilter[]
  files?: IFile[]
  isLoading: boolean
  onFolderClick: (folderId: string) => void
  onFileClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows: Record<string, boolean> | undefined
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  scope?: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
}) => {
  // Show or hide the Featured column based on scope
  const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
  const locationColumnHide = scope !== 'spaces' ? 'location' : null
  const addedByColumnHide = scope === 'me' ? 'added_by' : null
  const meFeaturedColumnHide = scope === 'me' ? 'featured' : null
  const stateColumnHide = scope !== undefined ? 'state' : null
  const hidden = [
    meFeaturedColumnHide,
    featuredColumnHide,
    locationColumnHide,
    addedByColumnHide,
    stateColumnHide,
  ].filter(Boolean) as string[]
  const col = useFilesColumns({
    onFolderClick,
    onFileClick,
    colWidths,
    isAdmin,
  })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>(hidden)

  useEffect(() => {
    sethiddenColumns(hidden)
  }, [scope])
  
  const columns = useMemo(() => col, [col])
  const data = useMemo(() => files || [], [files])

  return (
    <StyledHomeTable>
      <Table<IFile>
        name="files"
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
        setSortByPreference={setSortBy}
        sortByPreference={sortBy}
        manualFilters
        filters={filters}
        shouldResetFilters={scope as any}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no files here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
