import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { CloudResourcesHeaderButton } from '@/components/CloudResourcesHeaderButton'
import { CopyText } from '@/components/CopyText/CopyText'
import { HomeLabel } from '@/components/HomeLabel'
import { CubeIcon } from '@/components/icons/CubeIcon'
import { ActionsMenu } from '@/components/Menu'
import { RevisionMenu } from '@/components/Menu/RevisionMenu'
import { toastInfo } from '@/components/NotificationCenter/ToastHelper'
import { StyledTab, StyledTabList, StyledTabPanel } from '@/components/Tabs'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '@/components/Tags'
import type { IChallenge } from '@/types/challenge'
import { getSpaceIdFromScope } from '@/utils'
import { getBackPathNext } from '@/utils/getBackPath'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { getHomeScopeFromServerScope } from '../home/getHomeScopeFromServerScope'
import { defaultHomeContext, type HomeScopeContextValue } from '../home/HomeScopeContext'
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
import type { HomeScope } from '../home/types'
import { useHomeDisplayScope } from '../home/useHomeDisplayScope'
import { getBasePath } from '../home/utils'
import { UserDetailsDrawer } from '../users/UserDetailsDrawer'
import type { IApp } from './apps.types'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useFetchAppQuery } from './useFetchAppQuery'

export type AppShowOutletContext = {
  spaceId?: string
  spec: any
  readme: string
  appUid: string
}

const AppDetails = ({ app, meta }: { app: IApp; meta: { release: string } }) => {
  const [isUserOpen, setIsUserOpen] = useState<boolean>(false)
  const spaceId = getSpaceIdFromScope(app.scope)
  const spaceLink = spaceId ? `/spaces/${spaceId}/apps` : undefined
  const columns = [
    {
      header: 'location',
      value: 'location',
      link: spaceLink,
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
      value: 'addedByFullname',
      dataTestId: 'app-added-by',
    },
    {
      header: 'created on',
      value: 'createdAtDateTime',
      dataTestId: 'app-created-on',
    },
  ]

  if (app.forkedFrom) {
    columns.push({
      header: 'Forked from',
      value: 'forkedFrom',
      link: `${getBasePath(spaceId)}/apps/${app.forkedFrom}`,
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
      ) : e.value === 'uid' ? (
        <MetadataVal data-testid={e.dataTestId}>
          <CopyText
            className="inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]"
            value={app.uid}
            onCopy={() => toastInfo('App ID copied to clipboard')}
          >
            <span>{app.uid}</span>
          </CopyText>
        </MetadataVal>
      ) : e.value === 'addedByFullname' ? (
        <MetadataVal data-testid={e.dataTestId}>
          <button
            type="button"
            className={'inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]'}
            onClick={() => setIsUserOpen(true)}
          >
            {app.addedByFullname}
          </button>
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

      <UserDetailsDrawer userId={app.addedByUserId} open={isUserOpen} onClose={() => setIsUserOpen(false)} />
    </MetadataSection>
  )
}

const DetailActionsDropdown = ({
  homeScope,
  app,
  meta,
  challenges,
  spaceId,
  isContributorOrHigher,
}: {
  homeScope?: HomeScope
  app: IApp
  meta: { comparator: boolean; defaultComparator: boolean }
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
    appComparator: meta.comparator,
    appDefaultComparator: meta.defaultComparator,
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
}) => {
  const { homeScope } = homeContext
  const location = useLocation()
  const { data, isLoading } = useFetchAppQuery(appUid!)

  useHomeDisplayScope(homeContext, data?.app.scope, data?.app.featured)

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
  const isInSpace = app.scope?.startsWith('space-')
  const canRunApp = !isInSpace || !!isContributorOrHigher
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
              {meta.defaultComparator && <HomeLabel value="Default comparator" icon="fa-bullseye" />}
              {meta.assignedChallenges.length > 0
                ? meta.assignedChallenges.map(item => (
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
                conditionType="all"
                isLinkDisabled={!canRunApp}
                asReactLink
              >
                Run App
                <Pill>rev{app.revision}</Pill>
              </CloudResourcesHeaderButton>
              <DetailActionsDropdown
                homeScope={homeScope}
                spaceId={spaceId}
                app={app}
                meta={meta}
                challenges={meta.challenges}
                isContributorOrHigher={isContributorOrHigher}
              />
            </StyledRight>
          </div>
        </ResourceHeader>

        <AppDetails app={app} meta={meta} />
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
          to={{ pathname: `${basePath}/apps/${app.uid}` }}
          state={location.state}
          data-testid="app-show-tab-spec"
        >
          Spec
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/apps/${app.uid}/jobs` }}
          state={location.state}
          data-testid="app-show-tab-executions"
        >
          Executions ({meta.accessibleJobsCount})
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/apps/${app.uid}/readme` }}
          state={location.state}
          data-testid="app-show-tab-readme"
        >
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Outlet
          context={{ spaceId, spec: meta.spec, readme: app.readme, appUid: app.uid } satisfies AppShowOutletContext}
        />
      </StyledTabPanel>
    </>
  )
}
