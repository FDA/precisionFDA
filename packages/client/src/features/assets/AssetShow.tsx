import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router'
import { HomeLabel } from '../../components/HomeLabel'
import { Markdown, MarkdownStyle } from '../../components/Markdown'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '../../components/Tags'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { StyledBackLink } from '../home/home.styles'
import { License } from '../licenses/License'
import {
  ActionsButton,
  HeaderLeft,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  ResourceHeader,
  Title,
  Topbox,
} from '../home/show.styles'
import { HomeScope } from '../home/types'
import { ArchiveContents } from './ArchiveContents'
import { fetchAsset } from './assets.api'
import { IAsset } from './assets.types'
import { useAssetActions } from './useAssetSelectActions'
import { ITab, TabsSwitch } from '../../components/TabsSwitch'
import { FileIcon } from '../../components/icons/FileIcon'
import { Filler } from '../../components/Page/styles'
import { defaultHomeContext, HomeScopeContextValue } from '../home/HomeScopeContext'
import { ActionsMenu } from '../../components/Menu'
import { ActionsMenuContent } from '../home/ActionMenuContent'

const AssetActions = ({ homeScope, asset }: { homeScope?: HomeScope; asset: IAsset }) => {
  const { actions, modals } = useAssetActions({
    homeScope,
    selectedItems: [asset],
    resourceKeys: ['asset', asset.uid],
  })
  return (
    <>
      <ActionsMenu data-testid="asset-show-actions-button">
        <ActionsMenuContent actions={actions} />
      </ActionsMenu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const AssetShow = ({ assetUid, homeContext = defaultHomeContext }: { assetUid: string; homeContext?: HomeScopeContextValue }) => {
  const { homeScope, isHome, homeScopeChangeHandler } = homeContext
  const { data, isLoading } = useQuery({
    queryKey: ['asset', assetUid],
    queryFn: () =>
      fetchAsset(assetUid!).then(d => {
        if(isHome) {
          homeScopeChangeHandler(d.asset.scope, d.asset.featured)
        }
        return d
      }),
  })

  const asset = data?.asset
  const meta = data?.meta

  if (isLoading) {
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
      tab: (
        <MarkdownStyle>
          <Markdown data={asset.description} />
        </MarkdownStyle>
      ),
    },
    {
      header: 'Archive Contents',
      tab: <ArchiveContents data={asset.archive_content} />,
    },
    {
      header: `License: ${meta?.object_license && meta?.object_license.title}`,
      tab: <License license={meta?.object_license} link={asset.links.show_license} />,
      hide: !meta?.object_license || !meta?.object_license.uid,
    },
  ] as ITab[]

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`

  return (
    <>
      <StyledBackLink linkTo={`/home/assets${scopeParamLink}`}>Back to Assets</StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <FileIcon height={24} />
              {typeof asset?.origin === 'object' ? asset.origin.text : asset.name}
            </Title>
            {asset.show_license_pending && <HomeLabel value="License Pending Approval" icon="fa-clock-o" type="warning" />}
          </HeaderLeft>
          <div>
            <AssetActions homeScope={homeScope} asset={asset} />
          </div>
        </ResourceHeader>

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
                  <Link to={`/home/assets${scopeParamLink}`}>{homeScope === 'featured' ? 'Featured' : asset.location}</Link>
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

        {asset.tags.length > 0 && (
          <MetadataSection>
            <StyledTags>
              {asset.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          </MetadataSection>
        )}
        {Object.entries(asset.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags>
                  {Object.entries(asset.properties).map(([key, value]) => (
                    <StyledPropertyItem key={key}>
                      <StyledPropertyKey>{key}</StyledPropertyKey>
                      <span>{value}</span>
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
