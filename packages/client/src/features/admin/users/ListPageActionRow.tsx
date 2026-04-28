import { type UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { ChevronDown } from 'lucide-react'
import type { BackendError } from '@/api/types'
import { Button } from '@/components/Button'
import Menu from '@/components/Menu/Menu'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { itemsCountString } from '@/utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import type { MetaV2 } from '../../home/types'
import { ButtonsRow } from '../common'
import { bulkActivate, bulkDeactivate, userUnlock } from './api'
import { canAdminUnlockUsers } from './canAdminUnlockUsers'
import { ResourcesMenu } from './ResourcesMenu'
import type { User } from './types'

type UserListActionRowProps = {
  selectedUsers: User[]
  refetchUsers: UseQueryResult<{ data: User[]; meta: MetaV2 }>['refetch']
}

export const UsersListActionRow = ({ selectedUsers, refetchUsers }: UserListActionRowProps) => {
  const queryClient = useQueryClient()
  const currentUserCtx = useAuthUser()
  const selectedIds = selectedUsers.map(({ id }) => id)
  const noSelection = selectedUsers.length === 0

  const invalidate = () => {
    refetchUsers()
    queryClient.invalidateQueries({ queryKey: ['admin-user'] })
  }

  const handleError = (e: AxiosError<BackendError>, fallback: string) => {
    toastError(e.response?.data?.error?.message ? `Error: ${e.response.data.error.message}` : fallback)
  }

  const unlockMutation = useMutation({
    mutationKey: ['unlock'],
    mutationFn: () => userUnlock(selectedIds[0]),
    onSuccess: () => {
      toastSuccess('User was successfully unlocked!')
      invalidate()
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Error unlocking user!'),
  })

  const deactivateMutation = useMutation({
    mutationKey: ['bulk-deactivate'],
    mutationFn: () => bulkDeactivate(selectedIds),
    onSuccess: () => {
      toastSuccess(`${itemsCountString('user', selectedIds.length)} successfully deactivated!`)
      invalidate()
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Error deactivating users'),
  })

  const activateMutation = useMutation({
    mutationKey: ['bulk-activate'],
    mutationFn: () => bulkActivate(selectedIds),
    onSuccess: () => {
      toastSuccess(`${itemsCountString('user', selectedIds.length)} successfully activated!`)
      invalidate()
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Error activating users'),
  })

  const areAllDeactivated = !noSelection && selectedUsers.every(({ userState }) => userState === 'deactivated')
  const areAllActive = !noSelection && selectedUsers.every(({ userState }) => userState === 'active')
  const isCurrentUserSelected = selectedUsers.some(({ id }) => id === currentUserCtx?.id)
  const canUnlock = canAdminUnlockUsers(selectedUsers)

  const showActivate = areAllDeactivated
  const showDeactivate = areAllActive && !isCurrentUserSelected

  return (
    <ButtonsRow>
      <Menu
        disableInitialFocus
        positioner={{ side: 'bottom', align: 'end' }}
        trigger={
          <Menu.Trigger>
            <Button as="div" data-variant="primary" data-testid="admin-users-actions-button" disabled={noSelection}>
              Actions
              <ChevronDown size={14} />
            </Button>
          </Menu.Trigger>
        }
      >
        {showActivate && (
          <Menu.Item disabled={activateMutation.isPending} onClick={() => void activateMutation.mutateAsync()}>
            Activate
          </Menu.Item>
        )}
        {showDeactivate && (
          <Menu.Item disabled={deactivateMutation.isPending} onClick={() => void deactivateMutation.mutateAsync()}>
            Deactivate
          </Menu.Item>
        )}
        <Menu.Item disabled={!canUnlock || unlockMutation.isPending} onClick={() => void unlockMutation.mutateAsync()}>
          Unlock
        </Menu.Item>
      </Menu>

      <ResourcesMenu selectedUsers={selectedUsers} />
    </ButtonsRow>
  )
}
