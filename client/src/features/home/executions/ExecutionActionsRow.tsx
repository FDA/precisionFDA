import { useQueryClient, useMutation } from '@tanstack/react-query'
import { omit } from 'ramda'
import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { SyncIcon } from '../../../components/icons/SyncIcon'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { ActionsButton } from '../show.styles'
import { ResourceScope } from '../types'
import { StyledRefresh } from './details/styles'
import { syncFilesRequest, workstationRefreshAPIKeyRequest } from './executions.api'
import { IExecution } from './executions.types'
import { useExecutionActions } from './useExecutionSelectActions'
import { useAuthUser } from "../../auth/useAuthUser";

export const ExecutionActionsRow = ({
  scope,
  execution,
  refetch,
  isFetching,
}: {
  scope?: ResourceScope
  execution: IExecution
  refetch: () => void
  isFetching: boolean
}) => {
  const queryCache = useQueryClient()
  const user = useAuthUser()

  const syncFiles = useMutation({
    mutationKey: ['sync-files'],
    mutationFn: syncFilesRequest,
    onSuccess: ({ message }) => {
      if (message) {
        if (message.type === 'success') {
          toast.success(message.text)
        } else if (message.type === 'warning') {
          toast.warning(message.text)
        }
      }
    },
  })

  const actions = useExecutionActions({
    scope,
    selectedItems: [execution],
    resourceKeys: ['execution', execution.uid],
  })
  const hasWorkstationAPI = execution.workstation_api_version !== null

  const onSyncFilesClick = () => {
    if (execution.state === 'running') {
      // eslint-disable-next-line no-unused-expressions
      execution.links.sync_files &&
        syncFiles
          .mutateAsync(execution.links.sync_files)
          .then(() => queryCache.invalidateQueries(['execution', execution.uid]))
    } else {
      alert(`Cannot sync files as workstation is ${execution.state}`)
    }
  }

  const onOpenWorkstationClick = () => {
    if (execution.launched_by === user?.full_name) {
      window.open(execution.links.open_external,'_blank','noopener,noreferrer')
    } else {
      toast.error(`This Workstation was launched by ${execution.launched_by} and can only be accessed by them. If you wish to use a Workstation in this Space, please launch your own execution.`)
    }
  }

  return (
    <>
      {['terminated', 'failed', 'done'].includes(execution.state) ? null : (
        <StyledRefresh spin={isFetching} onClick={() => refetch()}>
          <SyncIcon />
        </StyledRefresh>
      )}
      {execution.links.open_external && (
          <ButtonSolidBlue onClick={onOpenWorkstationClick}>
            Open Workstation
          </ButtonSolidBlue>
      )}
      {hasWorkstationAPI && execution.links.open_external && (
        <ButtonSolidBlue onClick={() => actions['Snapshot'].func()}>Snapshot</ButtonSolidBlue>
      )}
      {execution.links.sync_files && (
        <ButtonSolidBlue onClick={onSyncFilesClick}>Sync Files</ButtonSolidBlue>
      )}
      <Link to={`/apps/${execution.links.app?.replace('/apps/', '')}/jobs/new`}>
        <ButtonSolidBlue>Re-Run Execution</ButtonSolidBlue>
      </Link>
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={
              ['terminated', 'failed', 'done'].includes(execution.state)
                ? omit(['Snapshot'], actions)
                : omit(['Copy to space', 'Snapshot'], actions)
            }
          />
        }
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>
      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Terminate']?.modal}
      {actions['Snapshot']?.modal}
    </>
  )
}
