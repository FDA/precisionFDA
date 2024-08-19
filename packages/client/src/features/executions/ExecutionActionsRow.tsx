import { omit } from 'ramda'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { SyncIcon } from '../../components/icons/SyncIcon'
import { getSpaceIdFromScope } from '../../utils'
import { getBaseLink, useSelectableSpaces, useUserComputeInstances } from '../apps/run/utils'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
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

  const [ rerunDisabled, setRerunDisabled ] = useState(false)
  const { data: computeInstances } = useUserComputeInstances()
  const { data: selectableSpaces } = useSelectableSpaces(execution.scope)

  useEffect(() => {
    setRerunDisabled(execution.state === 'idle' || !computeInstances || !selectableSpaces)
  }, [ execution, computeInstances, selectableSpaces ])

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
    const link = `/${getBaseLink(getSpaceIdFromScope(execution.scope))}/apps/${execution.app_uid}/jobs/new`
    const formValues = {
      jobName: execution.name,
      jobLimit: execution.cost_limit,
      scope: getScope(),
      output_folder_path: execution.run_data_updates?.output_folder_path,
      inputs: [
        {
          id: 1,
          fields: execution.run_data_updates?.run_inputs,
          instanceType: computeInstances?.find(i => i.value === execution.run_data_updates?.run_instance_type),
        },
      ],
    }
    const hash = btoa(JSON.stringify(formValues))

    return `${link}#${hash}`
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
        <Button data-variant="primary" onClick={onOpenWorkstationClick}>
          Open Workstation
        </Button>
      )}
      {isJobOwner && hasWorkstationAPI && execution.links.open_external && (
        <Button data-variant="primary" onClick={() => actions['Snapshot'].func()}>
          Snapshot
        </Button>
      )}
      {execution.app_active && (
        <Link to={getRerunExecutionLink()}>
          <Button disabled={rerunDisabled} data-variant="primary">Re-Run Execution</Button>
        </Link>
      )}
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
