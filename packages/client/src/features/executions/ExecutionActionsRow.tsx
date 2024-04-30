import { omit } from 'ramda'
import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { SyncIcon } from '../../components/icons/SyncIcon'
import { getSpaceIdFromScope } from '../../utils'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { getBaseLink } from '../apps/run/utils'
import { ActionsButton } from '../home/show.styles'
import { HomeScope } from '../home/types'
import { StyledRefresh, StyledStatusText } from './details/styles'
import { IExecution } from './executions.types'
import { useExecutionActions } from './useExecutionSelectActions'

export const ExecutionActionsRow = ({
  homeScope,
  execution,
  refetch,
  isFetching,
}: {
  homeScope?: HomeScope
  execution: IExecution
  refetch: () => void
  isFetching: boolean
}) => {
  const user = useAuthUser()
  const terminalStates = ['terminated', 'failed', 'done']

  const actions = useExecutionActions({
    homeScope,
    selectedItems: [execution],
    resourceKeys: ['execution', execution.uid],
  })
  const hasWorkstationAPI = execution.workstation_api_version !== null
  const isJobOwner = user?.dxuser === execution.launched_by_dxuser

  const onOpenWorkstationClick = () => {
    if (execution.launched_by === user?.full_name) {
      window.open(execution.links.open_external, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(
        `This Workstation was launched by ${execution.launched_by} and can only be accessed by them. If you wish to use a Workstation in this Space, please launch your own execution`,
      )
    }
  }

  const getStatusText = () => {
    switch (execution.state) {
      case 'idle':
      case 'runnable':
        return <StyledStatusText>Job is starting...</StyledStatusText>
      case 'running':
        return <StyledStatusText>Job is running...</StyledStatusText>
      case 'terminating':
        return <StyledStatusText>Job is terminating...</StyledStatusText>
      default:
        return null
    }
  }

  return (
    <>
      {terminalStates.includes(execution.state) ? null : (
        <StyledRefresh title="Page will automatically refresh when the job has launched" onClick={() => refetch()}>
          {getStatusText()}
          <SyncIcon />
        </StyledRefresh>
      )}
      {isJobOwner && execution.links.open_external && (
        <Button variant="primary" onClick={onOpenWorkstationClick}>
          Open Workstation
        </Button>
      )}
      {isJobOwner && hasWorkstationAPI && execution.links.open_external && (
        <Button variant="primary" onClick={() => actions['Snapshot'].func()}>
          Snapshot
        </Button>
      )}
      <Link
        to={`/${getBaseLink(getSpaceIdFromScope(execution.scope))}/apps/${execution.links.app?.replace('/apps/', '')}/jobs/new`}
      >
        <Button variant="primary">Re-Run Execution</Button>
      </Link>
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={
              ['terminated', 'failed', 'done'].includes(execution.state)
                ? omit(['Snapshot', 'Terminate'], actions)
                : omit(['Copy to space', 'Snapshot'], actions)
            }
          />
        }
      >
        {dropdownProps => <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />}
      </Dropdown>
      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Terminate']?.modal}
      {actions['Snapshot']?.modal}
    </>
  )
}
