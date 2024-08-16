/* eslint-disable no-nested-ternary */
import { omit } from 'ramda'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Route, Navigate, Routes, useLocation, useParams } from 'react-router-dom'
import { CloudResourcesHeaderButton } from '../../components/CloudResourcesHeaderButton'
import Dropdown from '../../components/Dropdown'
import { RevisionDropdown } from '../../components/Dropdown/RevisionDropdown'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { Markdown, MarkdownStyle } from '../../components/Markdown'
import {
  StyledTab,
  StyledTabList,
  StyledTabPanel,
} from '../../components/Tabs'
import { StyledTagItem, StyledTags, StyledPropertyItem, StyledPropertyKey } from '../../components/Tags'
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
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { WorkflowExecutionsList } from './WorkflowExecutionsList'
import { fetchWorkflow } from './workflows.api'
import { IWorkflow } from './workflows.types'
import WorkflowsDiagram from './WorkflowsDiagram'
import HomeWorkflowsSpec from './WorkflowSpec/WorkflowSpec'
import { getBasePath } from '../home/utils'

interface IColumn {
  header: string
  value: keyof IWorkflow
  link?: string
  dataTestId: string
}

const renderOptions = (workflow: IWorkflow, homeScope?: HomeScope) => {
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

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`

  const list = columns.map(e => (
    <MetadataItem key={e.header}>
      <MetadataKey>{e.header}</MetadataKey>
      {/* eslint-disable-next-line no-nested-ternary */}
      {e.header === 'location' && !e.link ? (
        <MetadataVal>
          <Link to={`/home/workflows${scopeParamLink}`} data-testid={e.dataTestId}>
            {homeScope === 'featured' ? 'Featured' : workflow[e.value]}
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
    homeScope: workflow.scope === 'private' ? 'me' : workflow.scope,
    selectedItems: [workflow],
    resourceKeys: ['workflow', workflow.uid],
  })

  return (
    <>
      <CloudResourcesHeaderButton
        asReactLink
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
      {actions['Edit properties']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Export to']?.modal}
      {actions['Delete']?.modal}
    </>
  )
}

export const WorkflowShow = ({ spaceId, emitScope, homeScope }: { spaceId?: number, homeScope?: HomeScope, emitScope?: EmmitScope }) => {
  const location = useLocation()
  const { workflowUid } = useParams<{ workflowUid: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ['workflow', workflowUid],
    queryFn: () => fetchWorkflow(workflowUid!).then(d => {
      if(emitScope) emitScope(d.workflow.scope, d.workflow.featured)
      return d
    }),
  })

  const workflow = data?.workflow as IWorkflow
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

  const workflowTitle = workflow.title ? workflow.title : workflow.name

  const basePath = getBasePath(spaceId)

  return (
    <>
      <StyledBackLink linkTo={getBackPathNext({ location, resourceLocation: 'workflows', homeScope, spaceId })} data-testid="workflow-show-back-link">
        Back to Workflows
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <BoltIcon height={20} />
              <span data-testid="workflow-show-title">{workflowTitle}</span>
            </Title>
            <RevisionDropdown
              revisions={meta.revisions}
              selectedValue={workflow.revision}
              linkToRevision={r => `${getBasePath(spaceId)}/workflows/${r.uid}`}
            />
          </HeaderLeft>
          <div>
            <StyledRight>
              {workflow && <DetailActionsDropdown workflow={workflow} />}
            </StyledRight>
          </div>
        </ResourceHeader>

        {renderOptions(workflow, homeScope)}
        {workflow.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                  <MetadataKey>Tags</MetadataKey>
                  <StyledTags data-testid="tags-container">
                    {/* TODO(samuel) validate that tag is non-null string */}
                    {workflow.tags.map(tag => (
                      <StyledTagItem data-testid="workflow-tag-item" key={tag}>{tag}</StyledTagItem>
                      ))}
                  </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {Object.entries(workflow.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                  <MetadataKey>Properties</MetadataKey>
                    <StyledTags data-testid="properties-container">
                      {Object.entries(workflow.properties).map(([key, value]) => (
                        <StyledPropertyItem key={key}>
                          <StyledPropertyKey data-testid="workflow-property-key">{key}</StyledPropertyKey>
                          <span data-testid={`workflow-property-value-${key}`}>{value}</span>
                        </StyledPropertyItem>
                      ))}
                    </StyledTags>
                </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}

      </Topbox>

      <StyledTabList>
        <StyledTab activeClassName="active" end to={{ pathname: `${basePath}/workflows/${workflow.uid}`, state: location.state }} data-testid="workflow-show-tab-spec">
          Spec
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${basePath}/workflows/${workflow.uid}/jobs`, state: location.state }} data-testid="workflow-show-tab-executions">
          Executions ({workflow.job_count})
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${basePath}/workflows/${workflow.uid}/diagram`, state: location.state }} data-testid="workflow-show-tab-diagram">
          Diagram
        </StyledTab>
        <StyledTab activeClassName="active" to={{ pathname: `${basePath}/workflows/${workflow.uid}/readme`, state: location.state }} data-testid="workflow-show-tab-readme">
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Routes>
          <Route
            path="/"
            element={<HomeWorkflowsSpec spec={meta.spec} />}
          />
          <Route
            path="spec"
            element={<Navigate to={`${location.pathname}`} replace />}
          />
          <Route
            path="readme"
            element={<MarkdownStyle><Markdown data={workflow.readme} /></MarkdownStyle>}
          />
          <Route
            path="diagram"
            element={<WorkflowsDiagram workflowId={workflow.uid} />}
          />
          <Route
            path="jobs"
            element={<WorkflowExecutionsList uid={workflow.uid} />}
          />
        </Routes>
      </StyledTabPanel>
    </>
  )
}
