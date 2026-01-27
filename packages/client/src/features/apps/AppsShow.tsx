import React from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { CloudResourcesHeaderButton } from '../../components/CloudResourcesHeaderButton'
import { HomeLabel } from '../../components/HomeLabel'
import { ActionsMenu } from '../../components/Menu'
import { RevisionMenu } from '../../components/Menu/RevisionMenu'
import { StyledTab, StyledTabList, StyledTabPanel } from '../../components/Tabs'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '../../components/Tags'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { IChallenge } from '../../types/challenge'
import { getSpaceIdFromScope } from '../../utils'
import { getBackPathNext } from '../../utils/getBackPath'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { defaultHomeContext, HomeScopeContextValue } from '../home/HomeScopeContext'
import { getHomeScopeFromServerScope } from '../home/getHomeScopeFromServerScope'
import { StyledBackLink, StyledRight } from '../home/home.styles'
import {
  HeaderLeft,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Pill,
  ResourceHeader,
  Title,
  Topbox,
} from '../home/show.styles'
import { HomeScope } from '../home/types'
import { useHomeDisplayScope } from '../home/useHomeDisplayScope'
import { getBasePath } from '../home/utils'
import { IApp } from './apps.types'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useFetchAppQuery } from './useFetchAppQuery'

export type AppShowOutletContext = {
  spaceId?: string
  spec: any
  readme: string
  appUid: string
}

const renderOptions = (app: IApp, meta: { release: string }) => {
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

  const scopeParamLink = `?scope=${getHomeScopeFromServerScope(app.scope, app.featured)}`

  const list = columns.map(e => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {e.header === 'location' && !e.link ? (
        <MetadataVal data-testid={e.dataTestId}>
          <Link to={`/home/apps${scopeParamLink}`}>
            {/* @ts-expect-error dynamic key */}
            {app.featured ? 'Featured' : app[e.value]}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        <MetadataVal data-testid={e.dataTestId}>
          <Link to={e.link} target="_blank">
            {/* @ts-expect-error dynamic key */}
            {app[e.value]}
          </Link>
        </MetadataVal>
      ) : (
        // @ts-expect-error dynamic key
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

const DetailActionsDropdown = ({
  homeScope,
  app,
  comparatorLinks,
  challenges,
  spaceId,
  isContributorOrHigher,
}: {
  homeScope?: HomeScope
  app: IApp
  comparatorLinks: { [key: string]: string }
  challenges?: IChallenge[]
  spaceId?: string
  isContributorOrHigher?: boolean
}) => {
  const { actions, modals } = useAppSelectionActions({
    homeScope,
    spaceId,
    selectedItems: [app],
    resetSelected: () => {},
    resourceKeys: ['app', app.uid],
    comparatorLinks,
    challenges,
    isContributorOrHigher,
  })

  let filteredActions = actions

  if (homeScope === 'spaces') {
    filteredActions = actions.filter(action => action.name === 'Copy to space')
  }

  filteredActions = filteredActions.filter(action => action.name !== 'Run')

  return (
    <>
      <ActionsMenu data-testid="app-show-actions-button">
        <ActionsMenuContent actions={filteredActions} />
      </ActionsMenu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const AppsShow = ({
  appUid,
  spaceId,
  isContributorOrHigher,
  homeContext = defaultHomeContext,
}: {
  appUid: string
  spaceId?: string
  isContributorOrHigher?: boolean
  homeContext?: HomeScopeContextValue
}): React.JSX.Element => {
  const { homeScope } = homeContext
  const location = useLocation()
  const { data, isLoading } = useFetchAppQuery(appUid!)

  useHomeDisplayScope(homeContext, data?.app.scope, data?.app.featured)

  const app = data?.app
  const meta = data?.meta

  if (isLoading)
    return (
      <>
        <HomeLoader />
        <Outlet context={{ spaceId, spec: null, readme: null, appUid }} />
      </>
    )

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
  const properties = Object.entries(app?.properties || {})

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
              {meta.comparator && <HomeLabel value="Comparator" icon="fa-bullseye" type="success" />}
              {meta.default_comparator && <HomeLabel value="Default comparator" icon="fa-bullseye" />}
              {meta.assigned_challenges.length > 0
                ? meta.assigned_challenges.map(item => (
                    <HomeLabel type="warning" icon="fa-trophy" value={item.name} key={item.id} />
                  ))
                : null}
            </Title>

            <RevisionMenu
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
                conditionType="all"
                asReactLink
              >
                Run App
                <Pill>rev{app.revision}</Pill>
              </CloudResourcesHeaderButton>
              <DetailActionsDropdown
                homeScope={homeScope}
                spaceId={spaceId}
                app={app}
                comparatorLinks={meta.links.comparators}
                challenges={meta.challenges}
                isContributorOrHigher={isContributorOrHigher}
              />
            </StyledRight>
          </div>
        </ResourceHeader>

        {renderOptions(app, meta)}
        {app.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {app.tags.map(tag => (
                    <StyledTagItem data-testid="app-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {properties.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags data-testid="properties-container">
                  {properties.map(([key, value]) => (
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
        <StyledTab
          activeClassName="active"
          end
          to={{ pathname: `${basePath}/apps/${app.uid}`, state: location.state }}
          data-testid="app-show-tab-spec"
        >
          Spec
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/apps/${app.uid}/jobs`, state: location.state }}
          data-testid="app-show-tab-executions"
        >
          Executions ({meta.accessible_jobs_count})
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/apps/${app.uid}/readme`, state: location.state }}
          data-testid="app-show-tab-readme"
        >
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Outlet context={{ spaceId, spec: meta.spec, readme: app.readme, appUid: app.uid } satisfies AppShowOutletContext} />
      </StyledTabPanel>
    </>
  )
}
