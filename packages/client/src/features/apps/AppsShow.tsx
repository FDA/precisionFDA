/* eslint-disable no-nested-ternary */
import { omit, pick } from 'ramda'
import React, { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useParams, Navigate } from 'react-router-dom'
import { CloudResourcesHeaderButton } from '../../components/CloudResourcesHeaderButton'
import Dropdown from '../../components/Dropdown'
import { RevisionDropdown } from '../../components/Dropdown/RevisionDropdown'
import { HomeLabel } from '../../components/HomeLabel'
import { Markdown, MarkdownStyle } from '../../components/Markdown'
import {
  StyledTab,
  StyledTabList,
  StyledTabPanel,
} from '../../components/Tabs'
import { StyledTagItem, StyledTags, StyledPropertyItem, StyledPropertyKey } from '../../components/Tags'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { IChallenge } from '../../types/challenge'
import { getBackPathNext } from '../../utils/getBackPath'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { StyledBackLink, StyledRight } from '../home/home.styles'
import {
  ActionsButton,
  ResourceHeader,
  HeaderLeft,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Pill,
  Title,
  Topbox,
} from '../home/show.styles'
import { EmmitScope, HomeScope } from '../home/types'
import { AppExecutionsList } from './AppExecutionsList'
import { SpecTab } from './SpecTab'
import { IApp } from './apps.types'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useFetchAppQuery } from './useFetchAppQuery'
import { getBasePath } from '../home/utils'
import { getSpaceIdFromScope } from '../../utils'

const renderOptions = (app: IApp, meta: { release: string }, homeScope?: HomeScope) => {
  const spaceId = getSpaceIdFromScope(app.scope)
  const columns = [
    {
      header: 'location',
      value: 'location',
      link: app.links.space && `${app.links.space}/apps`,
      dataTestId: 'app-location',
    },
    {
      header: 'name',
      value: 'name',
      dataTestId: 'app-name',
    },
    {
      header: 'id',
      value: 'uid',
      dataTestId: 'app-uid',
    },
    {
      header: 'added by',
      value: 'added_by_fullname',
      link: app.links.user,
      dataTestId: 'app-added-by',
    },
    {
      header: 'created on',
      value: 'created_at_date_time',
      dataTestId: 'app-created-on',
    },
  ]

  if (app.forked_from) {
    columns.push({
      header: 'Forked from',
      value: 'forked_from',
      link: `${getBasePath(spaceId)}/apps/${app.forked_from}`,
      dataTestId: 'app-forked-from',
    })
  }

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`

  const list = columns.map((e: any) => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {e.header === 'location' && !e.link ? (
        // @ts-ignore
        <MetadataVal data-testid={e.dataTestId}>
          <Link to={`/home/apps${scopeParamLink}`}>
            {/* @ts-ignore */}
            {homeScope === 'featured' ? 'Featured' : app[e.value]}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        // @ts-ignore
        <MetadataVal data-testid={e.dataTestId}>
          <Link to={e.link} target="_blank">
            {/* @ts-ignore */}
            {app[e.value]}
          </Link>
        </MetadataVal>
      ) : (
        // @ts-ignore
        <MetadataVal data-testid={e.dataTestId}>{app[e.value]}</MetadataVal>
      )}
    </MetadataItem>
  ))

  return (
    <MetadataSection>
      <MetadataRow>
        {list}
        <MetadataItem>
          <MetadataKey>Ubuntu Release</MetadataKey>
          <MetadataVal data-testid="app-ubuntu-release">{meta.release}</MetadataVal>
        </MetadataItem>
      </MetadataRow>
    </MetadataSection>
  )
}

const DetailActionsDropdown = (
  { homeScope, app, comparatorLinks, challenges, spaceId }:
    { homeScope?: HomeScope, app: IApp, comparatorLinks: { [key: string]: string }, challenges?: IChallenge[], spaceId?: string }) => {
  let actions = useAppSelectionActions({
    homeScope,
    spaceId,
    selectedItems: [app],
    resetSelected: () => { },
    resourceKeys: ['app', app.uid],
    comparatorLinks,
    challenges,
  })

  if(homeScope === 'spaces') {
    actions = pick(['Copy to space', 'Attach to...'], actions)
  }

  actions = omit(['Run'], actions)

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
      {actions['Copy to space']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
      {actions['Export to']?.modal}
      {actions['Set as Challenge App']?.modal}
      {actions['Copy to My Home (private)']?.modal}
      {actions['Add to Comparators']?.modal}
      {actions['Remove from Comparators']?.modal}
      {actions['Set this app as comparison default']?.modal}
    </>
  )
}

export const AppsShow = ({ spaceId, emitScope, homeScope }: { homeScope?: HomeScope, spaceId?: string, emitScope?: EmmitScope }) => {
  const location = useLocation()
  const { appUid } = useParams<{ appUid: string }>()
  const { data, isLoading } = useFetchAppQuery(appUid)

  useEffect(() => {
    if(data) {
      if(emitScope) emitScope(data.app.scope, data.app.featured)
    }
  }, [data])

  const app = data?.app
  const meta = data?.meta
  
  if (isLoading) return <HomeLoader />
  
  if (!app || !meta)
  return (
    <NotFound>
      <h1>App not found</h1>
      <div>Sorry, this app does not exist or is not accessible by you.</div>
    </NotFound>
  )

  const appTitle = app.title ? app.title : app.name
  const backPath = getBackPathNext({
    location, 
    resourceLocation: 'apps',
    homeScope,
    spaceId,
  })

  const basePath = getBasePath(spaceId)

  return (
    <>
      <StyledBackLink linkTo={backPath} data-testid="app-back-link">
        Back to Apps
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <CubeIcon height={20} />
              <span data-testid="app-title">{appTitle}</span>
              {meta.comparator && (
                <HomeLabel
                  value="Comparator"
                  icon="fa-bullseye"
                  type="success"
                />
              )}
              {meta.default_comparator && (
                <HomeLabel value="Default comparator" icon="fa-bullseye" />
              )}
              {meta.assigned_challenges.length
                ? meta.assigned_challenges.map((item: any) => (
                  <HomeLabel
                    type="warning"
                    icon="fa-trophy"
                    value={item.name}
                    key={item.id}
                  />
                ))
                : null}
            </Title>

            <RevisionDropdown
              revisions={meta.revisions}
              selectedValue={app.revision}
              linkToRevision={r => `${basePath}/apps/${r.uid}`}
            />
          </HeaderLeft>
          <div>
            <StyledRight>
              <CloudResourcesHeaderButton
                href={`${getBasePath(spaceId)}/apps/${app.uid}/jobs/new`}
                isLinkDisabled={!app.links.run_job}
                conditionType='all'
                asReactLink
              >
                Run App
                <Pill>rev{app.revision}</Pill>
              </CloudResourcesHeaderButton>
              <DetailActionsDropdown
                homeScope={homeScope}
                spaceId={spaceId}
                app={app}
                comparatorLinks={meta.links?.comparators ?? []}
                challenges={meta.challenges}
              />
            </StyledRight>
          </div>
        </ResourceHeader>

        {renderOptions(app, meta, homeScope)}
        {app.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {app.tags.map(tag => (
                    <StyledTagItem data-testid="app-tag-item" key={tag}>{tag}</StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {app?.properties && Object.entries(app.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                  <MetadataKey>Properties</MetadataKey>
                    <StyledTags data-testid="properties-container">
                      {Object.entries(app.properties).map(([key, value]) => (
                        <StyledPropertyItem key={key}>
                          <StyledPropertyKey data-testid="app-property-key">{key}</StyledPropertyKey>
                          <span data-testid={`app-property-value-${key}`}>{value}</span>
                        </StyledPropertyItem>
                      ))}
                    </StyledTags>
                </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>

      <StyledTabList>
        <StyledTab activeClassName="active" end to={{ pathname: `${basePath}/apps/${app.uid}`, state: location.state }} data-testid="app-show-tab-spec">
          Spec
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${basePath}/apps/${app.uid}/jobs`, state: location.state }} data-testid="app-show-tab-executions">
          Executions ({meta.accessible_jobs_count})
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${basePath}/apps/${app.uid}/readme`, state: location.state }} data-testid="app-show-tab-readme">
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Routes>
          <Route path="/" element={<SpecTab spaceId={spaceId} spec={meta.spec} />} />
          <Route path="spec" element={<Navigate to={`${location.pathname}`} replace />} />
          <Route path="readme" element={<MarkdownStyle><Markdown data={app.readme} /></MarkdownStyle>} />
          <Route path="jobs" element={<AppExecutionsList appUid={app.uid} />} />
        </Routes>
      </StyledTabPanel>
    </>
  )
}
