import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button'
import { InputText } from '../../../../components/InputText'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { HomeIcon } from '../../../../components/icons/HomeIcon'
import { cn } from '../../../../utils/cn'
import { getSpaceIdFromScope } from '../../../../utils'
import { ServerScope } from '../../../home/types'
import { FdaRestrictedIcon } from '../../../spaces/FdaRestrictedIcon'
import { ProtectedIcon } from '../../../spaces/ProtectedIcon'
import { EditableSpace, fetchEditableSpacesList } from '../../../spaces/spaces.api'
import { findSpaceTypeIcon } from '../../../spaces/useSpacesColumns'
import { fetchFolderChildren } from '../../files.api'
import { IFile, IFolder, IFolderPath } from '../../files.types'
import styles from './CopyFilesModal.module.css'

const MY_HOME = {
  name: 'My Home',
  scope: 'private',
}

const SpacesList = ({
  sourceScopes,
  filterString = '',
  onSelect,
}: {
  sourceScopes: ServerScope[]
  filterString?: string
  onSelect: (scope: EditableSpace | typeof MY_HOME) => void
}) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['editable_spaces_list'],
    queryFn: fetchEditableSpacesList,
  })

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading...</div>
  }

  const spacesList = data.filter(
    space =>
      sourceScopes.indexOf(space.scope as ServerScope) === -1 && space.name.toLowerCase().includes(filterString.toLowerCase()),
  )

  const isFromMyHome = sourceScopes.indexOf('private') > -1
  if (spacesList.length === 0 && isFromMyHome) {
    return <div className={styles.emptyState}><span className={styles.emptyStateText}>You have no spaces.</span></div>
  }

  return (
    <div className={styles.selectionList}>
      {!isFromMyHome && (
        <div
          className={styles.selectionRow}
          onClick={() => onSelect(MY_HOME)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(MY_HOME)}
        >
          <div className={cn(styles.selectionCell, styles.selectionCellName)}>
            <div className={styles.itemName}>
              <span className={styles.itemIcon}>
                <HomeIcon />
              </span>
              <span className={cn(styles.itemLabel, styles.itemLabelBold)}>{MY_HOME.name}</span>
            </div>
          </div>
          <div className={cn(styles.selectionCell, styles.selectionCellMeta)}>
            <span className={styles.scopeLabel}>{MY_HOME.scope}</span>
          </div>
        </div>
      )}
      {spacesList.map((s, index) => {
        const spaceId = getSpaceIdFromScope(s.scope as ServerScope)
        return (
          <div
            key={index}
            className={styles.selectionRow}
            onClick={() => onSelect(s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(s)}
          >
            <div className={cn(styles.selectionCell, styles.selectionCellName)}>
              <div className={styles.itemName}>
                <span className={styles.itemIcon}>{findSpaceTypeIcon(s.type)}</span>
                <span className={styles.itemBadges}>
                  {s.protected && <ProtectedIcon color="var(--c-text-700)" />}
                  {s.restricted_reviewer && <FdaRestrictedIcon color="var(--c-text-700)" />}
                </span>
                <span className={cn(styles.itemLabel, styles.truncate)} title={s.title}>{s.title}</span>
              </div>
            </div>
            <div className={cn(styles.selectionCell, styles.selectionCellMeta)}>
              <a
                href={`/spaces/${spaceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.scopeLabelLink}
                onClick={(e) => e.stopPropagation()}
              >
                {s.scope}
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
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
    queryFn: () => fetchFolderChildren({ scopes: [spaceTarget], folderId: folderId?.toString(), types: ['Folder'] }),
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
          onKeyDown={(e) => e.key === 'Enter' && onSelect(folder as IFolder)}
        >
          <div className={cn(styles.selectionCell, styles.selectionCellName)}>
            <div className={styles.itemName}>
              <span className={styles.itemIcon}>
                <FolderIcon width={18} />
              </span>
              <span className={cn(styles.itemLabel, styles.truncate)} title={folder.name}>{folder.name}</span>
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
  const [selectedTarget, setSelectedTarget] = useState<EditableSpace | typeof MY_HOME | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<'spaces' | 'folders'>('spaces')
  const BREADCRUMBS_LIMIT = 2

  const handleSelectBreadcrumb = (id: number | null) => {
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

  const handleSelectFolder = (folder: IFolder) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
          <Button className={styles.searchClearButton} type="button" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        </div>
        <div className={styles.breadcrumbs}>
          <button
            type="button"
            className={styles.breadcrumbButton}
            onClick={() => setSelectedTarget(undefined)}
          >
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
        {!selectedTarget && <SpacesList sourceScopes={sourceScopes} onSelect={setSelectedTarget} filterString={searchQuery} />}
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
