import React from 'react'
import { MutationFunction, useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { RESOURCES, RESOURCE_LABELS } from '../../../types/user'
import { bulkDisableAllResources, bulkDisableResource, bulkEnableAllResources, bulkEnableResource } from './api'
import { User } from './types'
import { BackendError } from '../../../api/errors'
import { AxiosError } from 'axios'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export type ResourceState = 'all' | 'some' | 'none'

const ResourceMenu = styled.ul`
  margin: 0;
  padding: 4px 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
`

const ResourceItem = styled.li`
  padding: 0 20px;
  margin: 0;
  list-style: none;
  line-height: 23px;
  font-size: 14px;
  label {
    cursor: pointer;
    display: flex;
  }
  &:hover {
    background: var(--c-dropdown-hover-bg);
  }
  a {
    display: inline-block;
  }
`

const CheckBoxLabelText = styled.span`
  margin-left: 6px;
  margin-right: 64px;
`

const StyledCheckboxInputWrapper = styled.span`
  margin-left: 16px;
  display: flex;
  align-items: center;
`

const getCheckboxValue = (users: User[], predicate: (user: User) => boolean): ResourceState => {
  const hasSome = users.some(predicate)
  const hasAll = users.every(predicate)
  return hasAll ? 'all' : hasSome ? 'some' : 'none'
}

const getResourceStates = (users: User[]) =>
  RESOURCES.map(resource => ({
    resource,
    state: getCheckboxValue(users, user => user.cloudResourceSettings.resources.includes(resource)),
  }))

const getAllResourceState = (users: User[]) =>
  getCheckboxValue(users, user => RESOURCES.every(resource => user.cloudResourceSettings.resources.includes(resource)))

type ResourceDropdownItemProps = {
  status: 'none' | 'some' | 'all'
  onClick: MutationFunction<unknown, void>
  label: string
}

const ResourceDropdownItem = ({ status, onClick, label }: ResourceDropdownItemProps) => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => onClick(),
    mutationKey: ['resource-dropdown', label],
    onSuccess: () => {
      toastSuccess('User resources were successfully updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (e: AxiosError<BackendError>) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error while updating user resources!')
      }
    },
  })

  return (
    <ResourceItem>
      <label>
        <StyledCheckboxInputWrapper>
          <input
            type="checkbox"
            onClick={() => mutation.mutateAsync()}
            disabled={mutation.isPending}
            checked={status === 'all'}
          />
        </StyledCheckboxInputWrapper>
        <CheckBoxLabelText>{label}</CheckBoxLabelText>
      </label>
    </ResourceItem>
  )
}

export const ResourceDropdownContent = ({ selectedUsers }: { selectedUsers: User[] }) => {
  const resourceStates = getResourceStates(selectedUsers)
  const allResourceState = getAllResourceState(selectedUsers)

  const handleAllClick = () =>
    allResourceState === 'all'
      ? bulkDisableAllResources(selectedUsers.map((user: User) => user.id))
      : bulkEnableAllResources(selectedUsers.map((user: User) => user.id))

  return (
    <>
      <ResourceDropdownItem status={allResourceState} onClick={handleAllClick} label="All" />
      {resourceStates.map(({ resource, state }) => (
        <ResourceDropdownItem
          key={resource}
          status={state as ResourceDropdownItemProps['status']}
          onClick={() =>
            state === 'all'
              ? bulkDisableResource(
                  selectedUsers.map(user => user.id),
                  resource,
                )
              : bulkEnableResource(
                  selectedUsers.map(user => user.id),
                  resource,
                )
          }
          label={RESOURCE_LABELS[resource]}
        />
      ))}
    </>
  )
}
