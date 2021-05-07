import React, { useState } from 'react'
import { mapValues } from 'lodash'
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageActions,
} from '../../../../components/Page/styles'
import { FieldGroup, SectionTitle, StyledNotifications, StyledSelectWrap } from './styles'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import Select from 'react-select'
import { Checkbox } from '../../../../components/Checkbox'

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
  admin_new_task_assigned: 'New Task Assigned',
  admin_task_status_changed: 'Task Status Changed',
  admin_comment_activity: 'Comment Activity',
  admin_content_added_or_deleted: 'Content Added Or Deleted',
  admin_member_added_or_removed_from_space: 'Member Added Or Removed From Space',
  admin_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',
  admin_space_lock_unlock_delete_requests: 'Space Locked, Unlocked, or Deleted Request',
  lead_membership_changed: 'Membership Changed',
  lead_new_task_assigned: 'New Task Assigned',
  lead_task_status_changed: 'Task Status Changed',
  lead_comment_activity: 'Comment Activity',
  lead_content_added_or_deleted: 'Content Added Or Deleted',
  lead_member_added_or_removed_from_space: 'Member Added Or Removed From Space',
  lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',
  all_membership_changed: 'Membership Changed',
  all_new_task_assigned: 'New Task Assigned',
  all_task_status_changed: 'Task Status Changed',
  all_comment_activity: 'Comment Activity',
  all_content_added_or_deleted: 'Content Added or Deleted',
}

const preference = {
  review_space_admin: {
    admin_membership_changed: true,
    admin_new_task_assigned: true,
    admin_task_status_changed: false,
    admin_comment_activity: true,
    admin_content_added_or_deleted: true,
    admin_member_added_or_removed_from_space: true,
    admin_space_locked_unlocked_deleted: true,
    admin_space_lock_unlock_delete_requests: true,
  },
  lead_reviewer: {
    lead_membership_changed: true,
    lead_new_task_assigned: true,
    lead_task_status_changed: true,
    lead_comment_activity: true,
    lead_content_added_or_deleted: true,
    lead_member_added_or_removed_from_space: true,
    lead_space_locked_unlocked_deleted: true,
  },
  reviewer: {
    all_membership_changed: true,
    all_new_task_assigned: false,
    all_task_status_changed: true,
    all_comment_activity: true,
    all_content_added_or_deleted: true,
  },
}

export const NotificationsPage = () => {
  const [localPrefSelection, setLocalPrefSelection] = useState<any>(preference)
  const roles = Object.keys(localPrefSelection) as Array<Roles>
  const options = roles.map(value => ({ value, label: RoleLabel[value] }))
  const [selectedRole, setSelectedRole] = useState<Roles>(Roles['reviewer'])

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

  return (
    <form>
      <PageContainer>
        <PageHeader>
          <PageTitle>Notification Preferences</PageTitle>
          <PageActions>
            <Button type="submit">Cancel</Button>
            <ButtonSolidBlue type="submit">Save Settings</ButtonSolidBlue>
          </PageActions>
        </PageHeader>

        <StyledNotifications>
          <SectionTitle>Site Notifications</SectionTitle>

          <FieldGroup>
            <Checkbox id="newChallenge" name="newChallenge" type="checkbox" />
            <label htmlFor="newChallenge">
              Notify me when a new precisionFDA challenge is created.
            </label>
          </FieldGroup>

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
      </PageContainer>
    </form>
  )
}
