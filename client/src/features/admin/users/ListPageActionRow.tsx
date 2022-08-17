import React, { useState } from 'react'
import styled from 'styled-components'
import { useMutation, UseQueryResult } from 'react-query'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import {
  checkStatus,
  displayPayloadMessage,
  getApiRequestOpts,
} from '../../../utils/api'
import { contextUserSelector } from '../../../reducers/context/selectors'
import { UnlockIcon } from '../../../components/icons/UnlockIcon'
import { ButtonSolidBlue } from '../../../components/Button'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { User } from './types'
import { ArrowIcon } from '../../../components/icons/ArrowIcon'
import { Dropdown } from '../../../components/Dropdown'
import { ResourceDropdownContent } from './ResourceDropdown'
import { UserLimitForm } from './UserLimitForm'
import { buildMessageFromMfaResponse } from './buildMfaErrorMessage'

const ButtonsRow = styled.div`
  display: flex;
  margin: 40px 0;
  gap: 40px;
`

// TODO(samuel) Fix incorrect error handling with react-query
// https://react-query.tanstack.com/guides/query-functions#usage-with-fetch-and-other-clients-that-do-not-throw-by-default
const setTotalLimit = async (ids: User['id'][], totalLimit: number) =>
  fetch('/admin/set_total_limit', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
      totalLimit,
    }),
  }).then(checkStatus)

const setJobLimit = async (ids: User['id'][], jobLimit: number) =>
  fetch('/admin/set_job_limit', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
      jobLimit,
    }),
  }).then(checkStatus)

const bulkReset2fa = async (ids: User['id'][]) =>
  fetch('/admin/bulk_reset_2fa', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
    }),
  }).then(checkStatus as any)
  .then((res: Response) => res.json())

const bulkUnlock = async (ids: User['id'][]) =>
  fetch('/admin/bulk_unlock', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
    }),
  }).then(checkStatus)

const bulkActivate = async (ids: User['id'][]) =>
  fetch('/admin/bulk_activate', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
    }),
  }).then(checkStatus)

const bulkDeactivate = async (ids: User['id'][]) =>
  fetch('/admin/bulk_deactivate', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
    }),
  }).then(checkStatus)

// TODO(samuel) unify with my home
// eslint-disable-next-line react/display-name
const DropdownButton = React.forwardRef((props: any, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <ButtonSolidBlue ref={ref} {...props}>
    Resources &nbsp;
    <ArrowIcon />
  </ButtonSolidBlue>
))

type UserListActionRowProps = {
  selectedUsers: User[];
  refetchUsers: UseQueryResult<{ users: User[] }>['refetch'];
};

export const UsersListActionRow = ({
  selectedUsers,
  refetchUsers,
}: UserListActionRowProps) => {
  const [totalLimitInput, setTotalLimitInput] = useState(NaN)
  const [jobLimitInput, setJobLimitInput] = useState(NaN)

  // TODO(samuel) refactor into ctx
  const currentUserCtx = useSelector(contextUserSelector) as User

  const selectedIds = selectedUsers.map(({ id }) => id)
  const resetMutation = useMutation({
    mutationFn: () => bulkReset2fa(selectedIds),
    onSuccess: (res: any) => {
      const { success, message } = buildMessageFromMfaResponse(res);
      (success ? toast.success : toast.error)(message)
    },
    onError: () => {
      toast.error('Error reseting users')
    },
  })
  const unlockMutation = useMutation({
    mutationFn: () => bulkUnlock(selectedIds),
    onSuccess: (res: any) => {
      displayPayloadMessage(res)
    },
    onError: () => {
      toast.error('Error unlocking users')
    },
  })
  const deactivateMutation = useMutation({
    mutationFn: () => bulkDeactivate(selectedIds),
    onSuccess: (res: any) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error deactivating users')
    },
  })
  const activateMutation = useMutation({
    mutationFn: () => bulkActivate(selectedIds),
    onSuccess: (res: any) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error activating users')
    },
  })
  const setTotalLimitMutation = useMutation({
    // Note: parseInt used because of some strange runtime errors 2lazy2fix
    mutationFn: () => setTotalLimit(selectedIds, parseInt(totalLimitInput, 10)),
    onSuccess: (res: any) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error setting total limit')
    },
  })
  const setJobLimitMutation = useMutation({
    // Note: parseInt used because of some strange runtime errors 2lazy2fix
    mutationFn: () => setJobLimit(selectedIds, parseInt(jobLimitInput, 10)),
    onSuccess: (res: any) => {
      displayPayloadMessage(res)
      refetchUsers()
    },
    onError: () => {
      toast.error('Error setting job limit')
    },
  })
  const areAllSelectedUsersInDeactivatedState =
    selectedUsers.length > 0 &&
    selectedUsers.every(({ userState }) => userState === 'deactivated')
  const areAllSelectedUsersInEnabledState =
    selectedUsers.length > 0 &&
    selectedUsers.every(({ userState }) => userState === 'active')
  const areAllSelectedUsersInLockedState =
    selectedUsers.length > 0 &&
    selectedUsers.every(({ userState }) => userState === 'locked')
  const isCurrentUserSelected = selectedUsers.some(
    ({ id }) => id === currentUserCtx.id,
  )

  return (
    <ButtonsRow>
      <ButtonSolidBlue
        as="a"
        href="/admin/invitations"
        data-testid="admin-users-provision-button"
      >
        <PlusIcon height={12} />
        &nbsp;Provision new users
      </ButtonSolidBlue>
      <ButtonSolidBlue
        data-testid="admin-users-reset-button"
        disabled={selectedUsers.length === 0}
        onClick={() => resetMutation.mutateAsync()}
      >
        Reset
      </ButtonSolidBlue>
      {!areAllSelectedUsersInDeactivatedState && (
        <ButtonSolidBlue
          data-testid="admin-users-deactivate-button"
          disabled={
            selectedUsers.length === 0 ||
            !areAllSelectedUsersInEnabledState ||
            isCurrentUserSelected
          }
          onClick={() => deactivateMutation.mutateAsync()}
        >
          Deactivate
        </ButtonSolidBlue>
      )}
      {areAllSelectedUsersInDeactivatedState && (
        <ButtonSolidBlue
          data-testid="admin-users-activate-button"
          disabled={isCurrentUserSelected}
          onClick={() => activateMutation.mutateAsync()}
        >
          Activate
        </ButtonSolidBlue>
      )}
      <ButtonSolidBlue
        data-testid="admin-users-unlock-button"
        disabled={
          selectedUsers.length === 0 || !areAllSelectedUsersInLockedState
        }
        onClick={() => unlockMutation.mutateAsync()}
      >
        <UnlockIcon height={12} />
        &nbsp;Unlock
      </ButtonSolidBlue>
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
      <Dropdown
        trigger="click"
        content={
          <ResourceDropdownContent
            selectedUsers={selectedUsers}
            refetchUsers={refetchUsers}
          />
        }
      >
        {(dropdownProps) => (
          <DropdownButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...dropdownProps}
            data-testid="admin-users-resource-button"
            active={dropdownProps.isActive}
            disabled={selectedUsers.length === 0}
          />
        )}
      </Dropdown>
    </ButtonsRow>
  )
}

