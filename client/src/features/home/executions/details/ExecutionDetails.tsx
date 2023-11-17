import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { HomeLabel } from '../../../../components/HomeLabel'
import { ITab, TabsSwitch } from '../../../../components/TabsSwitch'
import {
  StyledTagItem,
  StyledTags,
  StyledPropertyItem,
  StyledPropertyKey,
} from '../../../../components/Tags'
import { RESOURCE_LABELS } from '../../../../types/user'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl } from '../../../../utils/config'
import { getBackPath } from '../../../../utils/getBackPath'
import { ActionsRow, StyledBackLink } from '../../home.styles'
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
} from '../../show.styles'
import { EmmitScope, NOTIFICATION_ACTION, Notification, ResourceScope } from '../../types'
import { getBasePath } from '../../utils'
import { ExecutionActionsRow } from '../ExecutionActionsRow'
import { InputsAndOutputs } from '../InputsAndOutputs'
import { fetchExecution } from '../executions.api'
import { JobState } from '../executions.types'
import { FailureMessage, StyledExecutionState } from './styles'
import { CogsIcon } from '../../../../components/icons/Cogs'

const ExecutionState = ({ state }: { state: JobState }) => (
  <StyledExecutionState state={state}>{state}</StyledExecutionState>
)

export const ExecutionDetails = ({
  emitScope,
  spaceId,
  scope,
}: {
  emitScope?: EmmitScope
  spaceId?: string
  scope?: ResourceScope
}) => {
  const location = useLocation<any>()
  const { executionUid } = useParams<{ executionUid: string }>()

  const { data, status, refetch, isFetching } = useQuery({
    queryKey: ['execution', executionUid],
    queryFn: () => fetchExecution(executionUid),
    onSuccess: (d) => {
      if(emitScope) emitScope(d.job.scope, d.job.featured)
    },
  })
  const queryCache = useQueryClient()

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => true,
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
      queryCache.invalidateQueries(['execution'])
    }
  }, [notification])

  const execution = data?.job

  if (status === 'loading') {
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

  const tabsConfig = [
    {
      header: 'Inputs and Outputs',
      hide: false,
      tab: (
        <InputsAndOutputs
          runInputData={execution.run_input_data}
          runOutputData={execution.run_output_data}
        />
      ),
    },
  ] satisfies ITab[]

  const scopeParamLink = `?scope=${scope?.toLowerCase()}`

  return (
    <>
      <StyledBackLink linkTo={getBackPath(location, 'executions', scope)}>
        Back to Executions
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <div>
              <Title>
                <CogsIcon height={24}/>
                <ExecutionState state={execution.state}/>
                {execution.name}
              </Title>
              {execution?.failure_message && (
                <FailureMessage>
                  {execution?.failure_reason}: {execution.failure_message}
                </FailureMessage>
              )}
            </div>
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
                scope={scope}
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
                    {scope === 'featured' ? 'Featured' : execution.location}
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
      <TabsSwitch tabsConfig={tabsConfig}/>
    </>
  )
}
