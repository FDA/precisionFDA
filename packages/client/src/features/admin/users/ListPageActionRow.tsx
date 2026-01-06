import { useMutation, UseQueryResult } from '@tanstack/react-query'
import React, { useState } from 'react'
import Menu from '../../../components/Menu/Menu'
import { useNavigate } from 'react-router'
import { Button } from '../../../components/Button'
import { ArrowIcon } from '../../../components/icons/ArrowIcon'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { UnlockIcon } from '../../../components/icons/UnlockIcon'
import { useAuthUser } from '../../auth/useAuthUser'
import { MetaV2 } from '../../home/types'
import { ResourceDropdownContent } from './ResourceDropdown'
import { User } from './types'
import { UserLimitForm } from './UserLimitForm'
import { bulkActivate, bulkDeactivate, setJobLimit, setTotalLimit, userUnlock } from './api'
import { AxiosError } from 'axios'
import { itemsCountString } from '../../../utils/formatting'
import { ButtonsRow } from '../common'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { BackendError } from '../../../api/types'

const DropdownButton = React.forwardRef<HTMLElement, React.ComponentProps<typeof Button>>((props, ref) => {
  return (
    // @ts-expect-error ref type mismatch between Dropdown and Button components
    <Button as="div" data-variant="primary" ref={ref} {...props}>
      Resources &nbsp;
      <ArrowIcon />
    </Button>
  )
})
DropdownButton.displayName = 'DropdownButton'

type UserListActionRowProps = {
  selectedUsers: User[]
  refetchUsers: UseQueryResult<{ data: User[]; meta: MetaV2 }>['refetch']
}

export const UsersListActionRow = ({ selectedUsers, refetchUsers }: UserListActionRowProps) => {
  const [totalLimitInput, setTotalLimitInput] = useState(NaN)
  const [jobLimitInput, setJobLimitInput] = useState(NaN)
  const navigate = useNavigate()

  const currentUserCtx = useAuthUser()
  const selectedIds = selectedUsers.map(({ id }) => id)
  const unlockMutation = useMutation({
    mutationKey: ['unlock'],
    mutationFn: () => userUnlock(selectedIds[0]),
    onSuccess: () => {
      toastSuccess('User was successfully unlocked!')
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error unlocking users!')
      }
    },
  })
  const deactivateMutation = useMutation({
    mutationKey: ['bulk-deactivate'],
    mutationFn: () => bulkDeactivate(selectedIds),
    onSuccess: () => {
      toastSuccess(`${itemsCountString('user', selectedIds.length)} successfully deactivated!`)
      refetchUsers()
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error deactivating users')
      }
    },
  })
  const activateMutation = useMutation({
    mutationKey: ['bulk-activate'],
    mutationFn: () => bulkActivate(selectedIds),
    onSuccess: () => {
      toastSuccess(`${itemsCountString('user', selectedIds.length)} successfully activated!`)
      refetchUsers()
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error activating users')
      }
    },
  })
  const setTotalLimitMutation = useMutation({
    mutationKey: ['set-total-limit'],
    mutationFn: () => setTotalLimit(selectedIds, totalLimitInput),
    onSuccess: () => {
      toastSuccess(`Total limit successfully set to $${totalLimitInput}!`)
      refetchUsers()
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error setting total limit')
      }
    },
  })
  const setJobLimitMutation = useMutation({
    mutationKey: ['set-job-limit'],
    mutationFn: () => setJobLimit(selectedIds, jobLimitInput),
    onSuccess: () => {
      toastSuccess(`Job limit successfully set to $${jobLimitInput}!`)
      refetchUsers()
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error setting job limit')
      }
    },
  })
  const areAllSelectedUsersInDeactivatedState =
    selectedUsers.length > 0 && selectedUsers.every(({ userState }) => userState === 'deactivated')
  const areAllSelectedUsersInEnabledState =
    selectedUsers.length > 0 && selectedUsers.every(({ userState }) => userState === 'active')
  const isCurrentUserSelected = selectedUsers.some(({ id }) => id === currentUserCtx?.id)

  return (
    <ButtonsRow>
      <Button
        data-variant="primary"
        onClick={() => {
          navigate('/admin/invitations')
        }}
        data-testid="admin-users-provision-button"
        data-turbolinks="false"
      >
        <PlusIcon height={12} />
        &nbsp;Provision new users
      </Button>
      {!areAllSelectedUsersInDeactivatedState && (
        <Button
          data-variant="primary"
          data-testid="admin-users-deactivate-button"
          disabled={selectedUsers.length === 0 || !areAllSelectedUsersInEnabledState || isCurrentUserSelected}
          onClick={() => deactivateMutation.mutateAsync()}
        >
          Deactivate
        </Button>
      )}
      {areAllSelectedUsersInDeactivatedState && (
        <Button
          data-variant="primary"
          data-testid="admin-users-activate-button"
          disabled={isCurrentUserSelected}
          onClick={() => activateMutation.mutateAsync()}
        >
          Activate
        </Button>
      )}
      <Button
        data-variant="primary"
        data-testid="admin-users-unlock-button"
        disabled={selectedUsers.length !== 1}
        onClick={() => unlockMutation.mutateAsync()}
        style={{ marginRight: 16 }}
      >
        <UnlockIcon height={12} />
        &nbsp;Unlock
      </Button>
      <UserLimitForm
        buttonText="Set Total Limit ($)"
        selectedUsers={selectedUsers}
        onSubmit={() => setTotalLimitMutation.mutateAsync()}
        onChange={setTotalLimitInput}
        isSubmitButtonDisabled={Number.isNaN(totalLimitInput) || totalLimitInput < 0}
      />
      <UserLimitForm
        buttonText="Set Job Limit ($)"
        selectedUsers={selectedUsers}
        onSubmit={() => setJobLimitMutation.mutateAsync()}
        onChange={setJobLimitInput}
        isSubmitButtonDisabled={Number.isNaN(jobLimitInput) || jobLimitInput < 0}
      />
      <Menu
        trigger={
          <Menu.Trigger>
            <DropdownButton data-testid="admin-users-resource-button" disabled={selectedUsers.length === 0} />
          </Menu.Trigger>
        }
      >
        <ResourceDropdownContent selectedUsers={selectedUsers} />
      </Menu>
    </ButtonsRow>
  )
}
