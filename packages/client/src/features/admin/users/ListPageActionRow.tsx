import { useMutation, UseQueryResult } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import axios from 'axios'
import { Button } from '../../../components/Button'
import { DropdownNext } from '../../../components/Dropdown/DropdownNext'
import { ArrowIcon } from '../../../components/icons/ArrowIcon'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { UnlockIcon } from '../../../components/icons/UnlockIcon'
import { displayPayloadMessage, Payload } from '../../../utils/api'
import { useAuthUser } from '../../auth/useAuthUser'
import { MetaV2 } from '../../home/types'
import { ResourceDropdownContent } from './ResourceDropdown'
import { User } from './types'
import { UserLimitForm } from './UserLimitForm'

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 16px 0;
  gap: 8px;
`

// TODO(samuel) Fix incorrect error handling with react-query
// https://react-query.tanstack.com/guides/query-functions#usage-with-fetch-and-other-clients-that-do-not-throw-by-default
const setTotalLimit = async (ids: User['id'][], totalLimit: number) =>
  axios.post('/admin/set_total_limit', {
    ids,
    totalLimit,
  }).then(res => res.data)

const setJobLimit = async (ids: User['id'][], jobLimit: number) =>
  axios.post('/admin/set_job_limit', {
    ids,
    jobLimit,
  }).then(res => res.data)

const bulkUnlock = async (ids: User['id'][]) =>
  axios.post('/admin/bulk_unlock', {
    ids,
  }).then(res => res.data)

const bulkActivate = async (ids: User['id'][]) =>
  axios.post('/admin/bulk_activate', {
    ids,
  }).then(res => res.data)

const bulkDeactivate = async (ids: User['id'][]) =>
  axios.post('/admin/bulk_deactivate', {
    ids,
  }).then(res => res.data)

// TODO(samuel) unify with my home
const DropdownButton = React.forwardRef<HTMLElement, React.ComponentProps<typeof Button> & { $isActive?: boolean }>((props, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $isActive, ...buttonProps } = props
  return (
    // @ts-expect-error ref type mismatch between Dropdown and Button components
    <Button data-variant="primary" ref={ref} {...buttonProps}>
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
    mutationKey: ['bulk-unlock'],
    mutationFn: () => bulkUnlock(selectedIds),
    onSuccess: (res: Payload) => {
      displayPayloadMessage(res)
    },
    onError: () => {
      toast.error('Error unlocking users')
    },
  })
  const deactivateMutation = useMutation({
    mutationKey: ['bulk-deactivate'],
    mutationFn: () => bulkDeactivate(selectedIds),
    onSuccess: (res: Payload) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error deactivating users')
    },
  })
  const activateMutation = useMutation({
    mutationKey: ['bulk-activate'],
    mutationFn: () => bulkActivate(selectedIds),
    onSuccess: (res: Payload) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error activating users')
    },
  })
  const setTotalLimitMutation = useMutation({
    mutationKey: ['set-total-limit'],
    // @ts-expect-error parseInt used because of some strange runtime errors 2lazy2fix
    mutationFn: () => setTotalLimit(selectedIds, parseInt(totalLimitInput, 10)),
    onSuccess: (res: Payload) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error setting total limit')
    },
  })
  const setJobLimitMutation = useMutation({
    mutationKey: ['set-job-limit'],
    // @ts-expect-error parseInt used because of some strange runtime errors 2lazy2fix
    mutationFn: () => setJobLimit(selectedIds, parseInt(jobLimitInput, 10)),
    onSuccess: (res: Payload) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error setting job limit')
    },
  })
  const areAllSelectedUsersInDeactivatedState =
    selectedUsers.length > 0 && selectedUsers.every(({ userState }) => userState === 'deactivated')
  const areAllSelectedUsersInEnabledState =
    selectedUsers.length > 0 && selectedUsers.every(({ userState }) => userState === 'active')
  const areAllSelectedUsersInLockedState =
    selectedUsers.length > 0 && selectedUsers.every(({ userState }) => userState === 'locked')
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
        disabled={selectedUsers.length === 0 || !areAllSelectedUsersInLockedState}
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
      <DropdownNext 
        trigger="click" 
        content={() => <ResourceDropdownContent selectedUsers={selectedUsers} />}
      >
        {dropdownProps => (
          <DropdownButton
            {...dropdownProps}
            data-testid="admin-users-resource-button"
            active={dropdownProps.$isActive ? 'true' : 'false'}
            disabled={selectedUsers.length === 0}
          />
        )}
      </DropdownNext>
    </ButtonsRow>
  )
}
