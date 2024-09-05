import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { BreadcrumbDivider } from '../../../../components/Breadcrumb'
import { Button } from '../../../../components/Button'
import { InputText } from '../../../../components/InputText'
import { StyledName } from '../../../../components/ResourceTable'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { HomeIcon } from '../../../../components/icons/HomeIcon'
import { StyledCell } from '../../../actionModals/styles'
import { ServerScope } from '../../../home/types'
import { ModalContentPadding, ModalPageCol } from '../../../modal/styles'
import { SearchBar } from '../../../resources/styles'
import { FdaRestrictedIcon } from '../../../spaces/FdaRestrictedIcon'
import { ProtectedIcon } from '../../../spaces/ProtectedIcon'
import { EditableSpace, fetchEditableSpacesList } from '../../../spaces/spaces.api'
import { findSpaceTypeIcon } from '../../../spaces/useSpacesColumns'
import { FetchFolderChildrenResponse, fetchFolderChildren } from '../../files.api'
import { IFile, IFolderPath } from '../../files.types'
import {
  CopyModalScrollPlace,
  ModalSearchBarWrapper,
  ModalStyledBreadcrumbs,
  ModalStyledCell,
  ModalStyledRow,
  MyHomeStyledName,
  ShorternFolderName,
  SpaceAndFolderTable,
  SpaceStyledName,
  StyledBreadcrumb,
  StyledBreadcrumbButton,
  StyledNameIcon,
  StyledStickyTop,
} from './styles'

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
    return <ModalContentPadding>Loading...</ModalContentPadding>
  }

  const spacesList = data.filter(
    space =>
      sourceScopes.indexOf(space.scope as ServerScope) === -1 && space.name.toLowerCase().includes(filterString.toLowerCase()),
  )

  const isFromMyHome = sourceScopes.indexOf('private') > -1
  if (spacesList.length === 0 && isFromMyHome) {
    return 'You have no spaces.'
  }

  return (
    <SpaceAndFolderTable>
      <tbody>
        {!isFromMyHome && (
          <ModalStyledRow onClick={() => onSelect(MY_HOME)}>
            <ModalStyledCell>
              <MyHomeStyledName data-turbolinks="false">
                <StyledNameIcon>
                  <HomeIcon />
                </StyledNameIcon>
                {MY_HOME.name}
              </MyHomeStyledName>
            </ModalStyledCell>
            <StyledCell>
              <MyHomeStyledName>{MY_HOME.scope}</MyHomeStyledName>
            </StyledCell>
          </ModalStyledRow>
        )}
        {spacesList.map((s, index) => (
          <ModalStyledRow key={index} onClick={() => onSelect(s)}>
            <ModalStyledCell>
              <SpaceStyledName data-turbolinks="false">
                <StyledNameIcon>{findSpaceTypeIcon(s.type)}</StyledNameIcon>
                {s.protected && <ProtectedIcon color="var(--c-text-700)" />}
                {s.restricted_reviewer && <FdaRestrictedIcon color="var(--c-text-700)" />}
                <ShorternFolderName>{s.name}</ShorternFolderName>
              </SpaceStyledName>
            </ModalStyledCell>
            <StyledCell>
              <StyledName>{s.scope}</StyledName>
            </StyledCell>
          </ModalStyledRow>
        ))}
      </tbody>
    </SpaceAndFolderTable>
  )
}

const FolderList = ({
  spaceTarget,
  folderId,
  filterString = '',
  onSelect,
}: {
  spaceTarget: string
  folderId: number | null
  filterString: string
  onSelect: (folder: IFile) => void
}) => {
  const spaceTargetId = spaceTarget.split('-')[1]
  const { data = [] as unknown as FetchFolderChildrenResponse, isLoading } = useQuery({
    queryKey: ['space_folder_list', spaceTarget, folderId],
    queryFn: () => fetchFolderChildren(undefined, spaceTargetId, folderId?.toString()),
  })

  if (isLoading) {
    return <ModalContentPadding>Loading...</ModalContentPadding>
  }

  const folders = data.nodes.filter(n => n.type === 'Folder') as IFile[]

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(filterString.toLowerCase()))

  return folders.length === 0 ? (
    <ModalContentPadding>
      There are no folders in this directory. You can copy files directly to this location.
    </ModalContentPadding>
  ) : (
    <SpaceAndFolderTable>
      <tbody>
        {filteredFolders?.map(folder => (
          <ModalStyledRow key={folder.id} onClick={() => onSelect(folder)}>
            <ModalStyledCell>
              <SpaceStyledName data-turbolinks="false">
                <StyledNameIcon>
                  <FolderIcon width={18} />
                </StyledNameIcon>
                <ShorternFolderName>{folder.name}</ShorternFolderName>
              </SpaceStyledName>
            </ModalStyledCell>
          </ModalStyledRow>
        ))}
      </tbody>
    </SpaceAndFolderTable>
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

  const handleSelectFolder = (folder: IFile) => {
    setFolderId(folder.id)
    onSelectFolder(folder.id)
    setSearchQuery('')
    const previousFolder = folder.path[1]
    const nearestFolder = breadcrumbs[breadcrumbs.length - 1]
    if (!previousFolder.id || previousFolder.id === nearestFolder.id) {
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
    <ModalPageCol>
      <CopyModalScrollPlace>
        <StyledStickyTop>
          <ModalSearchBarWrapper>
            <SearchBar>
              <InputText
                placeholder={`Search ${searchType}...`}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <Button type="button" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </SearchBar>
          </ModalSearchBarWrapper>
          <ModalStyledBreadcrumbs>
            <StyledBreadcrumbButton data-variant="link" onClick={() => setSelectedTarget(undefined)}>
              All Scopes
            </StyledBreadcrumbButton>
            {breadcrumbs.length > BREADCRUMBS_LIMIT && (
              <StyledBreadcrumb>
                <BreadcrumbDivider>/</BreadcrumbDivider>
                <StyledBreadcrumbButton
                  data-variant="link"
                  onClick={() => handleSelectBreadcrumb(breadcrumbs[breadcrumbs.length - (BREADCRUMBS_LIMIT + 1)].id)}
                >
                  ...
                </StyledBreadcrumbButton>
              </StyledBreadcrumb>
            )}
            {breadcrumbs.slice(-BREADCRUMBS_LIMIT).map((b, index) => (
              <StyledBreadcrumb key={`divider-${index}`}>
                <BreadcrumbDivider>/</BreadcrumbDivider>
                <StyledBreadcrumbButton data-variant="link" onClick={() => handleSelectBreadcrumb(b.id)}>
                  {b.name}
                </StyledBreadcrumbButton>
              </StyledBreadcrumb>
            ))}
          </ModalStyledBreadcrumbs>
        </StyledStickyTop>

        {!selectedTarget && <SpacesList sourceScopes={sourceScopes} onSelect={setSelectedTarget} filterString={searchQuery} />}
        {selectedTarget && (
          <FolderList
            folderId={folderId}
            spaceTarget={selectedTarget.scope}
            filterString={searchQuery}
            onSelect={handleSelectFolder}
          />
        )}
      </CopyModalScrollPlace>
    </ModalPageCol>
  )
}
