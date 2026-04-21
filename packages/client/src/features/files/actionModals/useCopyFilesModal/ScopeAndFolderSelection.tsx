import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { InputText } from '@/components/InputText'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { cn } from '@/utils/cn'
import type { ServerScope } from '../../../home/types'
import { SpaceSelectionList } from '../../../spaces/SpaceSelectionList'
import type { EditableSpace } from '../../../spaces/spaces.api'
import { fetchFolderChildren } from '../../files.api'
import type { IFile, IFolder, IFolderPath } from '../../files.types'
import styles from './CopyFilesModal.module.css'

const MY_HOME: EditableSpace = {
  name: 'My Home',
  title: 'My Home',
  scope: 'private',
  type: 'private_type',
  protected: false,
  restrictedReviewer: false,
}

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
    return <div className={styles.loadingContainer}>Loading...</div>
  }

  const filteredFolders = data.filter(f => f.name.toLowerCase().includes(filterString.toLowerCase()))

  return filteredFolders.length === 0 ? (
    <div className={styles.emptyState}>
      <span className={styles.emptyStateText}>
        There are no folders in this directory. You can copy files directly to this location.
      </span>
    </div>
  ) : (
    <div className={styles.selectionList}>
      {filteredFolders?.map(folder => (
        <div
          key={folder.id}
          className={styles.selectionRow}
          onClick={() => onSelect(folder as IFolder)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(folder as IFolder)}
        >
          <div className={cn(styles.selectionCell, styles.selectionCellName)}>
            <div className={styles.itemName}>
              <span className={styles.itemIcon}>
                <FolderIcon width={18} />
              </span>
              <span className={cn(styles.itemLabel, styles.truncate)} title={folder.name}>
                {folder.name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const ScopeAndFolderSelection = ({
  sourceScopes,
  onSelectScope,
  onSelectFolder,
}: {
  sourceScopes: ServerScope[]
  onSelectScope: (scope: ServerScope | null) => void
  onSelectFolder: (folderId: number | undefined) => void
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<IFolderPath[]>([])
  const [folderId, setFolderId] = useState<number | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<EditableSpace | undefined>(undefined)
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
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.searchWrapper}>
          <InputText
            className={styles.searchInput}
            placeholder={`Search ${searchType}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button className={styles.searchClearButton} type="button" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        </div>
        <div className={styles.breadcrumbs}>
          <button type="button" className={styles.breadcrumbButton} onClick={() => setSelectedTarget(undefined)}>
            All Scopes
          </button>
          {breadcrumbs.length > BREADCRUMBS_LIMIT && (
            <span className={styles.breadcrumbItem}>
              <span className={styles.breadcrumbDivider}>/</span>
              <button
                type="button"
                className={styles.breadcrumbButton}
                onClick={() => handleSelectBreadcrumb(breadcrumbs[breadcrumbs.length - (BREADCRUMBS_LIMIT + 1)].id)}
              >
                ...
              </button>
            </span>
          )}
          {breadcrumbs.slice(-BREADCRUMBS_LIMIT).map((b, index) => (
            <span key={`divider-${index}`} className={styles.breadcrumbItem}>
              <span className={styles.breadcrumbDivider}>/</span>
              <button
                type="button"
                className={styles.breadcrumbButton}
                onClick={() => handleSelectBreadcrumb(b.id)}
                title={b.name}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.scrollArea}>
        {!selectedTarget && (
          <SpaceSelectionList
            excludeScopes={sourceScopes}
            filterString={searchQuery}
            selectedScope={undefined}
            onSelect={setSelectedTarget}
            myHome={
              !sourceScopes.includes('private')
                ? {
                    isSelected: false,
                    onSelect: () => setSelectedTarget(MY_HOME),
                  }
                : undefined
            }
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
