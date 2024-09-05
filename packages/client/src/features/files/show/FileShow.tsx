import { useQuery } from '@tanstack/react-query'
import { parse } from 'query-string'
import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Dropdown from '../../../components/Dropdown'
import { HomeLabel } from '../../../components/HomeLabel'
import { Filler } from '../../../components/Page/styles'
import { ITab, TabsSwitch } from '../../../components/TabsSwitch'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '../../../components/Tags'
import { FileIcon } from '../../../components/icons/FileIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { theme } from '../../../styles/theme'
import { getBackPathNext } from '../../../utils/getBackPath'
import { ActionsDropdownContent } from '../../home/ActionDropdownContent'
import { StyledBackLink } from '../../home/home.styles'
import {
  ActionsButton,
  ResourceHeader,
  HeaderLeft,
  HomeLoader,
  LockedRow,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Title,
  Topbox,
} from '../../home/show.styles'
import { EmmitScope, HomeScope } from '../../home/types'
import { License } from '../../licenses/License'
import { ISpace } from '../../spaces/spaces.types'
import { fetchFile } from '../files.api'
import { IFile } from '../files.types'
import { useFilesSelectActions } from '../useFilesSelectActions'
import { FileDescription } from './styles'

const FileActionsDropdown = ({
  homeScope,
  space,
  file,
  folderId,
}: {
  homeScope?: HomeScope
  space?: ISpace
  file: IFile
  folderId?: string
}) => {
  const actions = useFilesSelectActions({
    homeScope,
    space,
    selectedItems: [file],
    resourceKeys: ['file', file.uid],
    folderId,
  })

  return (
    <>
      <Dropdown trigger="click" content={<ActionsDropdownContent actions={actions} />}>
        {dropdownProps => <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />}
      </Dropdown>
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
    </>
  )
}

export const FileShow = ({ emitScope, space, homeScope }: { homeScope?: HomeScope; emitScope?: EmmitScope; space?: ISpace }) => {
  const location = useLocation()
  const { fileId } = useParams<{ fileId: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ['file', fileId],
    queryFn: () =>
      fetchFile(fileId).then(d => {
        if (emitScope) emitScope(d.files.scope, d.files.featured)
        return d
      }),
  })
  const file = data?.files
  const meta = data?.meta
  const params = parse(location?.state?.fromSearch)
  const folderId = params?.folder_id as string | undefined

  if (isLoading) {
    return <HomeLoader />
  }

  if (!file || !file.id)
    return (
      <NotFound>
        <h1>File not found</h1>
        <div>Sorry, this file does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const tabsConfig = [
    {
      header: `License: ${meta.object_license && meta.object_license.title}`,
      tab: <License license={meta.object_license} link={file.links.show_license} />,
      hide: !meta.object_license || !meta.object_license.uid,
    },
  ] as ITab[]

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
  const backPath = getBackPathNext({ spaceId: space?.id, location, resourceLocation: 'files', homeScope })

  return (
    <>
      <StyledBackLink linkTo={backPath} data-testid="file-back-link">
        Back to Files
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <FileIcon height={22} />
              <span data-testid="file-name">{file.name}</span>
              {file.show_license_pending && (
                <HomeLabel value="License Pending Approval" icon="fa-clock-o" type="warning" className="" state={file.state} />
              )}
            </Title>
          </HeaderLeft>
          <div>
            <FileActionsDropdown homeScope={homeScope} space={space} file={file} folderId={folderId} />
          </div>
        </ResourceHeader>

        <FileDescription data-testid="file-description">
          {file.locked && (
            <LockedRow data-testid="file-locked">
              <LockIcon height={14} color={theme.colors.darkYellow} />
              File is locked
            </LockedRow>
          )}
          {file.description ? file.description : 'No description provided.'}
        </FileDescription>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal data-testid="file-location">
                {file.links.space ? (
                  <Link target="_blank" to={file.links.space}>
                    {file.location}
                  </Link>
                ) : (
                  <Link to={`/home/files${scopeParamLink}`}>{homeScope === 'featured' ? 'Featured' : file.location}</Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>ID</MetadataKey>
              <MetadataVal data-testid="file-uid">{file.uid}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Added By</MetadataKey>
              <MetadataVal data-testid="file-added-by">
                <Link target="_blank" to={file.links.user!}>
                  {file.added_by}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Origin</MetadataKey>
              <MetadataVal data-testid="file-origin">
                {['Job', 'Comparison'].includes(file.links?.origin_object?.origin_type ?? '') ? (
                  <Link target="_blank" to={`${file.origin?.href}`}>
                    {file.origin?.text}
                  </Link>
                ) : (
                  <>{typeof file.origin === 'object' ? file.origin.text : file.origin}</>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>File Size</MetadataKey>
              <MetadataVal data-testid="file-size">{file.file_size ?? 'N/A'}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal data-testid="file-created-on">{file.created_at_date_time}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        {file.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {file.tags.map(tag => (
                    <StyledTagItem data-testid="file-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {Object.entries(file.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags data-testid="properties-container">
                  {Object.entries(file.properties).map(([key, value]) => (
                    <StyledPropertyItem key={key}>
                      <StyledPropertyKey data-testid="file-property-key">{key}</StyledPropertyKey>
                      <span data-testid={`file-property-value-${key}`}>{value}</span>
                    </StyledPropertyItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>

      <Filler $size={40} />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
