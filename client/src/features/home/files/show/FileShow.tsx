import React from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { Link, useLocation } from 'react-router-dom'
import Dropdown from '../../../../components/Dropdown'
import { HomeLabel } from '../../../../components/HomeLabel'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { ITab, TabsSwitch } from '../../../../components/TabsSwitch'
import { StyledTagItem, StyledTags } from '../../../../components/Tags'
import { Location } from '../../../../types/utils'
import { getBackPath } from '../../../../utils/getBackPath'
import { ActionsDropdownContent } from '../../ActionDropdownContent'
import { StyledBackLink } from '../../home.styles'
import { License } from '../../licenses/License'
import {
  ActionsButton,
  Header,
  HeaderLeft,
  HeaderRight,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Title,
  Topbox,
} from '../../show.styles'
import { ResourceScope } from '../../types'
import { fetchFile } from '../files.api'
import { IFile } from '../files.types'
import { useFilesSelectActions } from '../useFilesSelectActions'
import { FileDescription } from './styles'

const FileActions = ({
  scope,
  spaceId,
  file,
}: {
  scope?: ResourceScope
  spaceId?: string
  file: IFile
}) => {
  const actions = useFilesSelectActions({
    scope,
    spaceId,
    fileId: file.id,
    selectedItems: [file],
    resourceKeys: ['file', file.uid],
  })
  return (
    <>
      <Dropdown
        trigger="click"
        content={<ActionsDropdownContent actions={actions} />}
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>
      {actions['Open']?.modal}
      {actions['Download']?.modal}
      {actions['Edit file info']?.modal}
      {actions['Edit folder info']?.modal}
      {actions['Delete']?.modal}
      {actions['Organize']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
      {actions['Accept License']?.modal}
      {actions['Edit tags']?.modal}
    </>
  )
}


export const FileShow = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const location: Location = useLocation()
  const { fileId } = useParams<{ fileId: string }>()
  const { data, status } = useQuery(['file', fileId], () => fetchFile(fileId))
  const file = data?.files
  const meta = data?.meta
  const backPath = getBackPath(location, 'files', spaceId)

  if (status === 'loading') {
    return  <HomeLoader />
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
      tab: (
        <License license={meta.object_license} link={file.links.show_license} />
      ),
      hide: !meta.object_license || !meta.object_license.uid,
    },
  ] as ITab[]
  const scopeParamLink = `?scope=${scope?.toLowerCase()}`
  // const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''
  // const selectedScopeParam = currentTab && currentTab !== HOME_TABS.EVERYBODY ? currentTab.toLowerCase() : 'public'
  // const spaceId = file.space_id?.split('-')[1]

  return (
    <>
      <StyledBackLink linkTo={backPath}>
        Back to Files
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title>
              <FileIcon height={24} />
              &nbsp;{file.name}
              {file.show_license_pending && (
                <HomeLabel
                  value="License Pending Approval"
                  icon="fa-clock-o"
                  type="warning"
                  className=""
                  state={file.state}
                />
              )}
            </Title>
          </HeaderLeft>
          <HeaderRight>
            <FileActions scope={scope} spaceId={spaceId} file={file} />
          </HeaderRight>
        </Header>

        <FileDescription>
          {file.description
            ? file.description
            : 'This file has no description.'}
        </FileDescription>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal>
                {file.links.space ? (
                  <Link target="_blank" to={file.links.space}>
                    {file.location}
                  </Link>
                ) : (
                  <Link to={`/home/files${scopeParamLink}`}>
                    {file.location}
                  </Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>ID</MetadataKey>
              <MetadataVal>{file.uid}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Added By</MetadataKey>
              <MetadataVal>
                <Link target="_blank" to={file.links.user!}>
                  {file.added_by}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Origin</MetadataKey>
              <MetadataVal>
                {file.links?.origin_object?.origin_type === 'Job' ||
                file.links?.origin_object?.origin_type === 'Comparison' ? (
                  <Link
                    target="_blank"
                    to={`/home/executions/${file.links.origin_object.origin_uid}`}
                  >
                    {/* @ts-ignore */}
                    {file.origin?.text}
                  </Link>
                ) : (
                  <>
                    {typeof file.origin === 'object'
                      ? file.origin.text
                      : file.origin}
                  </>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>File Size</MetadataKey>
              <MetadataVal>{file.file_size}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal>{file.created_at_date_time}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        <MetadataSection>
          {file.tags.length > 0 && (
            <StyledTags>
              {file.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>

      <div className="pfda-padded-t40" />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
