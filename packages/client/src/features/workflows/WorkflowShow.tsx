import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { CloudResourcesHeaderButton } from '@/components/CloudResourcesHeaderButton'
import { CopyText } from '@/components/CopyText/CopyText'
import { NetworkIcon } from '@/components/icons/NetworkIcon'
import { Markdown, MarkdownStyle } from '@/components/Markdown'
import { RevisionMenu } from '@/components/Menu/RevisionMenu'
import { toastInfo } from '@/components/NotificationCenter/ToastHelper'
import { StyledTab, StyledTabList, StyledTabPanel } from '@/components/Tabs'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '@/components/Tags'
import { getBackPathNext } from '@/utils/getBackPath'
import Menu from '../../components/Menu/Menu'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { defaultHomeContext, type HomeScopeContextValue } from '../home/HomeScopeContext'
import { StyledBackLink, StyledRight } from '../home/home.styles'
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
  Pill,
  ResourceHeader,
  Title,
  Topbox,
} from '../home/show.styles'
import type { HomeScope } from '../home/types'
import { getBasePath } from '../home/utils'
import { UserDetailsDrawer } from '../users/UserDetailsDrawer'
import { useWorkflowSelectActions } from './useWorkflowSelectActions'
import { WorkflowExecutionsList } from './WorkflowExecutionsList'
import HomeWorkflowsSpec from './WorkflowSpec/WorkflowSpec'
import WorkflowsDiagram from './WorkflowsDiagram'
import { fetchWorkflow } from './workflows.api'
import type { IWorkflow } from './workflows.types'

interface IColumn {
  header: string
  value: keyof IWorkflow
  link?: string
  dataTestId: string
}

const WorkflowDetails = ({ workflow, homeScope }: { workflow: IWorkflow; homeScope?: HomeScope }) => {
  const [isUserOpen, setIsUserOpen] = useState<boolean>(false)

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
      {e.header === 'location' && !e.link ? (
        <MetadataVal>
          <Link to={`/home/workflows${scopeParamLink}`} data-testid={e.dataTestId}>
            {homeScope === 'featured' ? 'Featured' : (workflow[e.value] as string)}
          </Link>
        </MetadataVal>
      ) : e.link ? (
        <MetadataVal>
          <Link to={e.link} target="_blank" data-testid={e.dataTestId}>
            {workflow[e.value] as string}
          </Link>
        </MetadataVal>
      ) : e.value === 'uid' ? (
        <MetadataVal data-testid={e.dataTestId}>
          <CopyText
            className="inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]"
            value={workflow.uid}
            onCopy={() => toastInfo('Workflow ID copied to clipboard')}
          >
            <span>{workflow.uid}</span>
          </CopyText>
        </MetadataVal>
      ) : e.value === 'added_by' ? (
        <MetadataVal data-testid={e.dataTestId}>
          <button
            type="button"
            className={'inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]'}
            onClick={() => setIsUserOpen(true)}
          >
            {workflow.added_by}
          </button>
        </MetadataVal>
      ) : (
        <MetadataVal data-testid={e.dataTestId}>{workflow[e.value] as string}</MetadataVal>
      )}
    </MetadataItem>
  ))

  return (
    <MetadataSection>
      <MetadataRow>{list}</MetadataRow>

      <UserDetailsDrawer userId={workflow.added_by_user_id} open={isUserOpen} onClose={() => setIsUserOpen(false)} />
    </MetadataSection>
  )
}

const DetailActionsDropdown = ({ workflow, spaceId }: { workflow: IWorkflow; spaceId?: number }) => {
  const { actions, modals } = useWorkflowSelectActions({
    homeScope: workflow.scope === 'private' ? 'me' : (workflow.scope as HomeScope),
    selectedItems: [workflow],
    resourceKeys: ['workflow', workflow.uid],
  })

  return (
    <>
      <CloudResourcesHeaderButton
        asReactLink
        data-turbolinks="false"
        href={`${getBasePath(spaceId)}/workflows/${workflow.uid}/analyses/new`}
        isLinkDisabled={!workflow.links.run_workflow}
        data-testid="workflow-show-actions-run"
        conditionType="all"
      >
        Run Workflow&nbsp;
        <Pill>rev{workflow.revision}</Pill>
      </CloudResourcesHeaderButton>
      <CloudResourcesHeaderButton
        data-turbolinks="false"
        href={workflow.links.batch_run_workflow}
        isLinkDisabled={!workflow.links.batch_run_workflow}
        data-testid="workflow-show-actions-run-batch"
        conditionType="all"
      >
        Run Batch Workflow&nbsp;
        <Pill>rev{workflow.revision}</Pill>
      </CloudResourcesHeaderButton>
      <Menu trigger={<ActionsButton as={Menu.Trigger} />}>
        <ActionsMenuContent actions={actions.filter(action => !['Run', 'Run Batch'].includes(action.name))} />
      </Menu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const WorkflowShow = ({
  workflowId,
  spaceId,
  homeContext = defaultHomeContext,
}: {
  workflowId: string
  spaceId?: number
  homeContext?: HomeScopeContextValue
}) => {
  const { homeScope, setDisplayScope, isHome } = homeContext
  const location = useLocation()
  const { data, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () =>
      fetchWorkflow(workflowId).then(d => {
        if (isHome) {
          setDisplayScope(d.workflow.scope, d.workflow.featured)
        }
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
        <div>Sorry, this workflow does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const workflowTitle = workflow.title ? workflow.title : workflow.name

  const basePath = getBasePath(spaceId)

  return (
    <>
      <StyledBackLink
        linkTo={getBackPathNext({ location, resourceLocation: 'workflows', homeScope, spaceId })}
        data-testid="workflow-show-back-link"
      >
        Back to Workflows
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <NetworkIcon height={20} />
              <span data-testid="workflow-show-title">{workflowTitle}</span>
            </Title>
            <RevisionMenu
              revisions={meta.revisions}
              selectedValue={workflow.revision}
              linkToRevision={r => `${getBasePath(spaceId)}/workflows/${r.uid}`}
            />
          </HeaderLeft>
          <div>
            <StyledRight>{workflow && <DetailActionsDropdown workflow={workflow} spaceId={spaceId} />}</StyledRight>
          </div>
        </ResourceHeader>

        <WorkflowDetails workflow={workflow} homeScope={homeScope} />
        {workflow.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {/* TODO(samuel) validate that tag is non-null string */}
                  {workflow.tags.map(tag => (
                    <StyledTagItem data-testid="workflow-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
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
        <StyledTab
          activeClassName="active"
          end
          to={{ pathname: `${basePath}/workflows/${workflow.uid}` }}
          state={location.state}
          data-testid="workflow-show-tab-spec"
        >
          Spec
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/workflows/${workflow.uid}/jobs` }}
          state={location.state}
          data-testid="workflow-show-tab-executions"
        >
          Executions ({workflow.job_count})
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/workflows/${workflow.uid}/diagram` }}
          state={location.state}
          data-testid="workflow-show-tab-diagram"
        >
          Diagram
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/workflows/${workflow.uid}/readme` }}
          state={location.state}
          data-testid="workflow-show-tab-readme"
        >
          Readme
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Routes>
          <Route path="/" element={<HomeWorkflowsSpec spec={meta.spec} />} />
          <Route path="spec" element={<Navigate to=".." relative="path" replace />} />
          <Route
            path="readme"
            element={
              <MarkdownStyle>
                <Markdown data={workflow.readme} />
              </MarkdownStyle>
            }
          />
          <Route path="diagram" element={<WorkflowsDiagram workflowId={workflow.uid} />} />
          <Route path="jobs" element={<WorkflowExecutionsList uid={workflow.uid} />} />
        </Routes>
      </StyledTabPanel>
    </>
  )
}
