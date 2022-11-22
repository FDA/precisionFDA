/* eslint-disable no-nested-ternary */
import { omit } from 'ramda'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useParams } from 'react-router'
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { CloudResourcesHeaderButton } from '../../../components/CloudResourcesHeaderButton'
import Dropdown from '../../../components/Dropdown'
import { RevisionDropdown } from '../../../components/Dropdown/RevisionDropdown'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { Markdown } from '../../../components/Markdown'
import {
  StyledTab,
  StyledTabList,
  StyledTabPanel,
} from '../../../components/Tabs'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { Location } from '../../../types/utils'
import { getBackPath } from '../../../utils/getBackPath'
import { ActionsDropdownContent } from '../ActionDropdownContent'
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
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { WorkflowExecutionsList } from './WorkflowExecutionsList'
import { fetchWorkflow } from './workflows.api'
import { IWorkflow } from './workflows.types'
import WorkflowsDiagram from './WorkflowsDiagram'
import HomeWorkflowsSpec from './WorkflowSpec/WorkflowSpec'

interface IColumn {
  header: string
  value: keyof IWorkflow
  link?: string
  dataTestId: string
}

const renderOptions = (workflow: IWorkflow, scopeParamLink: string) => {
  const columns: IColumn[] = [
    {
      header: 'location',
      value: 'location',
      link: workflow.links.space && `${workflow.links.space}/workflows`,
      dataTestId: 'workflow-show-meta-location',
    },
    {
      header: 'name',
      value: 'name',
      dataTestId: 'workflow-show-meta-name',
    },
    {
      header: 'id',
      value: 'uid',
      dataTestId: 'workflow-show-meta-id',
    },
    {
      header: 'added by',
      value: 'added_by',
      link: workflow.links.user,
      dataTestId: 'workflow-show-meta-added-by',
    },
    {
      header: 'created on',
      value: 'created_at_date_time',
      dataTestId: 'workflow-show-meta-created-on',
    },
  ]

  const list = columns.map(e => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {/* eslint-disable-next-line no-nested-ternary */}
      {e.header === 'location' && !e.link ? (
        <MetadataVal>
          <Link to={`/home/workflows${scopeParamLink}`} data-testid={e.dataTestId}>
            {workflow[e.value]}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        <MetadataVal>
          <Link to={e.link} target="_blank" data-testid={e.dataTestId}>
            {workflow[e.value]}
          </Link>
        </MetadataVal>
      ) : (
        <MetadataVal data-testid={e.dataTestId}>{workflow[e.value]}</MetadataVal>
      )}
    </MetadataItem>
  ))

  return <MetadataSection><MetadataRow>{list}</MetadataRow></MetadataSection>
}

const DetailActionsDropdown = ({ workflow }: { workflow: IWorkflow }) => {
  const actions = useWorkflowSelectActions({
    scope: workflow.scope === 'private' ? 'me' : workflow.scope,
    selectedItems: [workflow],
    resourceKeys: ['workflow', workflow.uid],
  })

  return (
    <>
      <CloudResourcesHeaderButton
        data-turbolinks="false"
        href={`${workflow.links.show}/analyses/new`}
        isLinkDisabled={!workflow.links.run_workflow}
        data-testid='workflow-show-actions-run'
        conditionType='all'
      >
        <>
          Run Workflow&nbsp;
          <Pill>rev{workflow.revision}</Pill>
        </>
      </CloudResourcesHeaderButton>
      <CloudResourcesHeaderButton
        data-turbolinks="false"
        href={workflow.links.batch_run_workflow}
        isLinkDisabled={!workflow.links.batch_run_workflow}
        data-testid='workflow-show-actions-run-batch'
        conditionType='all'
      >
        <>
          Run Batch Workflow&nbsp;
          <Pill>rev{workflow.revision}</Pill>
        </>
      </CloudResourcesHeaderButton>
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={omit(['Run', 'Run Batch'], actions)}
          />
        }
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>
      {actions['Edit tags']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Export to']?.modal}
      {actions['Delete']?.modal}
    </>
  )
}

export const WorkflowShow = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const match = useRouteMatch()
  const location: Location = useLocation()
  const { workflowUid } = useParams<{ workflowUid: string }>()
  const { data, status, isLoading } = useQuery(['workflow', workflowUid], () =>
    fetchWorkflow(workflowUid),
  )

  const workflow = data?.workflow
  const meta = data?.meta

  if (isLoading) return <HomeLoader />
  if (!workflow || !meta)
    return (
      <NotFound>
        <h1>Workflow not found</h1>
        <div>
          Sorry, this workflow does not exist or is not accessible by you.
        </div>
      </NotFound>
    )

  const scopeParamLink = `?scope=${scope?.toLowerCase()}`
  const workflowTitle = workflow.title ? workflow.title : workflow.name

  return (
    <>
      <StyledBackLink linkTo={getBackPath(location, 'workflows', spaceId)} data-testid="workflow-show-back-link">
        Back to Workflows
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title data-testid="workflow-show-title">
              <BoltIcon height={20} />
              &nbsp;{workflowTitle}
            </Title>
            <RevisionDropdown
              revisions={meta.revisions}
              selectedValue={workflow.revision}
              linkToRevision={r => `/home/workflows/${r.uid}`}
            />
          </HeaderLeft>
          <HeaderRight>
            <StyledRight>
              {workflow && <DetailActionsDropdown workflow={workflow} />}
            </StyledRight>
          </HeaderRight>
        </Header>

        {renderOptions(workflow, scopeParamLink)}
        <MetadataSection>
          {workflow.tags.length > 0 && (
            <StyledTags>
              {/* TODO(samuel) validate that tag is non-null string */}
              {workflow.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>

      <StyledTabList>
        <StyledTab activeClassName="active" exact to={{ pathname: `${match.url}`, state: location.state }} data-testid="workflow-show-tab-spec">
          Spec
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${match.url}/jobs`, state: location.state }} data-testid="workflow-show-tab-executions">
          Executions ({workflow.job_count})
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${match.url}/diagram`, state: location.state }} data-testid="workflow-show-tab-diagram">
          Diagram
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${match.url}/readme`, state: location.state }} data-testid="workflow-show-tab-readme">
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Switch>
          <Route path={`${match.path}/spec`} exact>
            <Redirect to={`${match.url}`} />
          </Route>
          <Route path={`${match.path}/readme`} exact>
            <Markdown data={workflow.readme} />
          </Route>
          <Route path={`${match.path}/diagram`} exact>
            <WorkflowsDiagram workflowId={workflow.uid} />
          </Route>
          <Route path={`${match.path}/jobs`} exact>
            <WorkflowExecutionsList uid={workflowUid} />
          </Route>
          <Route path={`${match.path}`}>
            <HomeWorkflowsSpec spec={meta.spec} />
          </Route>
        </Switch>
      </StyledTabPanel>
    </>
  )
}
