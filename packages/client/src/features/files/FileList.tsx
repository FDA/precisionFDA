import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Column, SortingRule, UseResizeColumnsState } from 'react-table'
import useWebSocket from 'react-use-websocket'
import { useQueryParam } from 'use-query-params'
import { BreadcrumbDivider, BreadcrumbLabel, StyledBreadcrumbs } from '../../components/Breadcrumb'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { ClipboardCheckIcon } from '../../components/icons/ClipboardCheckIcon'
import { ClipboardIcon } from '../../components/icons/ClipboardIcon'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../utils/config'
import { cleanObject, getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ActionsButton, FilesListResourceHeader } from '../home/show.styles'
import { HomeScope, IFilter, IMeta, KeyVal, MetaPath, Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { ISpace } from '../spaces/spaces.types'
import { fetchFiles } from './files.api'
import { IFile } from './files.types'
import { useFilesColumns } from './useFilesColumns'
import { useFilesSelectActions } from './useFilesSelectActions'
import { useFolderActions } from './useFolderActions'

const createSearchParam = (params: Record<string, unknown>) => {
  const query = cleanObject(params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  return paramQ
}

const breadcrumbs = (basePath: string, scope?: HomeScope, metaPath: MetaPath[] = []) => (
  <StyledBreadcrumbs>
    <BreadcrumbLabel>You are here:</BreadcrumbLabel>
    {[{ id: 0, name: 'Files', href: `${basePath}${createSearchParam({ scope })}` }]
      .concat(
        metaPath.map(folder => ({
          id: folder.id,
          name: folder.name,
          href: `${createSearchParam({ scope, folder_id: folder.id })}`,
        })),
      )
      .map(folder => (
        <Link key={`folder-${folder.id}`} to={folder.href || ''}>
          {folder.name}
        </Link>
      ))
      // @ts-ignore
      .reduce((prev, curr) => [prev, <BreadcrumbDivider key={`divider-${prev.id}`}>/</BreadcrumbDivider>, curr])}
  </StyledBreadcrumbs>
)

type ListType = { files: IFile[]; meta: IMeta }

export const FileList = ({
  homeScope,
  space,
  showFolderActions = false,
}: {
  homeScope?: HomeScope
  space?: ISpace
  showFolderActions?: boolean
}) => {
  const location = useLocation()
  const queryCache = useQueryClient()

  const [folderIdParam, setFolderIdParam] = useQueryParam<string | undefined>('folder_id')
  const user = useAuthUser()
  const isAdmin = user?.isAdmin ?? false

  const [isCopiedIds, setIsCopiedIds] = React.useState<boolean>(false)

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
    navigate(`${location.pathname}/${id}`, { state: { from: location.pathname, fromSearch: location.search } })
  }

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        const notification = messageData.data as Notification
        return (
          messageData.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION &&
          [NOTIFICATION_ACTION.NODES_REMOVED, NOTIFICATION_ACTION.NODES_COPIED, NOTIFICATION_ACTION.FILE_CLOSED].includes(
            notification.action,
          )
        )
      } catch (e) {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: ['files'],
    })
    queryCache.invalidateQueries({
      queryKey: ['space', String(space?.id)],
    })
    queryCache.invalidateQueries({
      queryKey: ['counters'],
    })
  }, [lastJsonMessage])
  const { data: propertiesData } = usePropertiesQuery('node', homeScope, space?.id)
  const { isLoading, data, error } = query

  const onFolderClick = (folderId: string) => {
    resetSelected()
    const search = new URLSearchParams(
      cleanObject({
        folder_id: folderId,
        scope: homeScope as string,
        per_page: perPageParam.toString(),
      }),
    ).toString()
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
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, files)
  const selectedFileIds = selectedObjects.map(o => o.uid).filter(Boolean)
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

  const listActions = useFolderActions(homeScope, folderIdParam!, space?.id)

  const handleCopyIds = () => {
    navigator.clipboard.writeText(selectedFileIds.join(', '))
    setIsCopiedIds(true)
    setTimeout(() => {
      setIsCopiedIds(false)
    }, 5000)
  }

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <FilesListResourceHeader>
        <ActionsRow>
          <QuickActions>
            {showFolderActions && (
              <>
                <Button
                  data-variant="primary"
                  data-testid="home-files-add-folder-button"
                  onClick={() => listActions['Add Folder']?.func({ showModal: true })}
                >
                  <PlusIcon height={12} /> Add Folder
                </Button>
                <Button
                  data-variant="primary"
                  data-testid="home-files-add-files-button"
                  onClick={() => listActions[space?.id ? 'Choose Add Option' : 'Add Files']?.func({ showModal: true })}
                >
                  <PlusIcon height={12} /> Add Files
                </Button>
              </>
            )}
          </QuickActions>
          <QuickActions>
            {selectedFileIds.length > 0 && (
              <Button data-variant="primary" onClick={handleCopyIds}>
                {isCopiedIds ? (
                  <>
                    <ClipboardCheckIcon height={14} /> Copied IDs
                  </>
                ) : (
                  <>
                    <ClipboardIcon height={14} /> Copy IDs
                  </>
                )}
              </Button>
            )}
            <Dropdown
              trigger="click"
              content={
                <ActionsDropdownContent
                  actions={actions}
                  message={homeScope === 'spaces' && 'To perform other actions on this file, access it from the Space'}
                />
              }
            >
              {dropdownProps => (
                <ActionsButton {...dropdownProps} active={dropdownProps.isActive} data-testid="home-files-actions-button" />
              )}
            </Dropdown>
          </QuickActions>
        </ActionsRow>
        {breadcrumbs(location.pathname, homeScope, data?.meta?.path)}
      </FilesListResourceHeader>

      <FilesListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        isLoading={isLoading}
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
      {actions['Copy to...']?.modal}
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
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
  hiddenColumns: string[]
  saveHiddenColumns: (cols: string[]) => void
}) => {
  const location = useLocation()

  function filterColsByScope(c: Column<IFile>): boolean {
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessor === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessor === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessor === 'featured') ||
        // Hide 'state' if homeScope is defined to something specific.
        (homeScope !== undefined && c.accessor === 'state')
      )
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
