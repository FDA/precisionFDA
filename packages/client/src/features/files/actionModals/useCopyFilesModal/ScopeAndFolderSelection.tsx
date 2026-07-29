import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { ServerScope } from '../../../home/types'
import { SpaceSelectionList } from '../../../spaces/SpaceSelectionList'
import type { EditableSpace } from '../../../spaces/spaces.api'
import { fetchFolderChildren } from '../../files.api'
import type { IFile, IFolder, IFolderPath } from '../../files.types'

const panelClass = cn('flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden bg-background')

const panelTitleClass = 'shrink-0 border-b border-border bg-muted/30 px-3 py-2'

const panelControlsClass = 'sticky top-0 z-10 shrink-0 border-b border-border bg-background px-3 py-2'

const scrollAreaClass = cn(
  'min-h-0 flex-1 overflow-auto p-1.5 [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [scrollbar-width:thin]',
  '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45 [&::-webkit-scrollbar-track]:bg-transparent',
)

const breadcrumbButtonClass = cn(
  'max-w-[150px] truncate rounded px-1.5 py-0.5 text-left text-xs !text-primary-400 transition-colors',
  'hover:bg-primary/10 hover:!text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
)

const selectionRowClass = cn(
  'flex w-full cursor-pointer items-center justify-between gap-2 border-x-0 border-t-0 border-b border-border bg-transparent px-3 py-2 text-left font-sans text-foreground transition-colors last:border-b-0 hover:bg-muted/50',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
)

const FolderList = ({
  spaceTarget,
  folderId,
  filterString = '',
  onSelect,
}: {
  spaceTarget: ServerScope
  folderId: number | null
  filterString: string
  onSelect: (folder: IFolder) => void
}) => {
  const { data = [], isLoading } = useQuery<(IFile | IFolder)[], Error>({
    queryKey: ['space_folder_list', spaceTarget, folderId],
    queryFn: () =>
      fetchFolderChildren({
        scopes: [spaceTarget],
        folderId: folderId?.toString(),
        types: ['Folder'],
      }),
  })

  if (isLoading) {
    return <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">Loading...</div>
  }

  const filteredFolders = data.filter(f => f.name.toLowerCase().includes(filterString.toLowerCase()))

  return filteredFolders.length === 0 ? (
    <div className="mx-auto flex max-w-75 flex-col items-center justify-center px-4 py-6 text-center text-muted-foreground">
      <span className="text-sm leading-6">
        There are no folders in this directory. You can copy files directly to this location.
      </span>
    </div>
  ) : (
    <div className="w-full border-collapse">
      {filteredFolders?.map(folder => (
        <button type="button" key={folder.id} className={selectionRowClass} onClick={() => onSelect(folder as IFolder)}>
          <div className="flex min-w-0 flex-1 items-center">
            <div className="block min-w-0 max-w-full wrap-break-word whitespace-normal text-sm font-medium text-foreground">
              <span className="-mt-1 mr-1 inline-block align-middle text-muted-foreground">
                <FolderIcon width={14} height={14} />
              </span>
              <span title={folder.name}>{folder.name}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export const ScopeAndFolderSelection = ({
  sourceScopes,
  onSelectScope,
  onSelectFolder,
  fixedTarget,
}: {
  sourceScopes: ServerScope[]
  onSelectScope: (scope: ServerScope | null) => void
  onSelectFolder: (folderId: number | undefined) => void
  /** Locks the destination to this scope: no space selection, only folder selection within it. */
  fixedTarget?: EditableSpace
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<IFolderPath[]>([])
  const [folderId, setFolderId] = useState<number | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<EditableSpace | undefined>(fixedTarget)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<'spaces' | 'folders'>('spaces')
  const BREADCRUMBS_LIMIT = 2

  const handleSelectBreadcrumb = (id: number | null): void => {
    setSearchQuery('')
    if (id === null) {
      setFolderId(null)
      onSelectFolder(undefined)
      setBreadcrumbs(breadcrumbs.slice(0, 1))
    } else {
      const currentFolderIndex = breadcrumbs.findIndex((b: IFolderPath) => b.id === id)
      setFolderId(id)
      onSelectFolder(id)
      setBreadcrumbs(breadcrumbs.slice(0, currentFolderIndex + 1))
    }
  }

  const handleSelectFolder = (folder: IFolder): void => {
    setFolderId(folder.id)
    onSelectFolder(folder.id)
    setSearchQuery('')

    if (!folder.path?.length) {
      setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
      return
    }

    const previousFolder = folder.path[1]
    const nearestFolder = breadcrumbs[breadcrumbs.length - 1]
    if (!previousFolder?.id || previousFolder.id === nearestFolder.id) {
      setBreadcrumbs([...breadcrumbs, folder.path[0]])
    }
  }

  useEffect(() => {
    if (!selectedTarget?.scope) {
      setBreadcrumbs([])
      setFolderId(null)
      onSelectScope(null)
      onSelectFolder(undefined)
      setSearchType('spaces')
      setSearchQuery('')
      return
    }
    setSearchType('folders')
    setSearchQuery('')
    setBreadcrumbs([{ id: null, name: selectedTarget.name }])
    onSelectScope(selectedTarget.scope as ServerScope)
  }, [selectedTarget?.scope])

  return (
    <div className={panelClass}>
      <div className={panelTitleClass}>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destination</div>
      </div>
      <div className={panelControlsClass}>
        <div className="flex gap-2">
          <Input
            className="h-8 min-w-0 flex-1"
            placeholder={`Search ${searchType}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button className="h-8 shrink-0" variant="outline" type="button" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-0.5 text-xs">
          {!fixedTarget && (
            <button type="button" className={breadcrumbButtonClass} onClick={() => setSelectedTarget(undefined)}>
              All Scopes
            </button>
          )}
          {breadcrumbs.length > BREADCRUMBS_LIMIT && (
            <span className="flex items-center gap-0.5">
              {!fixedTarget && <span className="px-0.5 text-muted-foreground">/</span>}
              <button
                type="button"
                className={breadcrumbButtonClass}
                onClick={() => handleSelectBreadcrumb(breadcrumbs[breadcrumbs.length - (BREADCRUMBS_LIMIT + 1)].id)}
              >
                ...
              </button>
            </span>
          )}
          {breadcrumbs.slice(-BREADCRUMBS_LIMIT).map((b, index) => (
            <span key={`${b.id}-${b.name}`} className="flex items-center gap-0.5">
              {!(fixedTarget && breadcrumbs.length <= BREADCRUMBS_LIMIT && index === 0) && (
                <span className="px-0.5 text-muted-foreground">/</span>
              )}
              <button
                type="button"
                className={breadcrumbButtonClass}
                onClick={() => handleSelectBreadcrumb(b.id)}
                title={b.name}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={scrollAreaClass}>
        {!selectedTarget && (
          <SpaceSelectionList
            excludeScopes={sourceScopes}
            filterString={searchQuery}
            onSelect={space => setSelectedTarget(space)}
            includeMyHome
          />
        )}
        {selectedTarget && (
          <FolderList
            folderId={folderId}
            spaceTarget={selectedTarget.scope as ServerScope}
            filterString={searchQuery}
            onSelect={handleSelectFolder}
          />
        )}
      </div>
    </div>
  )
}
