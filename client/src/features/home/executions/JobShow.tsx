import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router'
import { Link, useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { CogsIcon } from '../../../components/icons/Cogs'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { HOME_TABS } from '../../../constants'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { ActionsRow, StyledBackLink } from '../home.styles'
import {
  ActionsButton,
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
} from '../show.styles'
import { ResourceScope } from '../types'
import { fetchExecution } from './executions.api'
import { IExecution, JobState } from './executions.types'
import { useExecutionActions } from './useExecutionSelectActions'
import { useSyncFilesMutation } from './useSyncFilesMutation'
import { InputsAndOutputs } from './InputsAndOutputs'
import { ITab, TabsSwitch } from '../../../components/TabsSwitch'
import { HomeLabel } from '../../../components/HomeLabel'
import { colors } from '../../../styles/theme'

const ExecutionActions = ({
  scope,
  execution,
}: {
  scope?: ResourceScope
  execution: IExecution
}) => {
  const actions = useExecutionActions({
    scope,
    selectedItems: [execution],
    resourceKeys: ['execution', execution.uid],
  })
  return (
    <>
      <Dropdown
        trigger="click"
        content={<ActionsDropdownContent actions={actions} />}
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>
      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Terminate']?.modal}
    </>
  )
}

const StyledExecutionState = styled.span<{ state: JobState }>`
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 13px;

  ${({ state }) =>
    state === 'running' &&
    css`
      color: ${colors.stateRunningColor};
      background-color: ${colors.stateRunningBackground};
    `}
  ${({ state }) =>
    state === 'idle' &&
    css`
      color: ${colors.stateRunningColor};
      background-color: ${colors.stateRunningBackground};
    `}

  ${({ state }) =>
    state === 'done' &&
    css`
      color: #336534;
      background-color: ${colors.stateDoneBackground};
    `}

  ${({ state }) =>
    state === 'terminated' &&
    css`
      color: ${colors.stateFailedColor};
      background-color: ${colors.stateFailedBackground};
    `}

  ${({ state }) =>
    state === 'failed' &&
    css`
      color: ${colors.stateFailedColor};
      background-color: ${colors.stateFailedBackground};
    `}
`

const FailureMessage = styled.div`
  color: ${colors.stateFailedColor};
  background-color: ${colors.stateFailedBackground};
  padding: 3px 5px;
  border-radius: 3px;
  /* font-size: 13px; */
`

const ExecutionState = ({ state }: { state: JobState }) => {
  return <StyledExecutionState state={state}>{state}</StyledExecutionState>
}

export const JobShow = ({ scope = 'me' }: { scope?: ResourceScope }) => {
  const queryCache = useQueryClient()
  const history = useHistory()
  const { executionUid } = useParams<{ executionUid: string }>()
  const [currentTab, setCurrentTab] = useState<any>('')
  const syncFiles = useSyncFilesMutation()

  const { data, status } = useQuery(['execution', executionUid], () =>
    fetchExecution(executionUid),
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
      tab: (
        <InputsAndOutputs
          runInputData={execution.run_input_data}
          runOutputData={execution.run_output_data}
        />
      ),
    },
  ] as ITab[]

  const tab =
    currentTab && currentTab !== HOME_TABS.PRIVATE
      ? `/${currentTab.toLowerCase()}`
      : ''
  const scopeParamLink = `?scope=${scope.toLowerCase()}`

  const onSyncFilesClick = () => {
    if (execution.state === 'running') {
      execution.links.sync_files &&
        syncFiles
          .mutateAsync(execution.links.sync_files)
          .then(() => queryCache.invalidateQueries(['execution', executionUid]))
    } else {
      alert(`Cannot sync files as workstation is ${execution.state}`)
    }
  }

  return (
    <>
      <StyledBackLink linkTo={`/home/executions${scopeParamLink}`}>
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
              {execution.links.open_external && (
                <ButtonSolidBlue as="a" target="_blank" href={execution.links.open_external}>
                  Open Workstation
                </ButtonSolidBlue>
              )}
              {execution.links.sync_files && (
                <ButtonSolidBlue onClick={onSyncFilesClick}>
                  Sync Files
                </ButtonSolidBlue>
              )}
              <ButtonSolidBlue
                as={'a'}
                href={`/apps/${execution.links.app?.replace(
                  '/apps/',
                  '',
                )}/jobs/new`}
              >
                Re-Run Execution
              </ButtonSolidBlue>
              <ExecutionActions scope={scope} execution={execution} />
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
                    href={`/spaces/${execution.scope.replace(
                      'space-',
                      '',
                    )}/jobs`}
                  >
                    {execution.location}
                  </a>
                ) : (
                  <Link
                    target="_blank"
                    to={`/home/executions?scope=${execution.scope}`}
                  >
                    {execution.location}
                  </Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>APP</MetadataKey>
              {/* TODO: do not rely on link to get app id */}
              <MetadataVal>
                <Link
                  to={`/home/apps/${execution.links.app?.replace(
                    '/apps/',
                    '',
                  )}`}
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
              <MetadataKey>Energy Consumed</MetadataKey>
              <MetadataVal>{execution.energy_consumption}</MetadataVal>
            </MetadataItem>
            <MetadataItem>
              <MetadataKey>App Revision</MetadataKey>
              <MetadataVal>{execution.app_revision}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        {execution.tags.length > 0 && (
          <StyledTags>
            {execution.tags.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )}
      </Topbox>

      <div className="pfda-padded-t40" />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
