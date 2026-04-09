import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Tooltip } from 'react-tooltip'
import { Button } from '@/components/Button'
import { Running } from '@/components/icons/StateIcons'
import { ActionsMenu } from '@/components/Menu'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { getSpaceIdFromScope } from '@/utils'
import { getBaseLink, useSelectableSpaces } from '../apps/run/utils'
import { useComputeInstances } from '../apps/useComputeInstances'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { HomeScope } from '../home/types'
import { StyledRefresh, StyledStatusText } from './details/styles'
import { IExecution } from './executions.types'
import { getOpenExternalUrl, isOpenExternalAvailable } from './executions.util'
import { useExecutionSelectActions } from './useExecutionSelectActions'

export const ExecutionActionsRow = ({
  homeScope,
  execution,
  refetch,
}: {
  homeScope?: HomeScope
  execution: IExecution
  refetch: () => void
  isFetching: boolean
}) => {
  const user = useAuthUser()
  const terminalStates = ['terminated', 'failed', 'done']

  const { actions, modals } = useExecutionSelectActions({
    homeScope,
    selectedItems: [execution],
    resourceKeys: ['execution', execution.uid],
  })

  const isJobOwner = user?.dxuser === execution.launchedByDxuser
  const isJobStartingOrRunning = ['idle', 'runnable', 'running'].includes(execution.state)

  const openExternalAvailable = isOpenExternalAvailable(execution)

  const onOpenWorkstationClick = () => {
    if (execution.launchedBy === user?.full_name) {
      window.open(getOpenExternalUrl(execution.uid), '_blank', 'noopener,noreferrer')
    } else {
      toastError(
        `This Workstation was launched by ${execution.launchedBy} and can only be accessed by them. If you wish to use a Workstation in this Space, please launch your own execution`,
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

  const [rerunDisabled, setRerunDisabled] = useState(false)
  const { computeInstances } = useComputeInstances()
  const { data: selectableSpaces } = useSelectableSpaces(execution.scope)

  useEffect(() => {
    setRerunDisabled(execution.state === 'idle' || computeInstances.length === 0 || !selectableSpaces)
  }, [execution, computeInstances, selectableSpaces])

  const getScope = () => {
    if (execution.scope === 'private') {
      return {
        label: 'Private',
        value: 'private',
      }
    }

    return selectableSpaces?.find(s => s.value === execution.scope)
  }

  const getRerunExecutionLink = () => {
    const link = `/${getBaseLink(getSpaceIdFromScope(execution.scope))}/apps/${execution.appUid}/jobs/new`
    const formValues = {
      jobName: execution.name,
      jobLimit: execution.costLimit,
      scope: getScope(),
      output_folder_path: execution.runDataUpdates?.output_folder_path,
      inputs: [
        {
          id: 1,
          fields: execution.runDataUpdates?.run_inputs,
          instanceType: computeInstances?.find(i => i.value === execution.runDataUpdates?.run_instance_type),
        },
      ],
    }
    const hash = btoa(encodeURIComponent(JSON.stringify(formValues)))

    return `${link}#${hash}`
  }

  return (
    <>
      {terminalStates.includes(execution.state) ? null : (
        <StyledRefresh title="Page will automatically refresh when the job has launched" onClick={() => refetch()}>
          {getStatusText()}
          <Running />
        </StyledRefresh>
      )}
      {isJobOwner && execution.entityType === 'https' && isJobStartingOrRunning && (
        <Button
          data-variant="primary"
          data-tooltip-id="workstation-starting"
          data-tooltip-content="Workstation is still launching. You can connect once it is running."
          disabled={!openExternalAvailable}
          onClick={onOpenWorkstationClick}
        >
          Open Workstation
        </Button>
      )}
      {isJobOwner && execution.snapshot && isJobStartingOrRunning && (
        <Button
          data-variant="primary"
          data-tooltip-id="workstation-starting"
          data-tooltip-content="Workstation is still launching. Snapshots are available once it is running."
          disabled={!openExternalAvailable}
          onClick={() => {
            const snapshotAction = actions.find(action => action.name === 'Snapshot')
            if (snapshotAction && snapshotAction.type === 'modal') {
              snapshotAction.func()
            }
          }}
        >
          Snapshot
        </Button>
      )}
      {execution.appActive && (
        <Link to={getRerunExecutionLink()}>
          <Button disabled={rerunDisabled} data-variant="primary">
            Re-Run Execution
          </Button>
        </Link>
      )}
      <ActionsMenu data-testid="execution-actions-button">
        <ActionsMenuContent
          actions={
            terminalStates.includes(execution.state)
              ? actions.filter(action => !['Snapshot', 'Terminate'].includes(action.name))
              : actions.filter(action => !['Copy to space', 'Snapshot'].includes(action.name))
          }
        />
      </ActionsMenu>
      {isJobStartingOrRunning && !openExternalAvailable && <Tooltip id="workstation-starting" />}
      <ActionModalsRenderer modals={modals} />
    </>
  )
}
