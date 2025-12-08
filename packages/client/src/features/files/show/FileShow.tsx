import { useQuery } from '@tanstack/react-query'
import queryString from 'query-string'
import React from 'react'
import { Link, useLocation } from 'react-router'
import { ActionsMenu } from '../../../components/Menu'
import { HomeLabel } from '../../../components/HomeLabel'
import { Filler } from '../../../components/Page/styles'
import { ITab, TabsSwitch } from '../../../components/TabsSwitch'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '../../../components/Tags'
import { FileIcon } from '../../../components/icons/FileIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { theme } from '../../../styles/theme'
import { getBackPathNext } from '../../../utils/getBackPath'
import { ActionsMenuContent } from '../../home/ActionMenuContent'
import { ActionModalsRenderer } from '../../home/ActionModalsRenderer'
import { StyledBackLink } from '../../home/home.styles'
import {
  ActionsButton,
  HeaderLeft,
  HomeLoader,
  LockedRow,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  PathSection,
  ResourceHeader,
  Title,
  Topbox,
} from '../../home/show.styles'
import { HomeScope } from '../../home/types'
import { License } from '../../licenses/License'
import { ISpace } from '../../spaces/spaces.types'
import { fetchFile } from '../files.api'
import { IFile } from '../files.types'
import { useFilesSelectActions } from '../useFilesSelectActions'
import { FileDescription } from './styles'
import { FileBreadcrumb } from '../FileBreadcrumb'
import { defaultHomeContext, HomeScopeContextValue } from '../../home/HomeScopeContext'

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
  const { actions, modals } = useFilesSelectActions({
    homeScope,
    space,
    selectedItems: [file],
    resourceKeys: ['file', file.uid],
    folderId,
  })

  return (
    <>
      <ActionsMenu data-testid="file-show-actions-button">
        <ActionsMenuContent actions={actions} />
      </ActionsMenu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const FileShow = ({
  fileId,
  space,
  homeContext = defaultHomeContext
}: {
  fileId: string,
  space?: ISpace,
  homeContext?: HomeScopeContextValue
}) => {
  const { homeScope, homeScopeChangeHandler } = homeContext
  const location = useLocation()
  const { data, isLoading } = useQuery({
    queryKey: ['file', fileId],
    queryFn: () =>
      fetchFile(fileId!).then(d => {
        homeScopeChangeHandler(d.files.scope, d.files.featured)
        return d
      }),
  })
  const file = data?.files
  const meta = data?.meta
  const params = queryString.parse(location?.state?.fromSearch)
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
      header: `License: ${meta!.object_license && meta!.object_license.title}`,
      tab: <License license={meta!.object_license!} link={file.links.show_license} />,
      hide: !meta!.object_license || !meta!.object_license.uid,
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
                <HomeLabel value="License Pending Approval" icon="fa-clock-o" type="warning" className="" state={file.state ?? undefined} />
              )}
            </Title>
          </HeaderLeft>
          <div>
            <FileActionsDropdown homeScope={homeScope} space={space} file={file} folderId={folderId} />
          </div>
        </ResourceHeader>

        <PathSection>
          <FileBreadcrumb
            fileName={file.name}
            basePath={`/${space ? `spaces/${space.id}` : 'home'}/files`}
            labelText="File Path:"
            scope={homeScope}
            metaPath={data?.meta?.path}
          />
        </PathSection>

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
                {['Job', 'Comparison'].includes(file.links?.origin_object?.origin_type ?? '') &&
                file.origin && typeof file.origin === 'object' && file.origin.href ? (
                  <Link target="_blank" to={file.origin.href}>
                    {file.origin.text || file.origin.href}
                  </Link>
                ) : (
                  <>{typeof file.origin === 'object' ? file.origin?.text : file.origin}</>
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
        <FileDescription data-testid="file-description">
          {file.locked && (
            <LockedRow data-testid="file-locked">
              <LockIcon height={14} color={theme.colors.darkYellow} />
              File is locked
            </LockedRow>
          )}
          {file.description ? file.description : 'No description provided.'}
        </FileDescription>
      </Topbox>

      <Filler $size={40} />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
