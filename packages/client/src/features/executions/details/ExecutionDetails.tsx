import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type JSX, useEffect, useEffectEvent, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { HomeLabel } from '@/components/HomeLabel'
import { BoltIcon } from '@/components/icons/BoltIcon'
import { StyledTab, StyledTabList, StyledTabPanel } from '@/components/Tabs'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '@/components/Tags'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { COMPUTE_RESOURCE_LABELS, type ComputeResourceKey, ComputeResourcePricingMap } from '@/types/user'
import { pluralize } from '@/utils/formatting'
import { getBackPathNext } from '@/utils/getBackPath'
import { defaultHomeContext, type HomeScopeContextValue } from '../../home/HomeScopeContext'
import { ActionsRow, StyledBackLink, StyledLink } from '../../home/home.styles'
import {
  HeaderLeft,
  HeaderRight,
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
} from '../../home/show.styles'
import { NOTIFICATION_ACTION } from '../../home/types'
import { getBasePath } from '../../home/utils'
import { ExecutionActionsRow } from '../ExecutionActionsRow'
import { fetchExecution } from '../executions.api'
import type { IExecution } from '../executions.types'
import { getUserLink } from '../executions.util'
import { InputsAndOutputs } from '../InputsAndOutputs'
import { Logs } from '../Log'
import { StateCell } from '../StateCell'
import { FailureMessage, TitleLeft } from './styles'

const calculateCost = (durationInSeconds: number, instanceType: string): string => {
  const runtimeHours = durationInSeconds / 3600
  const perHourCost =
    instanceType in ComputeResourcePricingMap
      ? ComputeResourcePricingMap[instanceType as ComputeResourceKey]
      : undefined
  if (!perHourCost) return 'N/A'
  return `$${parseFloat((runtimeHours * perHourCost).toFixed(2))}`
}

const useLiveMetrics = (job: IExecution | undefined): { cost: string; duration: string } => {
  const [liveMetrics, setLiveMetrics] = useState({
    cost: '$0',
    duration: '0s',
  })

  const updateCostAndDuration = useEffectEvent(() => {
    if (!job?.startedRunning) return
    const now = Date.now()
    const durationInSeconds = Math.floor((now - job.startedRunning) / 1000)

    const days = Math.floor(durationInSeconds / (24 * 3600))
    const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60

    const parts = [
      days > 0 ? `${days} ${pluralize('day', days)}` : '',
      hours > 0 ? `${hours} ${pluralize('hour', hours)}` : '',
      minutes > 0 ? `${minutes} ${pluralize('minute', minutes)}` : '',
      `${seconds} ${pluralize('second', seconds)}`,
    ].filter(Boolean)
    const duration = parts.join(' ')
    const cost = calculateCost(durationInSeconds, job.instanceType)
    setLiveMetrics({ cost, duration })
  })

  useEffect(() => {
    if (job && (job.state === 'running' || job.state === 'terminating')) {
      updateCostAndDuration()
      const interval = setInterval(updateCostAndDuration, 1000)
      return (): void => clearInterval(interval)
    }
  }, [job])

  return liveMetrics
}

/**
 * Determines the duration and cost to display for an execution.
 *
 * - Running/terminating jobs use live-computed metrics that update every second.
 * - Completed jobs use the server-provided duration and cost.
 * - For completed jobs where the backend returns 'N/A' for energy_consumption,
 *   we fall back to a client-side cost calculation based on duration and instance type.
 */
const getDisplayMetrics = (
  execution: IExecution,
  liveMetrics: { cost: string; duration: string },
): { isActiveState: boolean; duration: string; cost: string } => {
  const isActiveState = execution.state === 'running' || execution.state === 'terminating'

  if (isActiveState) {
    // While the job is still running or being terminated, show real-time metrics
    return {
      isActiveState,
      duration: liveMetrics.duration,
      cost: liveMetrics.cost,
    }
  }

  // For completed jobs, use the server-reported cost when available.
  // The backend may return 'N/A' for energy_consumption if it wasn't tracked,
  // in which case we compute cost client-side from duration and instance pricing.
  const cost =
    execution.energyConsumption === 'N/A'
      ? calculateCost(execution.durationInSeconds, execution.instanceType)
      : execution.energyConsumption

  return { isActiveState, duration: execution.duration, cost }
}

export const ExecutionDetails = ({
  executionUid,
  homeContext = defaultHomeContext,
  spaceId,
}: {
  executionUid: string
  homeContext?: HomeScopeContextValue
  spaceId?: number
}): JSX.Element => {
  const { homeScope, isHome, setDisplayScope } = homeContext
  const location = useLocation()

  const {
    data: execution,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['execution', executionUid],
    queryFn: () =>
      fetchExecution(executionUid).then(d => {
        if (isHome) {
          setDisplayScope(d.scope, d.featured)
        }
        return d
      }),
  })
  const queryCache = useQueryClient()

  const lastJsonMessage = useLastWSNotification([
    NOTIFICATION_ACTION.JOB_RUNNABLE,
    NOTIFICATION_ACTION.JOB_RUNNING,
    NOTIFICATION_ACTION.JOB_INITIALIZING,
    NOTIFICATION_ACTION.JOB_DONE,
    NOTIFICATION_ACTION.JOB_FAILED,
    NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
    NOTIFICATION_ACTION.JOB_TERMINATED,
  ])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: ['execution', executionUid],
    })
  }, [lastJsonMessage, queryCache, executionUid])

  const liveMetrics = useLiveMetrics(execution)

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
  const basePath = getBasePath(spaceId)

  if (isLoading) {
    return <HomeLoader />
  }

  if (!execution || !execution.id)
    return (
      <NotFound>
        <h1>Execution not found</h1>
        <div>Sorry, this execution does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const { isActiveState, duration: displayDuration, cost: displayCost } = getDisplayMetrics(execution, liveMetrics)

  return (
    <>
      <StyledBackLink
        linkTo={getBackPathNext({
          spaceId,
          location,
          resourceLocation: 'executions',
          homeScope,
        })}
        data-testid="execution-back-link"
      >
        Back to Executions
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <TitleLeft>
              <Title>
                <BoltIcon />
                <span data-testid="execution-name">{execution.name}</span>
              </Title>
              {execution?.failureMessage && (
                <FailureMessage>
                  {execution?.failureReason}: {execution.failureMessage}
                </FailureMessage>
              )}
            </TitleLeft>
            {execution.showLicensePending && (
              <HomeLabel value="License Pending Approval" icon="fa-clock-o" type="warning" />
            )}
          </HeaderLeft>
          <HeaderRight>
            <ActionsRow>
              <ExecutionActionsRow
                homeScope={homeScope}
                execution={execution}
                refetch={refetch}
                isFetching={isFetching}
              />
            </ActionsRow>
          </HeaderRight>
        </ResourceHeader>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>STATE</MetadataKey>
              <MetadataVal data-testid="execution-status">
                <StateCell state={execution.state} />
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal data-testid="execution-location">
                {execution.scope.includes('space-') ? (
                  <a
                    target="_blank"
                    data-turbolinks="false"
                    href={`/spaces/${execution.scope.replace('space-', '')}/executions`}
                    rel="noreferrer"
                  >
                    {execution.location}
                  </a>
                ) : (
                  <Link to={`/home/executions${scopeParamLink}`}>
                    {homeScope === 'featured' ? 'Featured' : execution.location}
                  </Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>ID</MetadataKey>
              <MetadataVal data-testid="execution-uid">{execution.uid}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>APP</MetadataKey>
              <MetadataVal data-testid="execution-app-title">
                <StyledLink to={`${getBasePath(spaceId)}/apps/${execution.appUid}`} $disable={!execution.appActive}>
                  {execution.appTitle}
                </StyledLink>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Launched By</MetadataKey>
              <MetadataVal data-testid="execution-launched-by">
                <Link target="_blank" to={getUserLink(execution.launchedByDxuser)}>
                  {execution.launchedBy}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal data-testid="execution-created">{execution.createdAtDateTime}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Instance Type</MetadataKey>
              <MetadataVal data-testid="execution-instance-type">
                {COMPUTE_RESOURCE_LABELS[execution.instanceType] ?? execution.instanceType}
              </MetadataVal>
            </MetadataItem>
          </MetadataRow>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Duration</MetadataKey>
              <MetadataVal data-testid="execution-duration">{displayDuration}</MetadataVal>
            </MetadataItem>
            <MetadataItem>
              <MetadataKey>{isActiveState ? 'Estimated Cost' : 'Cost'}</MetadataKey>
              <MetadataVal data-testid="execution-cost">{displayCost}</MetadataVal>
            </MetadataItem>
            <MetadataItem>
              <MetadataKey>App Revision</MetadataKey>
              <MetadataVal data-testid="execution-app-revision">{execution.appRevision}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        {execution.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {execution.tags.map(tag => (
                    <StyledTagItem data-testid="execution-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {Object.entries(execution.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags data-testid="properties-container">
                  {Object.entries(execution.properties).map(([key, value]) => (
                    <StyledPropertyItem key={key}>
                      <StyledPropertyKey data-testid="execution-property-key">{key}</StyledPropertyKey>
                      <span data-testid={`execution-property-value-${key}`}>{value}</span>
                    </StyledPropertyItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>

      <div className="pfda-padded-t40" />

      <StyledTabList>
        <StyledTab
          activeClassName="active"
          end
          to={{
            pathname: `${basePath}/executions/${execution.uid}`,
            state: location.state,
          }}
        >
          Inputs & Outputs
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{
            pathname: `${basePath}/executions/${execution.uid}/logs`,
            state: location.state,
          }}
        >
          Logs
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <Routes>
          <Route
            path="/"
            element={
              <InputsAndOutputs
                executionState={execution.state}
                runInputData={execution.runInputData}
                runOutputData={execution.runOutputData}
              />
            }
          />
          <Route path="logs" element={<Logs jobUid={execution.uid} jobState={execution.state} />} />
        </Routes>
      </StyledTabPanel>
    </>
  )
}
