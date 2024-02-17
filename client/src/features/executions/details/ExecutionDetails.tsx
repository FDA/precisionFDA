import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { HomeLabel } from '../../../components/HomeLabel'
import {
  StyledTagItem,
  StyledTags,
  StyledPropertyItem,
  StyledPropertyKey,
} from '../../../components/Tags'
import { RESOURCE_LABELS } from '../../../types/user'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../../utils/config'
import { getBackPath } from '../../../utils/getBackPath'
import { ActionsRow, StyledBackLink } from '../../home/home.styles'
import {
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
  Title,
  Topbox,
} from '../../home/show.styles'
import { EmmitScope, NOTIFICATION_ACTION, Notification, HomeScope } from '../../home/types'
import { getBasePath } from '../../home/utils'
import { ExecutionActionsRow } from '../ExecutionActionsRow'
import { InputsAndOutputs } from '../InputsAndOutputs'
import { fetchExecution } from '../executions.api'
import { FailureMessage, StyledExecutionState, TitleLeft } from './styles'
import { CogsIcon } from '../../../components/icons/Cogs'
import { StyledTab, StyledTabList, StyledTabPanel } from '../../../components/Tabs'
import { StateCell } from '../StateCell'

export const ExecutionDetails = ({
  emitScope,
  spaceId,
  homeScope,
}: {
  emitScope?: EmmitScope
  spaceId?: string
  homeScope?: HomeScope
}) => {
  const location = useLocation<any>()
  const { executionUid } = useParams<{ executionUid: string }>()

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['execution', executionUid],
    queryFn: () => fetchExecution(executionUid).then(d => {
      if(emitScope) emitScope(d.job.scope, d.job.featured)
      return d
    }),
  })
  const queryCache = useQueryClient()

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
  })

  useEffect(() => {
    if (notification == null) {
      return
    }
    if ([NOTIFICATION_ACTION.JOB_RUNNABLE,
         NOTIFICATION_ACTION.JOB_RUNNING,
         NOTIFICATION_ACTION.JOB_INITIALIZING,
         NOTIFICATION_ACTION.JOB_DONE,
         NOTIFICATION_ACTION.JOB_FAILED,
         NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
         NOTIFICATION_ACTION.JOB_TERMINATED].includes(notification.action)) {
      queryCache.invalidateQueries({
        queryKey: ['execution'],
      })
    }
  }, [notification])

  const execution = data?.job

  if (isLoading) {
    return <HomeLoader/>
  }

  if (!execution || !execution.id)
    return (
      <NotFound>
        <h1>Execution not found</h1>
        <div>
          Sorry, this execution does not exist or is not accessible by you.
        </div>
      </NotFound>
    )

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`

  return (
    <>
      <StyledBackLink linkTo={getBackPath(location, 'executions', homeScope)}>
        Back to Executions
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <TitleLeft>
              <Title>
                <CogsIcon height={18}/>
                {execution.name}
              </Title>
              <StyledExecutionState><StateCell state={execution.state} /></StyledExecutionState>
              {execution?.failure_message && (
                <FailureMessage>
                  {execution?.failure_reason}: {execution.failure_message}
                </FailureMessage>
              )}
            </TitleLeft>
            {execution.showLicensePending && (
              <HomeLabel
                value="License Pending Approval"
                icon="fa-clock-o"
                type="warning"
              />
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
        </Header>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal>
                {execution.scope.includes('space-') ? (
                  <a
                    target="_blank"
                    data-turbolinks="false"
                    href={`/spaces/${execution.scope.replace(
                      'space-',
                      '',
                    )}/executions`}
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
              <MetadataKey>APP</MetadataKey>
              {/* TODO: do not rely on link to get app id */}
              <MetadataVal>
                <Link
                  to={`${getBasePath(
                    spaceId,
                  )}/apps/${execution.links.app?.replace('/apps/', '')}`}
                >
                  {execution.app_title}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Launched By</MetadataKey>
              <MetadataVal>
                <Link target="_blank" to={execution.links.user!}>
                  {execution.launched_by}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal>{execution.created_at_date_time}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Instance Type</MetadataKey>
              <MetadataVal>{RESOURCE_LABELS[execution.instance_type] ?? execution.instance_type}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Duration</MetadataKey>
              <MetadataVal>{execution.duration}</MetadataVal>
            </MetadataItem>
            <MetadataItem>
              <MetadataKey>Cost</MetadataKey>
              <MetadataVal>{execution.energy_consumption}</MetadataVal>
            </MetadataItem>
            <MetadataItem>
              <MetadataKey>App Revision</MetadataKey>
              <MetadataVal>{execution.app_revision}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        {execution.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags>
                  {execution.tags.map(tag => (
                    <StyledTagItem key={tag}>{tag}</StyledTagItem>
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
                    <StyledTags>
                      {Object.entries(execution.properties).map(([key, value]) => (
                        <StyledPropertyItem key={key}>
                          <StyledPropertyKey>{key}</StyledPropertyKey>
                          <span>{value}</span>
                        </StyledPropertyItem>
                      ))}
                    </StyledTags>
                </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>

      <div className="pfda-padded-t40"/>

      <StyledTabList>
        <StyledTab activeClassName="active" end>
          Inputs & Outputs
        </StyledTab>
      </StyledTabList>
      <StyledTabPanel>
        <InputsAndOutputs
          runInputData={execution.run_input_data}
          runOutputData={execution.run_output_data}
        />
      </StyledTabPanel>
    </>
  )
}
