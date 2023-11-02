/* eslint-disable no-nested-ternary */
import { omit } from 'ramda'
import React from 'react'
import { useLocation, useParams, useRouteMatch } from 'react-router'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { CloudResourcesHeaderButton } from '../../../components/CloudResourcesHeaderButton'
import Dropdown from '../../../components/Dropdown'
import { RevisionDropdown } from '../../../components/Dropdown/RevisionDropdown'
import { HomeLabel } from '../../../components/HomeLabel'
import { Markdown, MarkdownStyle } from '../../../components/Markdown'
import {
  StyledTab,
  StyledTabList,
  StyledTabPanel,
} from '../../../components/Tabs'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { IChallenge } from '../../../types/challenge'
import { Location } from '../../../types/utils'
import { getBackPath } from '../../../utils/getBackPath'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { getScopeMapping } from '../getScopeMapping'
import { StyledBackLink, StyledRight } from '../home.styles'
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
  Pill,
  Title,
  Topbox,
} from '../show.styles'
import { ResourceScope } from '../types'
import { AppExecutionsList } from './AppExecutionsList'
import { SpecTab } from './SpecTab'
import { IApp } from './apps.types'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useFetchAppQuery } from './useFetchAppQuery'
import { getBaseLink } from './run/utils'

const renderOptions = (app: IApp, scope: ResourceScope) => {
  const columns = [
    {
      header: 'location',
      value: 'location',
      link: app.links.space && `${app.links.space}/apps`,
    },
    {
      header: 'name',
      value: 'name',
    },
    {
      header: 'id',
      value: 'uid',
    },
    {
      header: 'added by',
      value: 'added_by_fullname',
      link: app.links.user,
    },
    {
      header: 'created on',
      value: 'created_at_date_time',
    },
  ]

  if (app.links.forked_from) {
    columns.push({
      header: 'Forked from',
      value: 'forked_from',
      link: app.links.forked_from,
    })
  }

  const scopeParamLink = `?scope=${scope?.toLowerCase()}`

  const list = columns.map((e: any) => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {e.header === 'location' && !e.link ? (
        // @ts-ignore
        <MetadataVal>
          <Link to={`/home/apps${scopeParamLink}`}>
            {/* @ts-ignore */}
            {scope === 'featured' ? 'Featured' : app[e.value]}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        // @ts-ignore
        <MetadataVal>
          <Link to={e.link} target="_blank">
            {/* @ts-ignore */}
            {app[e.value]}
          </Link>
        </MetadataVal>
      ) : (
        // @ts-ignore
        <MetadataVal>{app[e.value]}</MetadataVal>
      )}
    </MetadataItem>
  ))

  return <MetadataSection><MetadataRow>{list}</MetadataRow></MetadataSection>
}

const DetailActionsDropdown = (
  { app, comparatorLinks, challenges, spaceId }:
    { app: IApp, comparatorLinks: { [key: string]: string }, challenges?: IChallenge[], spaceId: string }) => {
  const actions = useAppSelectionActions({
    scope: getScopeMapping(app.scope, app.featured),
    spaceId,
    selectedItems: [app],
    resetSelected: () => { },
    resourceKeys: ['app', app.uid],
    comparatorLinks,
    challenges,
  })

  return (
    <>
      <CloudResourcesHeaderButton
        href={`/${getBaseLink(spaceId)}/apps/${app.uid}/jobs/new`}
        isLinkDisabled={!app.links.run_job}
        conditionType='all'
        asReactLink
      >
        <>
          Run App&nbsp;
          <Pill>rev{app.revision}</Pill>
        </>
      </CloudResourcesHeaderButton>
      <CloudResourcesHeaderButton
        href={`/apps/${app.uid}/batch_app`}
        data-turbolinks="false"
        isLinkDisabled={!app.links.batch_run}
        conditionType='all'
      >
        <>
          Run Batch&nbsp;
          <Pill>rev{app.revision}</Pill>
        </>
      </CloudResourcesHeaderButton>
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={omit(['Run', 'Run batch'], actions)}
          />
        }
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>
      {actions['Delete']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Export to']?.modal}
      {actions['Set as Challenge App']?.modal}
      {actions['Copy to My Home (private)']?.modal}
      {actions['Add to Comparators']?.modal}
      {actions['Remove from Comparators']?.modal}
      {actions['Set this app as comparison default']?.modal}
    </>
  )
}

export const AppsShow = ({ spaceId, emitScope }: { spaceId: string, emitScope?: (scope: ResourceScope) => void }) => {
  const location: Location = useLocation()
  const match = useRouteMatch()
  const { appUid } = useParams<{ appUid: string }>()
  const { data, isLoading } = useFetchAppQuery(appUid)

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
  const scope = getScopeMapping(app.scope, app.featured)
  if (emitScope) {
    emitScope(scope)
  }

  const appTitle = app.title ? app.title : app.name

  return (
    <>
      <StyledBackLink linkTo={getBackPath(location, 'apps', scope)}>
        Back to Apps
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title>
              <CubeIcon height={20} />
              &nbsp;{appTitle}
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
              linkToRevision={r => `/home/apps/${r.uid}`}
            />
          </HeaderLeft>
          <HeaderRight>
            <StyledRight>
              {app &&
                <DetailActionsDropdown
                  spaceId={spaceId}
                  app={app}
                  comparatorLinks={meta.links?.comparators ?? []}
                  challenges={meta.challenges} />
              }
            </StyledRight>
          </HeaderRight>
        </Header>

        {renderOptions(app, scope)}
        <MetadataSection>
          {app.tags.length > 0 && (
            <StyledTags>
              {app.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>

      <StyledTabList>
        <StyledTab activeClassName="active" exact to={{ pathname: `${match.url}`, state: location.state }}>
          Spec
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${match.url}/jobs`, state: location.state }}>
          Executions ({app.job_count})
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${match.url}/readme`, state: location.state }}>
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Switch>
          <Route path={`${match.path}/spec`} exact>
            <Redirect to={`${match.url}`} />
          </Route>
          <Route path={`${match.path}/readme`} exact>
            <MarkdownStyle><Markdown data={app.readme} /></MarkdownStyle>
          </Route>
          <Route path={`${match.path}/jobs`}>
            <AppExecutionsList appUid={appUid} />
          </Route>
          <Route path={`${match.path}`}>
            <SpecTab spec={meta.spec} />
          </Route>
        </Switch>
      </StyledTabPanel>
    </>
  )
}
