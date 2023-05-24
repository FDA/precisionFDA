import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Select from 'react-select'
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '../../../components/Page/styles'
import { ButtonSolidBlue } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { FieldGroup, SectionTitle, StyledNotifications, StyledPageContainer, StyledSelectWrap } from './styles'
import { fetchNotificationsPreferences, saveNotificationsPreferences } from './api'
import { GuestNotAllowed } from '../../../components/GuestNotAllowed'
import { mapValues } from '../../../utils/object'
import { useAuthUser } from '../../../features/auth/useAuthUser'
import { UserLayout } from '../../../layouts/UserLayout'
import { usePageMeta } from '../../../hooks/usePageMeta'

enum Roles {
  'reviewer' = 'reviewer',
  'sponsor' = 'sponsor',
  'reviewer_lead' = 'reviewer_lead',
  'sponsor_lead' = 'sponsor_lead',
  'admin' = 'admin',
}

enum StaticRoles {
  'private' = 'private',
}

const RoleLabel = {
  [Roles['reviewer']]: 'Reviewer',
  [Roles['sponsor']]: 'Sponsor',
  [Roles['reviewer_lead']]: 'Reviewer Lead',
  [Roles['sponsor_lead']]: 'Sponsor Lead',
  [Roles['admin']]: 'Review Space Admin',
}

const NotificationLabel: any = {
  admin_membership_changed: 'Membership Changed',
  admin_comment_activity: 'Comment Activity',
  admin_content_added_or_deleted: 'Content Added Or Deleted',
  admin_member_added_to_space: 'Member Added to Space',
  admin_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  reviewer_lead_membership_changed: 'Membership Changed',
  reviewer_lead_comment_activity: 'Comment Activity',
  reviewer_lead_content_added_or_deleted: 'Content Added Or Deleted',
  reviewer_lead_member_added_to_space: 'Member Added to Space',
  reviewer_lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  sponsor_lead_membership_changed: 'Membership Changed',
  sponsor_lead_comment_activity: 'Comment Activity',
  sponsor_lead_content_added_or_deleted: 'Content Added Or Deleted',
  sponsor_lead_member_added_to_space: 'Member Added to Space',
  sponsor_lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  sponsor_membership_changed: 'Membership Changed',
  sponsor_comment_activity: 'Comment Activity',
  sponsor_content_added_or_deleted: 'Content Added or Deleted',

  reviewer_membership_changed: 'Membership Changed',
  reviewer_comment_activity: 'Comment Activity',
  reviewer_content_added_or_deleted: 'Content Added or Deleted',
}

const preference = {
  reviewer: {
    reviewer_membership_changed: false,
    reviewer_comment_activity: false,
    reviewer_content_added_or_deleted: false,
  },
  sponsor: {
    sponsor_membership_changed: false,
    sponsor_comment_activity: false,
    sponsor_content_added_or_deleted: false,
  },
  reviewer_lead: {
    reviewer_lead_membership_changed: false,
    reviewer_lead_comment_activity: false,
    reviewer_lead_content_added_or_deleted: false,
    reviewer_lead_member_added_to_space: false,
    reviewer_lead_space_locked_unlocked_deleted: false,
  },
  sponsor_lead: {
    sponsor_lead_membership_changed: false,
    sponsor_lead_comment_activity: false,
    sponsor_lead_content_added_or_deleted: false,
    sponsor_lead_member_added_to_space: false,
    sponsor_lead_space_locked_unlocked_deleted: false,
  },
  admin: {
    admin_membership_changed: false,
    admin_comment_activity: false,
    admin_content_added_or_deleted: false,
    admin_member_added_to_space: false,
    admin_space_locked_unlocked_deleted: false,
  },
  private: {
    private_job_finished: false,
    private_challenge_opened: false,
    private_challenge_preregister: false,
  },
}

const NotificationsPage = () => {
  usePageMeta({ title: 'Notifications - precisionFDA' })
  const user = useAuthUser()
  const [localPrefSelection, setLocalPrefSelection] = useState<any>(preference)
  const roles = Object.keys(localPrefSelection) as Array<Roles>
  const options = roles.map(value => ({ value, label: RoleLabel[value] }))
  const [selectedRole, setSelectedRole] = useState<Roles>(Roles['reviewer'])

  const { data, status, error } = useQuery<any>(['notifications'], fetchNotificationsPreferences)

  const queryCache = useQueryClient()
  const { mutateAsync: notificationsMutation } = useMutation(
    {
      mutationKey: ['save-notifications-pref'],
      mutationFn: saveNotificationsPreferences,
      onSuccess: () => {
        queryCache.invalidateQueries(['notifications'])
      },
      onError: () => {
      },
    },
  )

  useEffect(() => {
    if (data?.preference) {
      setLocalPrefSelection(data?.preference)
    }
  }, [data])

  const isAllChecked = (keys: { [key: string]: boolean }) => {
    const includesFalse = Object.keys(keys)
      .map(k => keys[k])
      .includes(false)
    return !includesFalse
  }

  const handleSelection = (role: Roles | StaticRoles, notification: string) => {
    setLocalPrefSelection({
      ...localPrefSelection,
      [role]: {
        ...localPrefSelection[role],
        [notification]: !localPrefSelection[role][notification],
      },
    })
  }

  const handleCheckAll = (role: Roles) => {
    const newVals = mapValues(
      localPrefSelection[role],
      () => !isAllChecked(localPrefSelection[role]),
    )
    setLocalPrefSelection({
      ...localPrefSelection,
      [role]: {
        ...newVals,
      },
    })
  }

  const handleSave = () => {
    notificationsMutation(localPrefSelection)
  }

  const siteNotificationsRole = StaticRoles.private
  const enableJobNotificationSettings: any = localPrefSelection[siteNotificationsRole]?.private_job_finished //true
  const enableChallengeOpenNotificationSettins: any = localPrefSelection[siteNotificationsRole]?.private_challenge_opened //true
  const enableChallengePreregNotificationSettins: any = localPrefSelection[siteNotificationsRole]?.private_challenge_preregister //true

  if(user?.is_guest) {
    return <UserLayout><GuestNotAllowed /></UserLayout>
  }

  return (
    <UserLayout>
      <form>
        <StyledPageContainer>
          <PageHeader>
            <PageTitle>Notification Preferences</PageTitle>
            <PageActions>
              <ButtonSolidBlue type="button" onClick={handleSave}>Save Settings</ButtonSolidBlue>
            </PageActions>
          </PageHeader>

          <StyledNotifications>
            <SectionTitle>Site Notifications</SectionTitle>
            <FieldGroup>
              <Checkbox
                id="newChallenge"
                name="newChallenge"
                type="checkbox"
                checked={enableChallengeOpenNotificationSettins}
                onChange={() =>
                  handleSelection(siteNotificationsRole, 'private_challenge_opened')
                }
              />
              <label htmlFor="newChallenge">
                Notify me when a new precisionFDA challenge is opened.
              </label>
            </FieldGroup>
            <FieldGroup>
              <Checkbox
                id="preregChallenge"
                name="preregChallenge"
                type="checkbox"
                checked={enableChallengePreregNotificationSettins}
                onChange={() =>
                  handleSelection(siteNotificationsRole, 'private_challenge_preregister')
                }
              />
              <label htmlFor="preregChallenge">
                Notify me when a new precisionFDA challenge is open for pre-registration.
              </label>
            </FieldGroup>
            <FieldGroup>
              <Checkbox
                id="finishedExecution"
                name="finishedExecution"
                type="checkbox"
                checked={enableJobNotificationSettings}
                onChange={() =>
                  handleSelection(siteNotificationsRole, 'private_job_finished')
                }
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
        </StyledPageContainer>
      </form>
    </UserLayout>
  )
}

export default NotificationsPage
