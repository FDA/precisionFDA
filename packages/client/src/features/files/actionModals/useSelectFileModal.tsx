import { useQuery } from '@tanstack/react-query'
import { Check, Layers, PanelRightIcon, Search, X } from 'lucide-react'
import React, {
  createContext,
  type Dispatch,
  type JSX,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Tooltip } from 'react-tooltip'
import { FolderTree, type FolderTreeNode, type FolderTreePath } from '@/components/FolderTree'
import { NumberPagination } from '@/components/Pagination/NumberPagination'
import { useDebounce } from '@/components/Table/useDebounce'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderClose,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRunJobFilesContext } from '@/features/apps/run/useRunJobFilesContext'
import type { HomeScopeContextValue } from '@/features/home/HomeScopeContext'
import { useUnifiedRouteContext } from '@/routes/resource-pages'
import { cn } from '@/utils/cn'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { Loader } from '../../../components/Loader'
import { noAccessText } from '../../files/file.utils'
import type { DialogType, ScopeContext, ServerScope } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { spacesListRequest } from '../../spaces/spaces.api'
import { findSpaceTypeIcon } from '../../spaces/useSpacesColumns'
import { FileBreadcrumb } from '../FileBreadcrumb'
import { fetchAccessibleFiles, fetchFolderChildren } from '../files.api'
import type { IFile } from '../files.types'
import { useFetchFilesByUIDQuery } from '../query/useFetchFilesByUIDQuery'

interface FileSelectTabsProps {
  type: DialogType
  selectedFiles: IFile[]
  setSelectedFiles: Dispatch<SetStateAction<IFile[]>>
  defaultScope?: ScopeContext
  allowedScopes?: string[]
  failedFiles: string[]
  validateLicense?: boolean
  showSelectedPanel: boolean
}

interface FileSelectContextValue {
  selectedFiles: IFile[]
  setSelectedFiles: Dispatch<SetStateAction<IFile[]>>
}

interface FolderSelectContextValue {
  folderPath: FolderTreePath[]
  setFolderPath: Dispatch<SetStateAction<FolderTreePath[]>>
  selectedFolderId: string | null
  setSelectedFolderId: Dispatch<SetStateAction<string | null>>
}

const FileSelectContext: React.Context<FileSelectContextValue | null> = createContext<FileSelectContextValue | null>(
  null,
)
const FolderSelectContext: React.Context<FolderSelectContextValue | null> =
  createContext<FolderSelectContextValue | null>(null)

const useFileSelectContext = (): FileSelectContextValue => {
  const ctx = useContext(FileSelectContext)
  if (!ctx) throw new Error('useFileSelectContext must be used within FileSelectContext.Provider')
  return ctx
}

const useFolderSelectContext = (): FolderSelectContextValue => {
  const ctx = useContext(FolderSelectContext)
  if (!ctx) throw new Error('useFolderSelectContext must be used within FolderContext.Provider')
  return ctx
}

const extractHomeContext = (
  homeScopeData: HomeScopeContextValue,
  scopes?: string[],
): { scope: ServerScope; name: string } => {
  const { homeScope } = homeScopeData
  // If the home scope is not set, and the allowed scopes does not include private, default to public scope.
  if (homeScope === 'everybody' || (scopes?.length && !scopes?.includes('private'))) {
    return {
      scope: 'public',
      name: 'Everybody',
    }
  }
  return {
    scope: 'private',
    name: 'Private',
  }
}

const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }): JSX.Element => (
  <div className="mb-3">
    <div className="text-muted-foreground mb-1 px-2 text-[11px] font-semibold tracking-wide uppercase">{title}</div>
    {children}
  </div>
)

const ScopeItem = ({
  className,
  name,
  scope,
  icon,
  isActive,
  isSelected,
  onSelectScope,
}: {
  name: string
  scope?: string
  icon: React.ReactNode
  isActive?: boolean
  isSelected?: boolean
  onSelectScope: () => void
  className?: string
}): JSX.Element => {
  const selected = isActive || isSelected

  return (
    <button
      type="button"
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-left text-sm transition-colors',
        selected ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/60 text-foreground',
        className,
      )}
      onClick={onSelectScope}
    >
      <span className="text-muted-foreground flex size-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {scope && <span className="text-muted-foreground hidden truncate text-xs sm:inline">{scope}</span>}
      {isSelected && <Check className="text-primary size-3.5 shrink-0" strokeWidth={3} />}
    </button>
  )
}

const SelectedFile = ({ file, onRemove }: { file: IFile; onRemove: (file: IFile) => void }): JSX.Element => {
  const pathLabel = file.folderPath
    ? `/${file.folderPath.map(f => f.name).join('/')}`
    : file.location
      ? file.location
      : file.scope

  return (
    <li className="group hover:bg-accent/60 flex items-start gap-2 rounded-sm px-2 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm flex items-center gap-1">
          <FileIcon height={14} />
          {file.name}
        </div>
        <div className="text-muted-foreground truncate font-mono text-[11px]">{file.uid}</div>
        {pathLabel && <div className="text-muted-foreground truncate text-[11px]">{pathLabel}</div>}
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:text-destructive mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
        onClick={() => onRemove(file)}
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-3.5" />
      </button>
    </li>
  )
}

const SelectedFilesPanel = ({ failedFiles }: { failedFiles: string[] }): JSX.Element => {
  const { selectedFiles, setSelectedFiles } = useFileSelectContext()

  const handleRemove = (file: IFile): void => {
    setSelectedFiles(prev => prev.filter(f => f.uid !== file.uid))
  }

  return (
    <div className="bg-muted/95 absolute top-0 right-0 bottom-14 z-20 flex w-[min(16rem,calc(100vw-1rem))] shrink-0 flex-col border-l shadow-lg lg:relative lg:inset-auto lg:w-64 lg:bg-muted/20 lg:shadow-none">
      {failedFiles.length > 0 && (
        <div className="border-b border-(--warning-400) bg-(--warning-50) px-3 py-2">
          <div className="mb-1 text-xs font-medium text-(--warning-600)">{noAccessText.multi}</div>
          <ul className="space-y-0.5">
            {failedFiles.map(uid => (
              <li key={uid} className="text-muted-foreground truncate font-mono text-[11px]">
                {uid}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-1">
        {selectedFiles.length === 0 ? (
          <div className="text-muted-foreground px-3 py-6 text-center text-xs">Select files from the list</div>
        ) : (
          <ul>
            {selectedFiles.map(file => (
              <SelectedFile key={file.uid} file={file} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const ScopeDivider = ({ label }: { label: string }): JSX.Element => (
  <div className="border-layout-border bg-transparent px-2 py-2">
    <span className="text-(--c-text-400) text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </div>
)

const ScopeTable = ({
  onSelectScope,
  allowedScopes,
  activeScope,
}: {
  onSelectScope: (scope: string, name: string) => void
  allowedScopes?: string[]
  activeScope?: string
}): JSX.Element => {
  const [spaceFilter, setSpaceFilter] = useState('')
  const allowedScopeSet = new Set(allowedScopes)
  const routeContext = useUnifiedRouteContext()

  const { data: spacesData, isLoading: isSpacesLoading } = useQuery({
    queryKey: ['spaces-list-accessible'],
    queryFn: () =>
      spacesListRequest(
        [],
        {
          page: 1,
          perPage: 1000,
        },
        {
          excludeSharedPrivateSpaces: false,
        },
      ),
  })

  // Current space from route context (only when inside a space, not home)
  const contextSpace = !routeContext.isHome ? routeContext.space : null
  const contextSpaceScope = !routeContext.isHome ? `space-${routeContext.space.id}` : null

  // Pinned items: current space (if in space context) + Private + Public
  const pinnedItems: { name: string; scope: string; icon: JSX.Element }[] = []
  if (contextSpaceScope && contextSpace && (!allowedScopes || allowedScopeSet.has(contextSpaceScope))) {
    pinnedItems.push({
      name: contextSpace.name,
      scope: contextSpaceScope,
      icon: findSpaceTypeIcon(contextSpace.type) as JSX.Element,
    })
  }
  if (!allowedScopes || allowedScopeSet.has('private')) {
    pinnedItems.push({ name: 'Private', scope: 'private', icon: <LockIcon height={14} /> })
  }
  if (!allowedScopes || allowedScopeSet.has('public')) {
    pinnedItems.push({ name: 'Everyone', scope: 'public', icon: <GlobeIcon height={14} /> })
  }

  // Other spaces: all spaces excluding the current context space, filtered by search
  const otherSpaceItems = isSpacesLoading
    ? []
    : (spacesData?.data ?? [])
        .filter(
          space =>
            `space-${space.id}` !== contextSpaceScope &&
            !space.protected &&
            (!spaceFilter ||
              space.name.toLowerCase().includes(spaceFilter.toLowerCase()) ||
              space.title.toLowerCase().includes(spaceFilter.toLowerCase())) &&
            (!allowedScopes || allowedScopeSet.has(`space-${space.id}`)),
        )
        .map(space => ({
          name: space.title,
          scope: `space-${space.id}`,
          icon: findSpaceTypeIcon(space.type) as JSX.Element,
        }))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 py-2">
        <InputGroup className="h-8">
          <InputGroupAddon>
            <Search className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter scopes..."
            value={spaceFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpaceFilter(e.target.value)}
            className="text-sm"
          />
        </InputGroup>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-2">
        {pinnedItems.length > 0 && (
          <>
            <ScopeDivider label={`Pinned scopes (${pinnedItems.length})`} />
            {pinnedItems.map(item => (
              <ScopeItem
                key={item.scope}
                name={item.name}
                scope={item.scope}
                icon={item.icon}
                isSelected={item.scope === activeScope}
                onSelectScope={() => onSelectScope(item.scope, item.name)}
              />
            ))}
          </>
        )}
        {isSpacesLoading ? (
          <div className="p-4">
            <Loader />
          </div>
        ) : (
          <>
            <ScopeDivider label={`Other spaces (${otherSpaceItems.length})`} />
            {otherSpaceItems.map(item => (
              <ScopeItem
                key={item.scope}
                name={item.name}
                scope={item.scope}
                icon={item.icon}
                isSelected={item.scope === activeScope}
                onSelectScope={() => onSelectScope(item.scope, item.name)}
              />
            ))}
            {otherSpaceItems.length === 0 && (
              <div className="text-muted-foreground px-2 py-6 text-center text-xs">
                {spaceFilter ? 'No scopes match your filter.' : 'No other spaces available.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const FileTable = ({
  activeScope,
  type,
  validateLicense,
}: {
  activeScope?: ServerScope
  type: string
  validateLicense?: boolean
}): JSX.Element => {
  const { selectedFiles, setSelectedFiles } = useFileSelectContext()
  const { selectedFolderId, setSelectedFolderId, folderPath, setFolderPath } = useFolderSelectContext()
  const [page, setPage] = useState<number>(1)
  const pageSize = 20
  const [nameFilter, setNameFilter] = useState('')
  const [uidFilter, setUidFilter] = useState('')
  const [filterMode, setFilterMode] = useState<'name' | 'id'>('name')

  const debouncedNameFilter = useDebounce(nameFilter, 300)
  const debouncedUidFilter = useDebounce(uidFilter, 300)
  const activeNameFilter = filterMode === 'name' ? debouncedNameFilter : ''
  const activeUidFilter = filterMode === 'id' ? debouncedUidFilter : ''
  const isFilteringFiles = activeNameFilter.length > 0 || activeUidFilter.length > 0

  const parsedFolderId = (folderId: string | null) => (folderId ? parseInt(folderId, 10) : 'null')

  const { data: folderFiles, isLoading: isFolderFilesLoading } = useQuery({
    queryKey: [
      'folder-children-files',
      activeScope,
      selectedFolderId,
      page,
      filterMode,
      activeNameFilter,
      activeUidFilter,
    ],
    queryFn: () =>
      fetchAccessibleFiles({
        scope: activeScope,
        ignoreComparison: false,
        folderId: isFilteringFiles > 0 ? undefined : parsedFolderId(selectedFolderId),
        type: ['UserFile'],
        filter: {
          name: activeNameFilter || undefined,
          states: ['closed'],
        },
        fields: {
          path: true,
        },
        uids:
          activeUidFilter.length > 0
            ? activeUidFilter.split(',').map(uid => uid.replace(/[%]/g, '').trim())
            : undefined,
        page,
        pageSize,
      }),
  })

  useEffect(() => {
    setPage(1)
  }, [selectedFolderId, filterMode, nameFilter, uidFilter])

  const breadcrumbMetaPath = useMemo(
    () => folderPath.filter(p => p.id !== 'ROOT').map(p => ({ id: Number(p.id), name: p.name })),
    [folderPath],
  )

  const handleBreadcrumbNavigate = useCallback(
    (folderId: number) => {
      if (folderId === 0) {
        setSelectedFolderId(null)
        setFolderPath([])
      } else {
        const id = folderId.toString()
        setSelectedFolderId(id)
        setFolderPath(prev => prev.slice(0, prev.findIndex(f => f.id === id) + 1))
      }
    },
    [setSelectedFolderId, setFolderPath],
  )

  const isFileSelected = (file: IFile): boolean => selectedFiles.some(f => f.uid === file.uid)
  const toggleFile = (file: IFile): void => {
    if (type === 'radio') {
      setSelectedFiles([file])
    } else if (isFileSelected(file)) {
      setSelectedFiles(prev => prev.filter(f => f.uid !== file.uid))
    } else {
      setSelectedFiles(prev => [...prev, file])
    }
  }

  const files = (folderFiles?.data ?? []) as IFile[]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="bg-background sticky top-0 z-10 space-y-2 border-b px-3 py-2">
        <FileBreadcrumb
          currentFolderId={selectedFolderId ? Number(selectedFolderId) : 0}
          basePath=""
          metaPath={breadcrumbMetaPath}
          onNavigate={handleBreadcrumbNavigate}
        />
        <InputGroup className="h-8">
          <InputGroupAddon className="gap-1 pr-1">
            <span className="text-muted-foreground hidden px-1 text-xs font-normal sm:inline">Filter by</span>
            <Tabs value={filterMode} onValueChange={value => setFilterMode(value as 'name' | 'id')} className="gap-0">
              <TabsList className="h-7 rounded-md p-0.5">
                <TabsTrigger value="name" className="px-2 py-0.5 text-xs">
                  Name
                </TabsTrigger>
                <TabsTrigger value="id" className="px-2 py-0.5 text-xs">
                  ID
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <span aria-hidden className="bg-border ml-1 h-5 w-px" />
          </InputGroupAddon>
          <InputGroupAddon className="pl-2">
            <Search className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={filterMode === 'name' ? 'Filter by name...' : 'Filter by file ID(s), comma-separated...'}
            autoComplete="off"
            value={filterMode === 'name' ? nameFilter : uidFilter}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              if (filterMode === 'name') {
                setNameFilter(evt.target.value)
              } else {
                setUidFilter(evt.target.value)
              }
            }}
            className="text-sm"
          />
        </InputGroup>
      </div>

      <div className="flex-1 overflow-y-auto" role="listbox" aria-multiselectable={type === 'checkbox'}>
        {isFolderFilesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        )}
        {!isFolderFilesLoading && files.length === 0 && (
          <div className="text-muted-foreground py-12 text-center text-sm">No files found</div>
        )}
        {!isFolderFilesLoading &&
          files.map(file => {
            const selected = isFileSelected(file)
            const isLicenseBlocked = validateLicense === true && file.fileLicense?.acceptanceStatus === 'pending'
            return (
              <div
                key={file.uid}
                role="option"
                aria-selected={selected}
                className={cn(
                  'flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-3 py-1.5 transition-colors',
                  isLicenseBlocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent/50',
                  selected && !isLicenseBlocked && 'border-l-primary bg-accent/70',
                )}
                onClick={() => {
                  if (!isLicenseBlocked) toggleFile(file)
                }}
                tabIndex={isLicenseBlocked ? -1 : 0}
                aria-disabled={isLicenseBlocked}
                data-tooltip-id={isLicenseBlocked ? 'license-blocked-tooltip' : undefined}
                data-tooltip-content={
                  isLicenseBlocked
                    ? `License "${file.fileLicense?.title}" must be accepted before selecting this file`
                    : undefined
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (isLicenseBlocked) return
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    toggleFile(file)
                  }
                }}
              >
                {type === 'checkbox' && (
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleFile(file)}
                    onClick={event => event.stopPropagation()}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="wrap-break-word whitespace-normal text-sm">
                    <span className="inline-block align-text-bottom">
                      <FileIcon width={13} height={13} />
                    </span>{' '}
                    <span>{file.name}</span>
                  </div>
                  <div className="text-muted-foreground truncate font-mono text-[11px]">{file.uid}</div>
                </div>
              </div>
            )
          })}
        <Tooltip
          id="license-blocked-tooltip"
          place="bottom"
          className="max-w-[90%] whitespace-normal wrap-break-word"
        />
      </div>

      <div className="flex h-14 shrink-0 items-center border-t px-2">
        <NumberPagination
          page={page}
          totalPages={folderFiles?.meta.totalPages ?? 1}
          totalCount={folderFiles?.meta.total ?? 0}
          perPage={pageSize}
          setPage={setPage}
        />
      </div>
    </div>
  )
}

const ScopeFolderTree = ({ activeScope }: { activeScope?: ServerScope }): JSX.Element => {
  const { selectedFolderId, setSelectedFolderId, setFolderPath } = useFolderSelectContext()

  const fetchFolders = useCallback(
    async (folderId: string | null): Promise<FolderTreeNode[]> => {
      const nodes = await fetchFolderChildren({
        scopes: activeScope ? [activeScope] : [],
        folderId: folderId ?? undefined,
        types: ['Folder'],
      })
      return nodes.map(n => ({
        id: n.id.toString(),
        name: n.name,
      }))
    },
    [activeScope],
  )

  const handleFolderSelect = useCallback(
    (node: FolderTreeNode, path: FolderTreePath[]): void => {
      setSelectedFolderId(node.id === 'ROOT' ? null : node.id)
      setFolderPath(path)
    },
    [setSelectedFolderId, setFolderPath],
  )

  return (
    <SidebarSection title="Folders">
      <FolderTree
        fetchChildren={fetchFolders}
        onSelect={handleFolderSelect}
        selectedId={selectedFolderId}
        rootLabel="/"
        queryKeyPrefix={activeScope ? [activeScope] : []}
        className="px-0.5"
      />
    </SidebarSection>
  )
}

const ModalBody = ({
  type,
  selectedFiles,
  setSelectedFiles,
  defaultScope,
  allowedScopes,
  failedFiles,
  validateLicense,
  showSelectedPanel,
}: FileSelectTabsProps): JSX.Element => {
  const context = useUnifiedRouteContext()
  const extractContext: { scope: ServerScope; name: string } = context.isHome
    ? extractHomeContext(context.homeContext, allowedScopes)
    : {
        scope: `space-${context.space.id}`,
        name: context.space.name,
      }
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<FolderTreePath[]>([])
  const [viewMode, setViewMode] = useState<'files' | 'scopes'>('files')
  const [activeScope, setActiveScope] = useState<ServerScope | undefined>(defaultScope?.scope ?? extractContext.scope)
  const [activeScopeName, setActiveScopeName] = useState<string | undefined>(defaultScope?.name ?? extractContext.name)

  const handleScopeClick = (scopeValue: string, label: string): void => {
    setActiveScope(scopeValue as ServerScope)
    setActiveScopeName(label)
    setSelectedFolderId(null)
    setFolderPath([])
    setViewMode('files')
  }

  const handleAllScopes = (): void => {
    setViewMode('scopes')
    setSelectedFolderId(null)
    setFolderPath([])
  }

  const contextValue = useMemo<FileSelectContextValue>(
    () => ({
      selectedFiles,
      setSelectedFiles,
    }),
    [selectedFiles, setSelectedFiles],
  )

  const folderContextValue = useMemo<FolderSelectContextValue>(
    () => ({
      selectedFolderId,
      setSelectedFolderId,
      folderPath,
      setFolderPath,
    }),
    [selectedFolderId, folderPath],
  )

  return (
    <FileSelectContext.Provider value={contextValue}>
      <FolderSelectContext.Provider value={folderContextValue}>
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="bg-muted/20 max-h-40 shrink-0 overflow-y-auto border-b px-1 py-2 lg:max-h-none lg:w-56 lg:border-r lg:border-b-0">
            <SidebarSection title="Scope">
              <ScopeItem
                name="All Scopes"
                icon={<Layers className="size-3.5" />}
                isActive={viewMode === 'scopes'}
                onSelectScope={handleAllScopes}
              />
              {viewMode === 'files' && activeScopeName && (
                <ScopeItem
                  className=""
                  name={activeScopeName}
                  icon={
                    activeScope === 'private' ? (
                      <LockIcon height={14} />
                    ) : activeScope === 'public' ? (
                      <GlobeIcon height={14} />
                    ) : (
                      findSpaceTypeIcon('groups')
                    )
                  }
                  isActive
                  onSelectScope={() => {}}
                />
              )}
            </SidebarSection>
            {viewMode === 'files' && <ScopeFolderTree activeScope={activeScope} />}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {viewMode === 'scopes' && (
              <ScopeTable allowedScopes={allowedScopes} onSelectScope={handleScopeClick} activeScope={activeScope} />
            )}
            {viewMode === 'files' && (
              <FileTable activeScope={activeScope} type={type} validateLicense={validateLicense} />
            )}
          </div>
          {showSelectedPanel && <SelectedFilesPanel failedFiles={failedFiles} />}
        </div>
      </FolderSelectContext.Provider>
    </FileSelectContext.Provider>
  )
}

/**
 * Dialog for selecting file(s). It can function in two modes specified
 * by DialogType. In Radio mode only single file selection is allowed, however
 * in checkbox mode it allows user select multiple files.
 *
 * @param title - The modal header text displayed to the user.
 * @param type - Controls selection mode: `'radio'` for single-file selection, `'checkbox'` for multi-file selection.
 * @param handleSelect - Callback invoked with the array of selected files when the user confirms.
 * @param defaultScope - Initial scope selection. Defaults to the current route context (space or home) if omitted.
 * @param allowedScopes - When provided, restricts the scope picker to only the listed scope identifiers.
 * @param uids - File UIDs to pre-populate as already-selected when the modal opens.
 * @param validateLicense - When `true`, files with a pending license acceptance are shown as disabled and cannot be selected.
 * @returns An object containing the modal component, show/hide helpers, and the current visibility state.
 */
export const useSelectFileModal = (
  title: string,
  type: DialogType,
  handleSelect: (files: IFile[]) => void,
  defaultScope?: ScopeContext,
  allowedScopes?: string[],
  uids?: string[],
  validateLicense?: boolean,
): {
  modalComp: JSX.Element
  setShowModal: (show: boolean) => void
  showModalResetState: () => void
  isShown: boolean
} => {
  const { isShown, setShowModal } = useModal()
  const [selectedFiles, setSelectedFiles] = useState<IFile[]>([])
  const uidKey = (uids ?? []).join(',')
  const requestedUids = useMemo(() => (isShown && uidKey ? uidKey.split(',') : []), [isShown, uidKey])
  const { data: fetchAccessibleResult, isFetched: isAccessibleFilesFetched } = useFetchFilesByUIDQuery(requestedUids)
  const { validatedFilesCache, setValidatedFilesCache } = useRunJobFilesContext()
  const [failedFiles, setFailedFiles] = useState<string[]>([])
  const [showSelectedPanel, setShowSelectedPanel] = useState(true)

  useEffect(() => {
    if (!isShown) {
      return
    }
    setSelectedFiles([])
    setFailedFiles([])
  }, [isShown, uidKey])

  useEffect(() => {
    if (!isShown || !isAccessibleFilesFetched) {
      return
    }
    const fetchAccessibleData = fetchAccessibleResult?.data ?? []
    setSelectedFiles(fetchAccessibleData)
    const accessibleUidSet = new Set(fetchAccessibleData.map(f => f.uid))
    setFailedFiles(requestedUids.filter(uid => !accessibleUidSet.has(uid)))
  }, [isShown, isAccessibleFilesFetched, fetchAccessibleResult?.data, requestedUids])

  const showModalResetState = (): void => {
    setShowModal(true)
  }

  const handleSubmit = (): void => {
    handleSelect(selectedFiles)
    setShowModal(false)
    const newCache = { ...validatedFilesCache }
    for (const file of selectedFiles) {
      newCache[file.uid] = true
    }
    setValidatedFilesCache({ ...newCache })
    setSelectedFiles([])
  }

  const handleOpenChange = (open: boolean): void => {
    setShowModal(open)
  }

  const modalComp = (
    <Dialog open={isShown} onOpenChange={handleOpenChange}>
      <DialogContent
        id="select-file-modal"
        data-testid="select-file-modal"
        variant="large"
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="mx-0 flex-row items-center justify-between gap-2 border-b px-3 py-2 sm:px-4 sm:py-3">
          <DialogTitle className="min-w-0 truncate text-base font-semibold">{title}</DialogTitle>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant={showSelectedPanel ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 px-2"
              aria-label={showSelectedPanel ? 'Hide selected files sidebar' : 'Show selected files sidebar'}
              aria-pressed={showSelectedPanel}
              onClick={() => setShowSelectedPanel(prev => !prev)}
            >
              <PanelRightIcon />
              <span className="hidden sm:inline">Selected</span>
              <span className="bg-background text-foreground min-w-5 rounded-sm border px-1.5 text-center text-xs font-semibold tabular-nums shadow-xs">
                {selectedFiles.length}
              </span>
            </Button>
            <DialogHeaderClose />
          </div>
        </DialogHeader>

        {isShown && (
          <ModalBody
            type={type}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            failedFiles={failedFiles}
            defaultScope={defaultScope}
            allowedScopes={allowedScopes}
            validateLicense={validateLicense}
            showSelectedPanel={showSelectedPanel}
          />
        )}
        <DialogFooter className="mx-0 border-t px-4 py-3">
          <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedFiles?.length === 0}>
            Select{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
