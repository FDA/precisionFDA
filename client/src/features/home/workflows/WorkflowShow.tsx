import { omit } from 'ramda'
import React from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
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
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { StyledBackLink, StyledRight } from '../home.styles'
import {
  ActionsButton,
  Header,
  HeaderButton,
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
}

const renderOptions = (workflow: IWorkflow, scopeParamLink: string) => {
  const columns: IColumn[] = [
    {
      header: 'location',
      value: 'location',
      link: workflow.links.space && `${workflow.links.space}/workflows`,
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
      value: 'added_by',
      link: workflow.links.user,
    },
    {
      header: 'created on',
      value: 'created_at_date_time',
    },
  ]

  const list = columns.map(e => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {e.header === 'location' && !e.link ? (
        <MetadataVal>
          <Link to={`/home/workflows${scopeParamLink}`}>
            {workflow[e.value]}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        <MetadataVal>
          <Link to={e.link} target="_blank">
            {workflow[e.value]}
          </Link>
        </MetadataVal>
      ) : (
        <MetadataVal>{workflow[e.value]}</MetadataVal>
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
      <HeaderButton
        as="a"
        href={`${workflow.links.show}/analyses/new`}
        type="primary"
      >
        <>
          {'Run Workflow'}&nbsp;
          <Pill>rev{workflow.revision}</Pill>
        </>
      </HeaderButton>
      <HeaderButton
        as="a"
        href={workflow.links.batch_run_workflow}
        type="primary"
      >
        <>
          {'Run Batch Workflow'}&nbsp;
          <Pill>rev{workflow.revision}</Pill>
        </>
      </HeaderButton>
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

export const WorkflowShow = ({ scope }: { scope: ResourceScope }) => {
  const match = useRouteMatch()
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

  const scopeParamLink = `?scope=${scope.toLowerCase()}`
  const workflowTitle = workflow.title ? workflow.title : workflow.name

  return (
    <>
      <StyledBackLink linkTo={`/home/workflows${scopeParamLink}`}>
        Back to Workflows
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title>
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
        {workflow.tags.length > 0 && (
          <StyledTags>
            {workflow.tags.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )}
      </Topbox>

      <StyledTabList>
        <StyledTab activeClassName="active" to={`${match.url}`}>
          Spec
        </StyledTab>
        <StyledTab activeClassName="active" to={`${match.url}/jobs`}>
          Executions ({Object.keys(meta.executions).length})
        </StyledTab>
        <StyledTab activeClassName="active" to={`${match.url}/diagram`}>
          Diagram
        </StyledTab>
        <StyledTab activeClassName="active" to={`${match.url}/readme`}>
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
            <WorkflowsDiagram uid={workflow.uid} />
          </Route>
          <Route path={`${match.path}/jobs`} exact>
            <WorkflowExecutionsList uid={workflowUid} />
          </Route>
          <Route path={`${match.path}`}>
            <HomeWorkflowsSpec spec={meta.spec} />,
          </Route>
        </Switch>
      </StyledTabPanel>
    </>
  )
}
