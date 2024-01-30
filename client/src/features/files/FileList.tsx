import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Column, SortingRule, UseResizeColumnsState } from 'react-table'
import useWebSocket from 'react-use-websocket'
import { useQueryParam } from 'use-query-params'
import {
  BreadcrumbDivider,
  BreadcrumbLabel,
  StyledBreadcrumbs,
} from '../../components/Breadcrumb'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { cleanObject, getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ISpace } from '../spaces/spaces.types'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import {
  ActionsRow, QuickActions,
  StyledHomeTable,
} from '../home/home.styles'
import { ActionsButton } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, MetaPath, Notification, HomeScope } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchFiles } from './files.api'
import { IFile } from './files.types'
import { useFilesColumns } from './useFilesColumns'
import { useFilesSelectActions } from './useFilesSelectActions'
import { useFolderActions } from './useFolderActions'

type ListType = { files: IFile[]; meta: IMeta }

export const FileList = ({ homeScope, space, showFolderActions = false }: { homeScope?: HomeScope, space?: ISpace, showFolderActions?: boolean }) => {
  const location = useLocation()
  const queryCache = useQueryClient()

  const [folderIdParam, setFolderIdParam] = useQueryParam<string | undefined>(
    'folder_id',
  )
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const navigate = useNavigate()

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
    hiddenColumns,
    saveHiddenColumns,
  } = useList<ListType>({
    fetchList: fetchFiles,
    resource: 'files',
    params: {
      folderId: folderIdParam || undefined,
      spaceId: space?.id || undefined,
      scope: homeScope || undefined,
    },
  })

  const onRowClick = (id: string) => {
    navigate(`${location.pathname}/${id}`, { state: { from: location.pathname, fromSearch: location.search }})
  }

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
  })

  useEffect(() => {
    if (notification == null) {
      return
    }
    if (['NODES_REMOVED', 'NODES_COPIED'].includes(notification.action)) {
      queryCache.invalidateQueries(['files'])
      queryCache.invalidateQueries(['counters'])
    }
  }, [notification])
  const { data: propertiesData } = usePropertiesQuery('node', homeScope, space?.id)
  const { status, data, error } = query

  const onFolderClick = (folderId: string) => {
    resetSelected()
    const search = new URLSearchParams(cleanObject({
      folder_id: folderId,
      scope: homeScope as string,
      per_page: perPageParam.toString(),
    })).toString()
    navigate({ search })
  }

  // If the component is rendering for the first time, skip setting folderIdParam
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setFolderIdParam(undefined, 'pushIn')
  }, [homeScope])

  const files = data?.files || data?.entries
  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    files,
  )
  const actions = useFilesSelectActions({
    homeScope,
    space,
    folderId: folderIdParam,
    selectedItems: selectedObjects,
    resetSelected,
    resourceKeys: ['files'],
  })

  delete actions['Comments']
  delete actions['Request license approval']
  if(homeScope) {
    delete actions['Copy to My Home (private)']
  }

  const listActions = useFolderActions(homeScope, folderIdParam!, space?.id)

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <div>
        <ActionsRow>
          <QuickActions>
            {showFolderActions && (
              <>
                <Button
                  variant='primary'
                  data-testid="home-files-add-folder-button"
                  onClick={() =>
                    listActions['Add Folder']?.func({ showModal: true })
                  }
                >
                  <PlusIcon height={12} /> Add Folder
                </Button>
                <Button
                  variant='primary'
                  data-testid="home-files-add-files-button"
                  onClick={() =>
                    listActions[space?.id ? 'Choose Add Option' : 'Add Files']?.func({ showModal: true })
                  }
                >
                  <PlusIcon height={12} /> Add Files
                </Button>
              </>
            )}
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={
                  homeScope === 'spaces' &&
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
          {breadcrumbs(location.pathname, data?.meta?.path, homeScope)}
        </ActionsRow>
      </div>

      <FilesListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        isLoading={status === 'loading'}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        files={files}
        properties={propertiesData?.keys}
        onFolderClick={onFolderClick}
        onFileClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
        shouldResetFilters={[folderIdParam, homeScope]}
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
      {actions['Edit properties']?.modal}
      {actions['Lock']?.modal}
      {actions['Unlock']?.modal}
    </ErrorBoundary>
  )
}

const createSearchParam = (params: Record<string, any>) => {
  const query = cleanObject(params)
  const paramQ = `?${  new URLSearchParams(query as any).toString()}`
  return paramQ
}

const breadcrumbs = (basePath: string, metaPath: MetaPath[] = [], scope?: HomeScope) => (
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
  properties,
  onFolderClick,
  onFileClick,
  setFilters,
  isLoading,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  homeScope,
  saveColumnResizeWidth,
  colWidths,
  shouldResetFilters = [],
  saveHiddenColumns,
  hiddenColumns,
}: {
  shouldResetFilters?: any[]
  isAdmin: boolean
  filters: IFilter[]
  files?: IFile[]
  isLoading: boolean
  properties?: string[]
  onFolderClick: (folderId: string) => void
  onFileClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows: Record<string, boolean> | undefined
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  homeScope?: HomeScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
  hiddenColumns: string[]
  saveHiddenColumns: (cols: string[]) => void
}) => {
  const location = useLocation()

  function filterColsByScope(c: Column<IFile>): boolean {
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (homeScope === 'me' && c.accessor === 'added_by') ||
      
      // Hide 'location' for all homeScopes except 'spaces'.
      (homeScope !== 'spaces' && c.accessor === 'location') ||
      
      // Hide 'featured' for all homeScopes except 'everybody'.
      (homeScope !== 'everybody' && c.accessor === 'featured') ||
      
      // Hide 'state' if homeScope is defined to something specific.
      (homeScope !== undefined && c.accessor === 'state')
    )
  }

  const col = useFilesColumns({
    onFolderClick,
    onFileClick,
    colWidths,
    isAdmin,
    properties,
  }).filter(filterColsByScope)
  
  const columns = useMemo(() => col, [col, location.search, properties])
  const data = useMemo(() => files || [], [files])
  return (
    <StyledHomeTable>
      <Table<IFile>
        name="files"
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
        setSortByPreference={setSortBy}
        sortByPreference={sortBy}
        manualFilters
        filters={filters}
        shouldResetFilters={shouldResetFilters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no files here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
