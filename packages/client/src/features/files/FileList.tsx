import { DndContext } from '@dnd-kit/core'
import type {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import { clsx } from 'clsx'
import { ArrowUpRightFromSquareIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { CopyText } from '@/components/CopyText/CopyText'
import { FileIcon } from '@/components/icons/FileIcon'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { ActionsMenu } from '@/components/Menu'
import { toastInfo } from '@/components/NotificationCenter/ToastHelper'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { Pagination } from '@/components/Pagination'
import Table from '@/components/Table'
import { StyledPageTable } from '@/components/Table/components/styles'
import { Button, buttonVariants } from '@/components/ui/button'
import { cleanObject, getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import { FilesListResourceHeader } from '../home/show.styles'
import type { HomeScope, IMeta, MetaPath } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import type { ISpace } from '../spaces/spaces.types'
import { centerToCursorCollisionDetection } from './centerToCursorCollisionDetection'
import { FileBreadcrumb } from './FileBreadcrumb'
import styles from './FileList.module.css'
import { fetchFiles } from './files.api'
import type { IFile, IFolder } from './files.types'
import { useFilesColumns } from './useFilesColumns'
import { useFileDnd } from './useFilesDnd'
import { useFilesSelectActions } from './useFilesSelectActions'
import { useFilesWebSocketUpdates } from './useFilesWebSocketUpdates'
import { useFolderActions } from './useFolderActions'

type ListType = { files: (IFile | IFolder)[]; meta: IMeta }

export const FileList = ({
  homeScope,
  space,
  showFolderActions = false,
  isAdmin = false,
}: {
  homeScope?: HomeScope
  space?: ISpace
  showFolderActions?: boolean
  isAdmin?: boolean
}) => {
  const location = useLocation()

  const [searchParams] = useSearchParams()
  const folderIdParam = searchParams.get('folder_id') ?? undefined

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
    scope: homeScope,
    params: {
      folderId: folderIdParam || undefined,
      spaceId: space?.id || undefined,
    },
  })

  const onRowClick = (id: string): void => {
    navigate(`${location.pathname}/${id}`, { state: { from: location.pathname, fromSearch: location.search } })
  }

  // Handle WebSocket notifications for optimistic updates during file upload
  useFilesWebSocketUpdates({ spaceId: space?.id })

  const { data: propertiesData } = usePropertiesQuery('node', homeScope, space?.id.toString())
  const { isLoading, data, error } = query

  // Keep previous folder meta path while loading to prevent breadcrumb flashing
  const previousMetaRef = useRef<MetaPath[] | undefined>(data?.meta?.path)
  useEffect(() => {
    // Only update ref if not loading (i.e., we have actual data)
    if (!isLoading && data?.meta) {
      previousMetaRef.current = data.meta.path
    }
  }, [data?.meta, isLoading])

  // Use current data if available, otherwise use cached value only during loading
  const currentMetaPath = !isLoading && data?.meta ? data.meta.path : isLoading ? previousMetaRef.current : undefined

  const onFolderClick = (folderId: string): void => {
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
    folderIdParam,
    space?.id.toString(),
    resetSelected,
    data?.meta?.path,
  )

  const openAction = actions.find(action => action.name === 'Open')

  const findAction = (actionName: string): (typeof folderActions)[number] | undefined =>
    folderActions.find(action => action.name === actionName)

  if (error) return <ResourceQueryErrorMessage />

  return (
    <>
      <FilesListResourceHeader>
        <ActionsRow>
          <QuickActions>
            {showFolderActions && (
              <>
                <Button
                  variant="default"
                  data-testid="home-files-add-folder-button"
                  onClick={(): void => {
                    const action = findAction('Add Folder')
                    if (action && 'func' in action) {
                      action.func(false)
                    }
                  }}
                >
                  <FolderIcon height={14} /> Create Folder
                </Button>
                <Button
                  variant="default"
                  data-testid="home-files-add-files-button"
                  onClick={(): void => {
                    const actionName = space?.id ? 'Choose Add Option' : 'Add Files'
                    const action = findAction(actionName)
                    if (action && 'func' in action) {
                      action.func(false)
                    }
                  }}
                >
                  <FileIcon height={14} /> Upload Files
                </Button>
              </>
            )}
          </QuickActions>
          <QuickActions>
            {selectedFileIds.length > 0 && (
              <CopyText
                value={selectedFileIds.join(', ')}
                iconColor="currentColor"
                iconSuccessColor="currentColor"
                className={buttonVariants({ variant: 'outline' })}
              >
                Copy IDs
              </CopyText>
            )}
            {openAction && selectedFileIds.length > 0 && (
              <Button
                variant="outline"
                onClick={(): void => {
                  if ('func' in openAction && openAction.func) {
                    openAction.func(false)
                  }
                }}
                disabled={openAction.isDisabled}
              >
                <ArrowUpRightFromSquareIcon height={14} /> Open
              </Button>
            )}
            <ActionsMenu data-testid="home-files-actions-button">
              <ActionsMenuContent
                actions={actions}
                message={
                  homeScope === 'spaces' ? 'To perform other actions on this file, access it from the Space' : undefined
                }
              />
            </ActionsMenu>
          </QuickActions>
        </ActionsRow>
      </FilesListResourceHeader>

      <FilesListTable
        isAdmin={isAdmin ?? false}
        homeScope={homeScope}
        spaceId={space?.id}
        isLoading={isLoading}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        files={files}
        filesMeta={data?.meta}
        metaPath={currentMetaPath}
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
          setPage={(p: number): void => setPageParam(p, true)}
          onPerPageSelect={(p: number): void => setPerPageParam(p, true)}
        />
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
  metaPath,
  folderId,
  columnVisibility,
  setColumnVisibility,
}: {
  spaceId?: number
  filesMeta?: IMeta
  metaPath?: MetaPath[]
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
}): JSX.Element => {
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
      <div className={styles.breadcrumbHeader}>
        <FileBreadcrumb
          currentFolderId={folderId || 0}
          basePath={location.pathname}
          scope={homeScope}
          metaPath={metaPath}
          labelText="You are here:"
        />
        {folderId && (
          <CopyText
            value={folderId.toString()}
            className={styles.folderIdPill}
            onCopy={(): void => {
              toastInfo('Folder ID copied to clipboard')
            }}
          >
            <span className={clsx(styles.currentFolderIdLabel, 'flex', 'items-center')}>Folder ID:</span>{' '}
            <span className={styles.currentFolderId}>{folderId}</span>
          </CopyText>
        )}
      </div>
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
