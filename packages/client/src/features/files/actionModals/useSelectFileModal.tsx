import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { X } from 'lucide-react'
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
import { Modal, ModalHeaderTop } from '@/components/Modal'
import { NumberPagination } from '@/components/Pagination/NumberPagination'
import { useDebounce } from '@/components/Table/useDebounce'
import { Button } from '@/components/ui/button'
import { useRunJobFilesContext } from '@/features/apps/run/useRunJobFilesContext'
import type { HomeScopeContextValue } from '@/features/home/HomeScopeContext'
import { useUnifiedRouteContext } from '@/routes/resource-pages'
import { Checkbox } from '../../../components/CheckboxNext'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { ButtonBadge, Sticky } from '../../actionModals/action-modals.styles'
import { noAccessText } from '../../files/file.utils'
import type { DialogType, ServerScope } from '../../home/types'
import { ButtonRow, Footer } from '../../modal/modal.styles'
import { useModal } from '../../modal/useModal'
import { spacesListRequest } from '../../spaces/spaces.api'
import { findSpaceTypeIcon } from '../../spaces/useSpacesColumns'
import { FileBreadcrumb } from '../FileBreadcrumb'
import { fetchAccessibleFiles, fetchFolderChildren } from '../files.api'
import type { IFile } from '../files.types'
import { useFetchFilesByUIDQuery } from '../query/useFetchFilesByUIDQuery'

interface FileSelectTabsProps {
  type: DialogType
  setShowModal: (show: boolean) => void
  uids: string[]
  selectedFiles: IFile[]
  setSelectedFiles: Dispatch<SetStateAction<IFile[]>>
  allowedScopes?: string[]
  failedFiles: string[]
  validateLicense?: boolean
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
    name: 'My Home',
  }
}

const ScopeItem = ({
  name,
  scope,
  icon,
  onSelectScope,
}: {
  name: string
  scope: string
  icon: React.ReactNode
  onSelectScope: () => void
}): JSX.Element => {
  return (
    <button
      type="button"
      className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 border-b border-[var(--c-layout-border)] px-4 py-3 text-left text-sm"
      onClick={onSelectScope}
    >
      {icon}
      <span className="font-semibold">{name}</span>
      <span className="ml-auto text-xs text-[var(--c-text-400)]">{scope}</span>
    </button>
  )
}

const SelectedFile = ({ file, onRemove }: { file: IFile; onRemove: (file: IFile) => void }): JSX.Element => {
  return (
    <li className="group hover:bg-accent text-smborder-[var(--c-layout-border)] relative rounded border px-3 py-2">
      <button
        type="button"
        className="absolute top-1.5 right-1.5 rounded p-0.5 text-[var(--c-text-400)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 cursor-pointer"
        onClick={() => onRemove(file)}
        aria-label={`Remove ${file.name}`}
      >
        <X width={12} height={12} />
      </button>
      <div className="mr-4 truncate font-semibold">{file.name}</div>
      <div className="mt-0.5 truncate text-xs text-[var(--c-text-400)]">{file.uid}</div>
      {file.location && <div className="mt-0.5 truncate text-xs text-[var(--c-text-400)]">{file.location}</div>}
      {file.folderPath && (
        <div className="mt-0.5 truncate text-xs text-[var(--c-text-400)]">
          Path: /{file.folderPath.map(f => f.name).join('/')}
        </div>
      )}
    </li>
  )
}

const SelectedFilesPanel = ({ failedFiles, onClose }: { failedFiles: string[]; onClose: () => void }): JSX.Element => {
  const { selectedFiles, setSelectedFiles } = useFileSelectContext()

  const handleRemove = (file: IFile): void => {
    setSelectedFiles(prev => prev.filter(f => f.uid !== file.uid))
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-[var(--c-layout-border)]">
      <div className="flex flex-col justify-between gap-2 border-b border-[var(--c-layout-border)] px-2 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Selected ({selectedFiles.length})</span>
          <button type="button" className="text-xs text-[var(--primary-500)] cursor-pointer" onClick={onClose}>
            Close
          </button>
        </div>
        {failedFiles.length > 0 && (
          <div className="rounded border border-[var(--warning-400)] bg-[var(--warning-50)] px-3 py-2">
            <div className="mb-1 text-sm font-semibold text-[var(--warning-600)]">{noAccessText.multi}</div>
            <ul className="space-y-1">
              {failedFiles.map(uid => (
                <li key={uid} className="flex items-start justify-between text-sm">
                  <div className="min-w-0">
                    <div className="">{uid}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {selectedFiles.length === 0 ? (
          <div className="p-4 text-center text-sm text-[var(--c-text-400)]">No files selected</div>
        ) : (
          <ul className="mb-3 space-y-1">
            {selectedFiles.map(file => (
              <SelectedFile key={file.uid} file={file} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const ScopeTable = ({
  onSelectScope,
  allowedScopes,
}: {
  onSelectScope: (scope: string, name: string) => void
  allowedScopes?: string[]
}): JSX.Element => {
  const [spaceFilter, setSpaceFilter] = useState('')
  const allowedScopeSet = new Set(allowedScopes)

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

  return (
    <>
      <Sticky className={'flex items-center justify-between gap-2 px-4 py-2'}>
        <input
          type="text"
          placeholder="Filter scopes by name..."
          value={spaceFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpaceFilter(e.target.value)}
          className="w-80 rounded border border-[var(--c-layout-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--primary-400)]"
        />
      </Sticky>
      <div className="flex-1 overflow-y-auto">
        <div className="flex-1 overflow-y-auto">
          {(!allowedScopes || allowedScopeSet.has('private')) && (
            <ScopeItem
              name="Private"
              scope="Private"
              icon={<LockIcon height={14} />}
              onSelectScope={() => onSelectScope('private', 'Private')}
            />
          )}
          {(!allowedScopes || allowedScopeSet.has('public')) && (
            <ScopeItem
              name="Public"
              scope="Public"
              icon={<GlobeIcon height={14} />}
              onSelectScope={() => onSelectScope('public', 'Public')}
            />
          )}
          {isSpacesLoading ? (
            <div className="p-4">
              <Loader />
            </div>
          ) : (
            (spacesData?.data ?? [])
              .filter(
                space =>
                  (!spaceFilter || space.name.toLowerCase().includes(spaceFilter.toLowerCase())) &&
                  (!allowedScopes || allowedScopeSet.has(`space-${space.id}`)),
              )
              .map(space => (
                <ScopeItem
                  key={space.id}
                  name={space.title}
                  scope={`space-${space.id}`}
                  icon={findSpaceTypeIcon(space.type)}
                  onSelectScope={() => onSelectScope(`space-${space.id}`, space.title)}
                />
              ))
          )}
          {!isSpacesLoading &&
            spacesData?.data &&
            spacesData.data.filter(s => !spaceFilter || s.name.toLowerCase().includes(spaceFilter.toLowerCase()))
              .length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--c-text-400)]">No spaces match your filter.</div>
            )}
        </div>
      </div>
    </>
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

  const debouncedNameFilter = useDebounce(nameFilter, 300)
  const debouncedUidFilter = useDebounce(uidFilter, 300)

  const { data: folderFiles, isLoading: isFolderFilesLoading } = useQuery({
    queryKey: ['folder-children-files', activeScope, selectedFolderId, page, debouncedNameFilter, debouncedUidFilter],
    queryFn: () =>
      fetchAccessibleFiles({
        scope: activeScope,
        folderId: selectedFolderId ? parseInt(selectedFolderId, 10) : 'null',
        type: ['UserFile'],
        filter: {
          name: debouncedNameFilter || undefined,
          states: ['closed'],
        },
        fields: {
          path: true,
        },
        uids: debouncedUidFilter.length > 0 ? debouncedUidFilter.split(',').map(uid => uid.trim()) : undefined,
        page,
        pageSize,
      }),
  })

  useEffect(() => {
    setPage(1)
  }, [selectedFolderId, nameFilter, uidFilter])

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
    <>
      <Sticky className={'flex items-center justify-between gap-2 px-4 py-2'}>
        <FileBreadcrumb
          currentFolderId={selectedFolderId ? Number(selectedFolderId) : 0}
          basePath=""
          metaPath={breadcrumbMetaPath}
          onNavigate={handleBreadcrumbNavigate}
        />
      </Sticky>
      <div className="flex-1 overflow-y-auto">
        <div>
          {/* Header */}
          <div
            className="sticky top-0 z-10 grid w-full items-center gap-3 border-b border-[var(--c-layout-border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--c-text-500)]"
            style={{ gridTemplateColumns: '40px 1fr 1fr' }}
          >
            <div />
            <div>Name</div>
            <div>ID</div>
          </div>
          {/* Filter row */}
          <div
            className="sticky top-[37px] z-10 grid w-full items-center gap-3 border-b border-[var(--c-layout-border)] bg-[var(--background)] px-4 py-1"
            style={{ gridTemplateColumns: '40px 1fr 1fr' }}
          >
            <div />
            <div>
              <input
                type="text"
                placeholder="Filter name..."
                autoComplete="off"
                value={nameFilter}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  setNameFilter(evt.target.value)
                }}
                className="w-full border border-[var(--c-layout-border)] px-2 py-1 text-xs font-normal outline-none focus:border-[var(--primary-400)]"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Filter by file ID(s), separate with commas..."
                autoComplete="off"
                value={uidFilter}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  setUidFilter(evt.target.value)
                }}
                className="w-full border border-[var(--c-layout-border)] px-2 py-1 text-xs font-normal outline-none focus:border-[var(--primary-400)]"
              />
            </div>
          </div>
          {/* Loading */}
          {isFolderFilesLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          )}
          {/* Empty */}
          {!isFolderFilesLoading && files.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--c-text-400)]">No files found.</div>
          )}
          {/* Rows */}
          {!isFolderFilesLoading &&
            files.map(file => {
              const isLicenseBlocked = validateLicense === true && file.fileLicense?.acceptanceStatus === 'pending'
              return (
                <div
                  key={file.uid}
                  className={clsx(
                    'grid w-full items-center gap-3 border-b border-[var(--c-layout-border-200)] px-4 py-1 transition-colors',
                    isLicenseBlocked
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-[var(--c-dropdown-hover-bg)]',
                    isFileSelected(file) && 'bg-[var(--primary-50)]',
                  )}
                  style={{
                    gridTemplateColumns: '40px 1fr 1fr',
                    minHeight: 44,
                  }}
                  onClick={() => {
                    if (!isLicenseBlocked) toggleFile(file)
                  }}
                  role="row"
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
                  <div className="flex items-center justify-center">
                    {type === 'radio' ? (
                      <Radio checked={isFileSelected(file)} onChange={() => {}} />
                    ) : (
                      <Checkbox checked={isFileSelected(file)} onChange={() => {}} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--c-link)]" title={file.name}>
                      {file.name}
                    </div>
                  </div>
                  <div className="truncate text-[13px] text-[var(--c-text-600)]" title={file.uid}>
                    {file.uid}
                  </div>
                </div>
              )
            })}
          <Tooltip id="license-blocked-tooltip" place="bottom" className="max-w-[90%] whitespace-normal break-words" />
        </div>
      </div>
      <div className="px-2">
        <NumberPagination
          page={page}
          totalPages={folderFiles?.meta.totalPages ?? 1}
          totalCount={folderFiles?.meta.total ?? 0}
          perPage={pageSize}
          setPage={setPage}
        />
      </div>
    </>
  )
}

const ScopeFolderTree = ({
  activeScope,
  activeScopeName,
}: {
  activeScope?: ServerScope
  activeScopeName?: string
}): JSX.Element => {
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
    <>
      <div className="mb-1 flex items-center gap-1 px-2 text-xs font-semibold text-[var(--c-text-500)]">
        {activeScope && <span className="truncate">{activeScopeName}</span>}
      </div>
      <FolderTree
        fetchChildren={fetchFolders}
        onSelect={handleFolderSelect}
        selectedId={selectedFolderId}
        rootLabel="/"
        queryKeyPrefix={activeScope ? [activeScope] : []}
      />
    </>
  )
}

const ModalBody = ({
  type,
  uids,
  selectedFiles,
  setSelectedFiles,
  allowedScopes,
  failedFiles,
  validateLicense,
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
  const [activeScope, setActiveScope] = useState<ServerScope | undefined>(extractContext.scope)
  const [activeScopeName, setActiveScopeName] = useState<string | undefined>(extractContext.name)
  const [showSelectedPanel, setShowSelectedPanel] = useState(uids.length > 0)

  const handleScopeClick = (scopeValue: string, label: string): void => {
    setActiveScope(scopeValue as ServerScope)
    setActiveScopeName(label)
    setSelectedFolderId(null)
    setFolderPath([])
    setViewMode('files')
  }

  const handleAllScopes = (): void => {
    setViewMode('scopes')
    setActiveScopeName(undefined)
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
        <div className="flex min-h-0 flex-1 flex-row">
          <div className="w-60 shrink-0 overflow-y-auto border-r border-[var(--c-layout-border)] p-2">
            <button
              type="button"
              className={clsx('mb-2 w-full cursor-pointer rounded px-3 py-1.5 text-left text-sm font-medium', {
                'bg-[var(--primary-100)] text-[var(--primary-600)]': viewMode === 'scopes',
                'hover:bg-accent': viewMode !== 'scopes',
              })}
              onClick={handleAllScopes}
            >
              All Scopes
            </button>
            {viewMode === 'files' && <ScopeFolderTree activeScope={activeScope} activeScopeName={activeScopeName} />}
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Button
              variant="default"
              className="absolute top-2 right-1 z-1"
              size="sm"
              onClick={() => setShowSelectedPanel(prev => !prev)}
            >
              Selected &nbsp;<ButtonBadge>{selectedFiles?.length}</ButtonBadge>
            </Button>
            {viewMode === 'scopes' && <ScopeTable allowedScopes={allowedScopes} onSelectScope={handleScopeClick} />}
            {viewMode === 'files' && (
              <FileTable activeScope={activeScope} type={type} validateLicense={validateLicense} />
            )}
          </div>
          {showSelectedPanel && (
            <SelectedFilesPanel failedFiles={failedFiles} onClose={() => setShowSelectedPanel(false)} />
          )}
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
 * @returns list of selected files
 */
export const useSelectFileModal = (
  title: string,
  type: DialogType,
  handleSelect: (files: IFile[]) => void,
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
  const { data: fetchAccessibleResult, isFetched: isAccessibleFilesFetched } = useFetchFilesByUIDQuery(
    isShown && uids ? uids : [],
  )
  const fetchAccessibleData = fetchAccessibleResult?.data || []
  const { validatedFilesCache, setValidatedFilesCache } = useRunJobFilesContext()
  const [failedFiles, setFailedFiles] = useState<string[]>([])

  useEffect(() => {
    if (!isShown) {
      return
    }
    setSelectedFiles([])
    setFailedFiles([])
  }, [isShown, uids])

  useEffect(() => {
    if (!isShown || !isAccessibleFilesFetched) {
      return
    }
    setSelectedFiles(fetchAccessibleData)
    const accessibleUidSet = new Set(fetchAccessibleData.map(f => f.uid))
    setFailedFiles((uids ?? []).filter(uid => !accessibleUidSet.has(uid)))
  }, [isShown, isAccessibleFilesFetched, fetchAccessibleData, uids])

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

  const hideModal = (): void => {
    setShowModal(false)
  }

  const modalComp = (
    <Modal variant="large" id="select-file-modal" headerText={title} hide={hideModal} isShown={isShown}>
      <ModalHeaderTop headerText={title} hide={hideModal} />

      {isShown && (
        <ModalBody
          type={type}
          setShowModal={setShowModal}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          uids={uids ?? []}
          failedFiles={failedFiles}
          allowedScopes={allowedScopes}
          validateLicense={validateLicense}
        />
      )}
      <Footer>
        <ButtonRow>
          <Button onClick={hideModal}>Cancel</Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={selectedFiles?.length === 0}>
            Select
          </Button>
        </ButtonRow>
      </Footer>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
