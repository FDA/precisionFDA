import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Dropdown from '../../../components/Dropdown'
import { FileIcon } from '../../../components/icons/FileIcon'
import { Markdown } from '../../../components/Markdown'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { HOME_TABS } from '../../../constants'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { StyledBackLink } from '../home.styles'
import { HomeLabel } from '../../../components/HomeLabel'
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
} from '../show.styles'
import { ResourceScope } from '../types'
import { ArchiveContents } from './ArchiveContents'
import { fetchAsset } from './assets.api'
import { IAsset } from './assets.types'
import { useAssetActions } from './useAssetSelectActions'
import { ITab, TabsSwitch } from '../../../components/TabsSwitch'
import { License } from '../licenses/License'
import { Filler } from '../../../components/Page/styles'

const AssetActions = ({
  scope,
  asset,
}: {
  scope: ResourceScope
  asset: IAsset
}) => {
  const actions = useAssetActions({
    scope,
    selectedItems: [asset],
    resourceKeys: ['asset', asset.uid],
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
      {actions['Delete']?.modal}
      {actions['Download']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
      {actions['Accept License']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Rename']?.modal}
    </>
  )
}

export const AssetShow = ({ scope = 'me' }: { scope?: ResourceScope }) => {
  const { assetUid } = useParams<{ assetUid: string }>()
  const [currentTab, setCurrentTab] = useState<any>('')

  const { data, status } = useQuery(['asset', assetUid], () =>
    fetchAsset(assetUid),
  )

  const asset = data?.asset
  const meta = data?.meta

  if (status === 'loading') {
    return <HomeLoader />
  }

  if (!asset || !asset.id)
    return (
      <NotFound>
        <h1>Asset not found</h1>
        <div>Sorry, this asset does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const tabsConfig = [
    {
      header: 'Description',
      tab: <Markdown data={asset.description} />,
    },
    {
      header: 'Archive Contents',
      tab: <ArchiveContents data={asset.archive_content} />,
    },
    {
      header: `License: ${meta.object_license && meta.object_license.title}`,
      tab: (
        <License
          license={meta.object_license}
          link={asset.links.show_license}
        />
      ),
      hide: !meta.object_license || !meta.object_license.uid,
    },
  ] as ITab[]

  const tab =
    currentTab && currentTab !== HOME_TABS.PRIVATE
      ? `/${currentTab.toLowerCase()}`
      : ''
  const scopeParamLink = `?scope=${scope.toLowerCase()}`

  return (
    <>
      <StyledBackLink linkTo={`/home/assets${scopeParamLink}`}>
        Back to Assets
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title>
              <FileIcon height={24} />
              &nbsp;
              {typeof asset?.origin == 'object'
                ? asset.origin.text
                : asset.name}
            </Title>
            {asset.show_license_pending && (
              <HomeLabel
                value="License Pending Approval"
                icon="fa-clock-o"
                type="warning"
              />
            )}
          </HeaderLeft>
          <HeaderRight>
            <AssetActions scope={scope} asset={asset} />
          </HeaderRight>
        </Header>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal>
                {asset.links.space ? (
                  <Link target="_blank" to={asset.links.space}>
                    {asset.location}
                  </Link>
                ) : (
                  <Link to={`/home/assets${scopeParamLink}`}>
                    {asset.location}
                  </Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>ID</MetadataKey>
              <MetadataVal>{asset.uid}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Added By</MetadataKey>
              <MetadataVal>
                <Link target="_blank" to={asset.links.user!}>
                  {asset.added_by}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Asset Name</MetadataKey>
              <MetadataVal>{asset.name}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>File Size</MetadataKey>
              <MetadataVal>{asset.file_size}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal>{asset.created_at_date_time}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        
        <MetadataSection>
          {asset.tags.length > 0 && (
            <StyledTags>
              {asset.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>

      <Filler size={40} />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
