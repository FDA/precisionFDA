import { DndContext } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'
import { Button } from '../../components/Button'
import { DropdownNext } from '../../components/Dropdown/DropdownNext'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { ClipboardCheckIcon } from '../../components/icons/ClipboardCheckIcon'
import { ClipboardIcon } from '../../components/icons/ClipboardIcon'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { StyledPageTable } from '../../components/Table/components/styles'
import { cleanObject, getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ActionsButton, FilesListBreadcrumbHeader, FilesListResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta, NOTIFICATION_ACTION } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { ISpace } from '../spaces/spaces.types'
import { FileBreadcrumb } from './FileBreadcrumb'
import { centerToCursorCollisionDetection } from './centerToCursorCollisionDetection'
import { fetchFiles } from './files.api'
import { IFile, IFolder } from './files.types'
import { useFilesColumns } from './useFilesColumns'
import { useFileDnd } from './useFilesDnd'
import { useFilesSelectActions } from './useFilesSelectActions'
import { useFolderActions } from './useFolderActions'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { useLastWSNotification } from '../../hooks/useToastWSHandler'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { FileIcon } from '../../components/icons/FileIcon'

type ListType = { files: (IFile | IFolder)[]; meta: IMeta }

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

  const [isCopiedIds, setIsCopiedIds] = useState<boolean>(false)

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
    columnVisibility,
    setColumnVisibility,
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

  const lastJsonMessage = useLastWSNotification([
    NOTIFICATION_ACTION.NODES_REMOVED,
    NOTIFICATION_ACTION.NODES_COPIED,
    NOTIFICATION_ACTION.FILE_CLOSED,
  ])

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
  const { data: propertiesData } = usePropertiesQuery('node', homeScope, space?.id.toString())
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

  // @ts-expect-error sometimes shows as entries instead of files
  const files: IFile[] = data?.files || data?.entries
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, files)
  const selectedFileIds = selectedObjects.map(o => o.uid).filter(Boolean)

  const { actions, modals } = useFilesSelectActions({
    homeScope,
    space,
    folderId: folderIdParam,
    selectedItems: selectedObjects,
    resetSelected,
    resourceKeys: ['files'],
  })

  const { actions: folderActions, modals: folderModals } = useFolderActions(
    homeScope,
    folderIdParam!,
    space?.id.toString(),
    resetSelected,
  )

  const findAction = (actionName: string) => {
    return folderActions.find(action => action.name === actionName)
  }

  const handleCopyIds = () => {
    navigator.clipboard.writeText(selectedFileIds.join(', '))
    setIsCopiedIds(true)
    setTimeout(() => {
      setIsCopiedIds(false)
    }, 5000)
  }

  if (error) return <ResouceQueryErrorMessage />

  return (
    <>
      <FilesListResourceHeader>
        <ActionsRow>
          <QuickActions>
            {showFolderActions && (
              <>
                <Button
                  data-variant="primary"
                  data-testid="home-files-add-folder-button"
                  onClick={() => {
                    const action = findAction('Add Folder')
                    if (action && 'func' in action) {
                      action.func(false)
                    }
                  }}
                >
                  <FolderIcon height={14} /> Create Folder
                </Button>
                <Button
                  data-variant="primary"
                  data-testid="home-files-add-files-button"
                  onClick={() => {
                    const actionName = space?.id ? 'Choose Add Option' : 'Add Files'
                    const action = findAction(actionName)
                    if (action && 'func' in action) {
                      action.func(false)
                    }
                  }}
                >
                  <FileIcon height={14} /> Create Files
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
            <DropdownNext
              trigger="click"
              content={() => (
                <ActionsDropdownContent
                  actions={actions}
                  message={homeScope === 'spaces' ? 'To perform other actions on this file, access it from the Space' : undefined}
                />
              )}
            >
              {dropdownProps => <ActionsButton {...dropdownProps} data-testid="home-files-actions-button" />}
            </DropdownNext>
          </QuickActions>
        </ActionsRow>
      </FilesListResourceHeader>

      <FilesListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        spaceId={space?.id}
        isLoading={isLoading}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        files={files}
        filesMeta={data?.meta}
        properties={propertiesData?.keys}
        onFolderClick={onFolderClick}
        onFileClick={onRowClick}
        selectedObjects={selectedObjects}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        folderId={folderIdParam ? parseInt(folderIdParam, 10) : undefined}
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
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      <ActionModalsRenderer modals={folderModals} />
      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const FilesListTable = ({
  isAdmin,
  filters,
  setFilters,
  files,
  spaceId,
  properties,
  onFolderClick,
  onFileClick,
  isLoading,
  selectedObjects,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  homeScope,
  columnSizing,
  setColumnSizing,
  filesMeta,
  folderId,
  columnVisibility,
  setColumnVisibility,
}: {
  spaceId?: number
  filesMeta?: IMeta
  shouldResetFilters?: (string | undefined)[]
  isAdmin: boolean
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  selectedRows: Record<string, boolean> | undefined
  setSelectedRows: (ids: RowSelectionState) => void
  files?: IFile[]
  isLoading: boolean
  properties?: string[]
  onFolderClick: (folderId: string) => void
  onFileClick: (fileId: string) => void
  selectedObjects: IFile[]
  homeScope?: HomeScope
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  folderId?: number
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  const location = useLocation()
  const { handleDragEnd, handleDragStart, sensors, dndMoveModal } = useFileDnd({
    setSelectedRows,
    selectedObjects,
    files,
    spaceId,
  })

  function filterColsByScope(c: ColumnDefResolved<IFile>): boolean {
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessorKey === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessorKey === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessorKey === 'featured') ||
        // Hide 'state' if homeScope is defined to something specific.
        (homeScope !== undefined && c.accessorKey === 'state')
      )
    )
  }

  const col = useFilesColumns({
    onFolderClick,
    onFileClick,
    isAdmin,
    properties,
    // @ts-expect-error filter
  }).filter(filterColsByScope)

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={centerToCursorCollisionDetection}
    >
      {dndMoveModal.modalComp}
      <FilesListBreadcrumbHeader>
        <FileBreadcrumb
          currentFolderId={folderId || 0}
          basePath={location.pathname}
          scope={homeScope}
          metaPath={filesMeta?.path}
          labelText="You are here:"
        />
      </FilesListBreadcrumbHeader>
      <StyledPageTable>
        <Table<IFile>
          isLoading={isLoading}
          data={files || []}
          columns={col}
          columnSizing={columnSizing}
          setColumnSizing={setColumnSizing}
          rowSelection={selectedRows ?? {}}
          setSelectedRows={setSelectedRows}
          setColumnFilters={setFilters}
          columnSortBy={sortBy}
          setColumnSortBy={setSortBy}
          columnFilters={filters}
          enableDnd
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          emptyText="You don't have any files yet."
        />
      </StyledPageTable>
    </DndContext>
  )
}
