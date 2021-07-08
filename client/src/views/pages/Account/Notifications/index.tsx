import React, { useEffect, useState } from 'react'
import { mapValues } from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '../../../../components/Page/styles'
import { FieldGroup, SectionTitle, StyledNotifications, StyledPageContainer, StyledSelectWrap } from './styles'
import { ButtonSolidBlue } from '../../../../components/Button'
import Select from 'react-select'
import { Checkbox } from '../../../../components/Checkbox'
import { fetchNotificationsPreferences, saveNotificationsPreferences } from './api'
import DefaultLayout from '../../../layouts/DefaultLayout'
import { useSelector } from 'react-redux'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { GuestNotAllowed } from '../../../../components/GuestNotAllowed'

enum Roles {
  'review_space_admin' = 'review_space_admin',
  'lead_reviewer' = 'lead_reviewer',
  'reviewer' = 'reviewer',
}

const RoleLabel = {
  [Roles['review_space_admin']]: 'Review Space Admin',
  [Roles['lead_reviewer']]: 'Lead Reviewer',
  [Roles['reviewer']]: 'Reviewer',
}

const NotificationLabel: any = {
  admin_membership_changed: 'Membership Changed',
  admin_comment_activity: 'Comment Activity',
  admin_content_added_or_deleted: 'Content Added Or Deleted',
  admin_member_added_or_removed_from_space: 'Member Added Or Removed From Space',
  admin_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',
  admin_space_lock_unlock_delete_requests: 'Space Locked, Unlocked, or Deleted Request',
  lead_membership_changed: 'Membership Changed',
  lead_comment_activity: 'Comment Activity',
  lead_content_added_or_deleted: 'Content Added Or Deleted',
  lead_member_added_or_removed_from_space: 'Member Added Or Removed From Space',
  lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',
  all_membership_changed: 'Membership Changed',
  all_comment_activity: 'Comment Activity',
  all_content_added_or_deleted: 'Content Added or Deleted',
}

const preference = {
  review_space_admin: {
    admin_membership_changed: false,
    admin_comment_activity: false,
    admin_content_added_or_deleted: false,
    admin_member_added_or_removed_from_space: false,
    admin_space_locked_unlocked_deleted: false,
    admin_space_lock_unlock_delete_requests: false,
  },
  lead_reviewer: {
    lead_membership_changed: false,
    lead_comment_activity: false,
    lead_content_added_or_deleted: false,
    lead_member_added_or_removed_from_space: false,
    lead_space_locked_unlocked_deleted: false,
  },
  reviewer: {
    all_membership_changed: false,
    all_comment_activity: false,
    all_content_added_or_deleted: false,
  },
}

export const NotificationsPage = () => {
  const user = useSelector(contextUserSelector)
  const [localPrefSelection, setLocalPrefSelection] = useState<any>(preference)
  const roles = Object.keys(localPrefSelection) as Array<Roles>
  const options = roles.map(value => ({ value, label: RoleLabel[value] }))
  const [selectedRole, setSelectedRole] = useState<Roles>(Roles['reviewer'])

  const { data, status, error } = useQuery<any>('notifications', fetchNotificationsPreferences)

  const queryCache = useQueryClient()
  const {mutateAsync: notificationsMutation } = useMutation(
    saveNotificationsPreferences,
    {
      onSuccess: () => {
        queryCache.invalidateQueries('notifications')
        // showInfoAlert('Saved!')
      },
      onError: () => {
        // showErrorAlert('Error saving')
      }
    }
  )

  useEffect(() => {
    if(data?.preference) {
      setLocalPrefSelection(data?.preference)
    }
  }, [data])

  const isAllChecked = (keys: {[key: string]: boolean}) => {
    const includesFalse = Object.keys(keys).map(k => keys[k]).includes(false)
    return !includesFalse
  }

  const handleSelection = (role: Roles, notification: string) => {
    setLocalPrefSelection({
      ...localPrefSelection,
      [role]: {
        ...localPrefSelection[role],
        [notification]: !localPrefSelection[role][notification]
      }
    })
  }

  const handleCheckAll = (role: Roles) => {
    const newVals = mapValues(localPrefSelection[role], () => !isAllChecked(localPrefSelection[role]));
    setLocalPrefSelection({
      ...localPrefSelection,
      [role]: {
        ...newVals
      }
    })
  }

  const handleSave = () => {
    notificationsMutation(localPrefSelection)
  }

  const enableJobNotificationSettings = false
  const enableChallengeNotificationSettins = false

  if(user.is_guest) {
    return <DefaultLayout><GuestNotAllowed /></DefaultLayout>
  }

  return (
    <DefaultLayout>
      <form>
        <StyledPageContainer>
          <PageHeader>
            <PageTitle>Notification Preferences</PageTitle>
            <PageActions>
              <ButtonSolidBlue type="button" onClick={handleSave}>Save Settings</ButtonSolidBlue>
            </PageActions>
          </PageHeader>

          <StyledNotifications>
            {enableJobNotificationSettings || enableChallengeNotificationSettins &&
            <SectionTitle>Site Notifications</SectionTitle>
            }

            {enableChallengeNotificationSettins &&
            <FieldGroup>
              <Checkbox id="newChallenge" name="newChallenge" type="checkbox" />
              <label htmlFor="newChallenge">
                Notify me when a new precisionFDA challenge is created.
              </label>
            </FieldGroup>
            }

            {enableJobNotificationSettings &&
            <FieldGroup>
              <Checkbox
                id="finishedExecution"
                name="finishedExecution"
                type="checkbox"
              />
              <label htmlFor="finishedExecution">
                Notify me when an execution has finished.
              </label>
            </FieldGroup>
            }

            <SectionTitle>Space Notifications</SectionTitle>

            <StyledSelectWrap>
              <Select
                options={options}
                defaultValue={{
                  value: selectedRole,
                  label: RoleLabel[selectedRole],
                }}
                onChange={(selected: any) => setSelectedRole(selected?.value)}
              />
            </StyledSelectWrap>

            <FieldGroup>
              <Checkbox
                id="all"
                name="all"
                type="checkbox"
                checked={isAllChecked(localPrefSelection[selectedRole])}
                onChange={() => handleCheckAll(selectedRole)}
              />
              <label htmlFor="all">All</label>
            </FieldGroup>

            {Object.keys(localPrefSelection[selectedRole]).map(notification => {
                const key = `${localPrefSelection[selectedRole]}.${notification}`
                return (
                  <FieldGroup key={key}>
                    <Checkbox
                      id={key}
                      name={key}
                      type="checkbox"
                      checked={localPrefSelection[selectedRole][notification]}
                      onChange={() => handleSelection(selectedRole, notification)}
                    />
                    <label htmlFor={key}>{NotificationLabel[notification]}</label>
                  </FieldGroup>
                )
              })}
          </StyledNotifications>
        </StyledPageContainer>
      </form>
    </DefaultLayout>
  )
}
