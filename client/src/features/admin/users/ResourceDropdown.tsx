/* eslint-disable react/require-default-props */
import React, { useEffect, useRef, useState } from 'react'
import { useMutation, UseQueryResult } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { RESOURCES, RESOURCE_LABELS } from '../../../types/user'
import { getApiRequestOpts, checkStatus, displayPayloadMessage } from '../../../utils/api'
import { User } from './types'

const ResourceMenu = styled.ul`
  margin: 0;
  padding: 4px 0px;
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



const bulkEnableResource = async (
  ids: User['id'][],
  resource: User['cloudResourceSettings']['resources'][number],
) => fetch('/admin/bulk_enable_resource', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
      resource,
    }),
  }).then(checkStatus)

const bulkEnableAllResources = async (
  ids: User['id'][],
) => fetch('/admin/bulk_enable_all_resources', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ ids }),
  }).then(checkStatus)

const bulkDisableResource = async (
  ids: User['id'][],
  resource: User['cloudResourceSettings']['resources'][number],
) => fetch('/admin/bulk_disable_resource', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      ids,
      resource,
    }),
  }).then(checkStatus)

const bulkDisableAllResources = async (
  ids: User['id'][],
) => fetch('/admin/bulk_disable_all_resources', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ ids }),
  }).then(checkStatus)

const getResourceCheckboxValueByUsers = (
  users: User[],
  hasUserResourcePredicate: (u: User) => boolean,
) => {
  if (users.some(hasUserResourcePredicate)) {
    if (users.some((user) => !hasUserResourcePredicate(user))) {
      return 'some' as const
    }
    return 'all' as const
  }
  return 'none' as const
}

const getStateOfResourcesByUsers = (
  users: User[],
) => RESOURCES.map((resource) => {
    const retypedResource = resource as keyof typeof RESOURCE_LABELS
    return {
      resource: retypedResource,
      state: getResourceCheckboxValueByUsers(users, (u => u.cloudResourceSettings.resources.includes(retypedResource)) ),
    }
  })

const getStateOfAllResourcesByUsers = (
  users: User[],
) => getResourceCheckboxValueByUsers(users, (u => {
  const userResourcesSet = new Set(u.cloudResourceSettings.resources)
  return RESOURCES.every((resource) => userResourcesSet.has(resource))
}))

type CheckBoxStatus = ReturnType<typeof getResourceCheckboxValueByUsers>

type ResourceDropdownItemProps = {
  status: CheckBoxStatus
  onClick: () => void
  label: string
  isWaiting: boolean
  onSuccess: () => Promise<any>
  onError: () => void
  // NOTE this prop is a workaround, much cleaner solution would be to implement extra endpoint
  shouldConsiderRefetchLoader?: boolean
}

// Minor note - checkbox for "all" values should be disabled while any other checkbox is reloading, because of possible race condition
// However that would result in not-so-nice UX
const ResourceDropdownItem = ({ status, onClick, label, isWaiting, onSuccess, onError, shouldConsiderRefetchLoader }: ResourceDropdownItemProps) => {
  const [isConsideringRefetchLoader, setConsideringRefetchLoader] = useState(false)
  const onClickMutation = useMutation({
    // TS workaround - promise should be returned from this fn
    mutationFn: async () => onClick(),
    onSuccess: (res: any) => {
      displayPayloadMessage(res);
      (shouldConsiderRefetchLoader ? () => {
        setConsideringRefetchLoader(true)
        return onSuccess().then(() => setConsideringRefetchLoader(false))
      } : onSuccess)()
    },
    onError,
  })
  const isLoading = isWaiting || onClickMutation.isLoading || isConsideringRefetchLoader

  // Note(samuel) normally not a fan of using useEffect hook with extra deps, however either
  // a) component needs to respond to props changes with DOM mutations
  // b) Or alternatlively refactor of checkbox component is required
  const checkBoxRef = useRef(null)
  useEffect(() => {
    // isLoading added as dependency, because while isLoading === true, no checkbox is displayed
    if (!isLoading) {
      (checkBoxRef.current as any as HTMLInputElement).indeterminate = status === 'some'
    }
  }, [status, isLoading])

  const onCheckboxClick = async () => {
    if (!isLoading) {
      await onClickMutation.mutate()
    }
  }
  return (
    <ResourceItem onClick={() => onClickMutation.mutate()}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label>
        {!isLoading && (
          <StyledCheckboxInputWrapper>
            <input
              type='checkbox'
              ref={checkBoxRef}
              checked={status === 'all'}
              onClick={onCheckboxClick}
            />
          </StyledCheckboxInputWrapper>
        )}
        {isLoading && (
          <Loader
            height={12}
            shouldDisplayInline
          />
        )}
        <CheckBoxLabelText>
          {label}
        </CheckBoxLabelText>
      </label>
    </ResourceItem>

  )
}

type ResourceDropdownContentProps = {
  selectedUsers: User[]
  refetchUsers: UseQueryResult<{ users: User[]}>['refetch']
}

export const ResourceDropdownContent = ({ selectedUsers, refetchUsers } : ResourceDropdownContentProps) => {
  const stateOfResources = getStateOfResourcesByUsers(selectedUsers)
  const stateOfAllResources = getStateOfAllResourcesByUsers(selectedUsers)
  const alreadyEnabledResources = stateOfResources.filter(({ state }) => state === 'all').map(({ resource }) => resource)
  const [areCheckboxesBlocked, setCheckboxesBlocked] = useState(false)
  const onCheckboxUpdateSuccess = () => {
    toast.success('User resources updated', {
        toastId: '200 toast admin users page',
        position: toast.POSITION.TOP_CENTER,
        // autoClose: 1,
        closeOnClick: true,
    })
    return refetchUsers()
  }
  const onAllCheckboxUpdateSuccess = () => {
    toast.success('User resources updated', {
        toastId: '200 toast admin users page',
        position: toast.POSITION.TOP_CENTER,
        // autoClose: 1,
        closeOnClick: true,
    })
    return refetchUsers().then(() => {
      setCheckboxesBlocked(false)
    })
  }
  const onCheckboxUpdateError = () => {
    toast.error('Error updating user resources')
  }

  return (
    <ResourceMenu>
      <ResourceDropdownItem 
        status={stateOfAllResources}
        onClick={() => {
          setCheckboxesBlocked(true)
          return stateOfAllResources === 'all' 
          ? bulkDisableAllResources(selectedUsers.map((user) => user.id))
          : bulkEnableAllResources(selectedUsers.map((user) => user.id))
        }
        }
        label="All"
        isWaiting={areCheckboxesBlocked}
        onError={() => {
          onCheckboxUpdateError()
          setCheckboxesBlocked(false)
        }}
        onSuccess={onAllCheckboxUpdateSuccess}
      />
      {stateOfResources.map(({ resource, state }) => (
        <ResourceDropdownItem 
          status={state}
          onClick={() => (
            alreadyEnabledResources.includes(resource)
            ? bulkDisableResource(selectedUsers.map((user) => user.id), resource)
            : bulkEnableResource(selectedUsers.map((user) => user.id), resource)
          )}
          label={RESOURCE_LABELS[resource]}
          key={resource}
          isWaiting={areCheckboxesBlocked}
          onError={onCheckboxUpdateError}
          onSuccess={onCheckboxUpdateSuccess}
          shouldConsiderRefetchLoader
        />
      ))}
    </ResourceMenu>
  )
}
