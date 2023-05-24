import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { HomeLabel } from '../../../../components/HomeLabel'
import { CogsIcon } from '../../../../components/icons/Cogs'
import { ITab, TabsSwitch } from '../../../../components/TabsSwitch'
import { StyledTagItem, StyledTags } from '../../../../components/Tags'
import { getBackPath } from '../../../../utils/getBackPath'
import { ActionsRow, StyledBackLink } from '../../home.styles'
import {
  Header,
  HeaderLeft,
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
import { ResourceScope } from '../../types'
import { getBasePath } from '../../utils'
import { ExecutionActionsRow } from '../ExecutionActionsRow'
import { fetchExecution } from '../executions.api'
import { JobState } from '../executions.types'
import { InputsAndOutputs } from '../InputsAndOutputs'
import { FailureMessage, StyledExecutionState } from './styles'
import { getScopeMapping } from '../../getScopeMapping'

const ExecutionState = ({ state }: { state: JobState }) => (
  <StyledExecutionState state={state}>{state}</StyledExecutionState>
)

export const ExecutionDetails = ({
  emitScope,
  spaceId,
}: {
  emitScope?: (scope: ResourceScope) => void
  spaceId?: string
}) => {
  const location = useLocation<any>()
  const { executionUid } = useParams<{ executionUid: string }>()
  // const [currentTab, setCurrentTab] = useState<any>('')

  const { data, status, refetch, isFetching } = useQuery(
    ['execution', executionUid],
    () => fetchExecution(executionUid),
  )
  // const { files, meta: ma } = data!
  const execution = data?.job
  const meta = data?.meta

  if (status === 'loading') {
    return <HomeLoader />
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
  const scope = getScopeMapping(execution.scope, execution.featured)
  const scopeParamLink = `?scope=${scope?.toLowerCase()}`
  if (emitScope) {
    emitScope(scope)
  }

  // const tab =
  //   currentTab && currentTab !== HOME_TABS.PRIVATE
  //     ? `/${currentTab.toLowerCase()}`
  //     : ''

  return (
    <>
      <StyledBackLink linkTo={getBackPath(location, 'executions', spaceId)}>
        Back to Executions
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <div>
              <Title>
                <CogsIcon height={24} />
                <ExecutionState state={execution.state} />
                {execution.name}
              </Title>
              {execution?.failure_message && (
                <FailureMessage>
                  {execution?.failure_reason}: {execution.failure_message}
                </FailureMessage>
              )}
            </div>
            {/* @ts-ignore */}
            {execution.showLicensePending && (
              <HomeLabel
                value="License Pending Approval"
                icon="fa-clock-o"
                type="warning"
              />
            )}
          </HeaderLeft>
          <div>
            <ActionsRow>
              <ExecutionActionsRow
                scope={scope}
                execution={execution}
                refetch={refetch}
                isFetching={isFetching}
              />
            </ActionsRow>
          </div>
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
              <MetadataVal>{execution.instance_type}</MetadataVal>
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
        <MetadataSection>
          {execution.tags.length > 0 && (
            <StyledTags>
              {execution.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>

      <div className="pfda-padded-t40" />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
