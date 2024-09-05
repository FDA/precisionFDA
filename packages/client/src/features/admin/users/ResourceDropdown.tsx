import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { RESOURCES, RESOURCE_LABELS } from '../../../types/user'
import { bulkDisableAllResources, bulkDisableResource, bulkEnableAllResources, bulkEnableResource } from './api'
import { User } from './types'

const ResourceMenu = styled.ul`
  margin: 0;
  padding: 4px 0;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 3px;
`

const ResourceItem = styled.li`
  padding: 0 20px;
  margin: 0;
  list-style: none;
  line-height: 23px;
  color: #272727;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: rgb(242,242,242);
  }
  a {
    color: #272727;
    display: inline-block;
    width: 100%;
  }
`

const CheckBoxLabelText = styled.span`
  margin-left: 6px;
  margin-right: 64px;
`

const StyledCheckboxInputWrapper = styled.span`
  margin-left: 50px;
`

const getCheckboxValue = (users: User[], predicate: (user: User) => boolean) => {
  const hasSome = users.some(predicate)
  const hasAll = users.every(predicate)
  return hasAll ? 'all' : hasSome ? 'some' : 'none'
}

const getResourceStates = (users: User[]) =>
  RESOURCES.map((resource) => ({
    resource,
    state: getCheckboxValue(users, (user) =>
      user.cloudResourceSettings.resources.includes(resource),
    ),
  }))

const getAllResourceState = (users: User[]) =>
  getCheckboxValue(users, (user) =>
    RESOURCES.every((resource) =>
      user.cloudResourceSettings.resources.includes(resource),
    ),
  )

const ResourceDropdownItem = ({ status, onClick, label } : { status: any, onClick: any, label: string}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => onClick(),
    mutationKey: ['resource-dropdown', label],
    onSuccess: () => {
      toast.success('User resources updated')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Error: Updating user resources')
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
    <ResourceMenu>
      <ResourceDropdownItem
        status={allResourceState}
        onClick={handleAllClick}
        label="All"
      />
      {resourceStates.map(({ resource, state }) => (
        <ResourceDropdownItem
          key={resource}
          status={state}
          onClick={() =>
            state === 'all'
              ? bulkDisableResource(selectedUsers.map((user) => user.id), resource)
              : bulkEnableResource(selectedUsers.map((user) => user.id), resource)
          }
          label={RESOURCE_LABELS[resource]}
        />
      ))}
    </ResourceMenu>
  )
}