import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { HomeLabel } from '../../../components/HomeLabel'
import { StyledTab, StyledTabList, StyledTabPanel } from '../../../components/Tabs'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '../../../components/Tags'
import { CogsIcon } from '../../../components/icons/Cogs'
import { RESOURCE_LABELS } from '../../../types/user'
import { pluralize } from '../../../utils/formatting'
import { getBackPathNext } from '../../../utils/getBackPath'
import { PricingMap } from '../../apps/apps.types'
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
import { InputsAndOutputs } from '../InputsAndOutputs'
import { Logs } from '../Log'
import { StateCell } from '../StateCell'
import { fetchExecution } from '../executions.api'
import { IExecution } from '../executions.types'
import { FailureMessage, TitleLeft } from './styles'
import { useLastWSNotification } from '../../../hooks/useLastWSNotification'
import { defaultHomeContext, HomeScopeContextValue } from '../../home/HomeScopeContext'

export const ExecutionDetails = ({
  executionUid,
  homeContext = defaultHomeContext,
  spaceId,
}: {
  executionUid: string
  homeContext?: HomeScopeContextValue
  spaceId?: number
}) => {
  const { homeScope, isHome, homeScopeChangeHandler } = homeContext
  const location = useLocation()

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['execution', executionUid],
    queryFn: () =>
      fetchExecution(executionUid!).then(d => {
        if (isHome) {
          homeScopeChangeHandler(d.job.scope, d.job.featured)
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
      queryKey: ['execution'],
    })
  }, [lastJsonMessage])

  const execution = data?.job

  const [currentCost, setCurrentCost] = useState('$0')
  const [currentDuration, setCurrentDuration] = useState('0s')

  const updateCostAndDuration = (e: IExecution) => {
    if (!e.startedRunning) {
      return
    }
    const now = Date.now()

    const durationInSeconds = Math.floor((now - e.startedRunning) / 1000)

    const days = Math.floor(durationInSeconds / (24 * 3600))
    const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60

    // Create a human-readable string
    const durationString = `${days > 0 ? `${days}  ${pluralize('day', days)}` : ''}${
      hours > 0 ? `${hours} ${pluralize('hour', hours)} ` : ''
    }${minutes > 0 ? `${minutes} ${pluralize('minute', minutes)} ` : ''}${seconds} ${pluralize('second', seconds)}`

    setCurrentDuration(durationString)
    const runtimeHours = durationInSeconds / (60 * 60)
    const perHourCost: number = PricingMap[e.instance_type as keyof typeof PricingMap]
    setCurrentCost(`$${parseFloat((runtimeHours * perHourCost).toFixed(2))}`)
  }

  useEffect(() => {
    if (data?.job && (data.job.state === 'running' || data.job.state === 'terminating')) {
      updateCostAndDuration(data.job)

      const interval = setInterval(() => {
        updateCostAndDuration(data.job)
      }, 1000)

      return () => clearInterval(interval)
    }
    return undefined
  }, [data?.job])

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
  const basePath = getBasePath(spaceId)

  const getDuration = (e: IExecution) => {
    if (e.state === 'running' || e.state === 'terminating') {
      return currentDuration
    }
    return e.duration
  }

  const getCostMetadataItem = (e: IExecution) => {
    const isActiveState = e.state === 'running' || e.state === 'terminating'
    const calculatedCost = `$${((e.duration_in_seconds / 3600) * PricingMap[e.instance_type as keyof typeof PricingMap]).toFixed(
      2,
    )}`

    let finalCost: string
    if (!isActiveState) {
      finalCost = e.energy_consumption === 'N/A' ? calculatedCost : e.energy_consumption
    } else {
      finalCost = currentCost
    }

    return (
      <MetadataItem>
        <MetadataKey>{isActiveState ? 'Estimated Cost' : 'Cost'}</MetadataKey>
        <MetadataVal data-testid="execution-cost">{finalCost}</MetadataVal>
      </MetadataItem>
    )
  }

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

  return (
    <>
      <StyledBackLink
        linkTo={getBackPathNext({ spaceId, location, resourceLocation: 'executions', homeScope })}
        data-testid="execution-back-link"
      >
        Back to Executions
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <TitleLeft>
              <Title>
                <CogsIcon height={20} />
                <span data-testid="execution-name">{execution.name}</span>
              </Title>
              {execution?.failure_message && (
                <FailureMessage>
                  {execution?.failure_reason}: {execution.failure_message}
                </FailureMessage>
              )}
            </TitleLeft>
            {execution.showLicensePending && <HomeLabel value="License Pending Approval" icon="fa-clock-o" type="warning" />}
          </HeaderLeft>
          <HeaderRight>
            <ActionsRow>
              <ExecutionActionsRow homeScope={homeScope} execution={execution} refetch={refetch} isFetching={isFetching} />
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
              {/* TODO: do not rely on link to get app id */}
              <MetadataVal data-testid="execution-app-title">
                <StyledLink to={`${getBasePath(spaceId)}/apps/${execution.app_uid}`} $disable={!execution.app_active}>
                  {execution.app_title}
                </StyledLink>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Launched By</MetadataKey>
              <MetadataVal data-testid="execution-launched-by">
                <Link target="_blank" to={execution.links.user!}>
                  {execution.launched_by}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal data-testid="execution-created">{execution.created_at_date_time}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Instance Type</MetadataKey>
              <MetadataVal data-testid="execution-instance-type">
                {RESOURCE_LABELS[execution.instance_type] ?? execution.instance_type}
              </MetadataVal>
            </MetadataItem>
          </MetadataRow>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Duration</MetadataKey>
              <MetadataVal data-testid="execution-duration">{getDuration(execution)}</MetadataVal>
            </MetadataItem>
            {getCostMetadataItem(execution)}
            <MetadataItem>
              <MetadataKey>App Revision</MetadataKey>
              <MetadataVal data-testid="execution-app-revision">{execution.app_revision}</MetadataVal>
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
          to={{ pathname: `${basePath}/executions/${execution.uid}`, state: location.state }}
        >
          Inputs & Outputs
        </StyledTab>
        <StyledTab
          activeClassName="active"
          to={{ pathname: `${basePath}/executions/${execution.uid}/logs`, state: location.state }}
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
                runInputData={execution.run_input_data}
                runOutputData={execution.run_output_data}
              />
            }
          />
          <Route path="logs" element={<Logs jobUid={execution.uid} jobState={execution.state} />} />
        </Routes>
      </StyledTabPanel>
    </>
  )
}
