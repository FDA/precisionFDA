import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Checkbox } from '../../../components/CheckboxNext'
import { GuestNotAllowed } from '../../../components/GuestNotAllowed'
import { Loader } from '../../../components/Loader'
import { PageActions, PageHeader, PageTitle } from '../../../components/Page/styles'
import { Select } from '../../../components/Select'
import { FieldLabelRow } from '../../../components/form/styles'
import { useAuthUser } from '../../../features/auth/useAuthUser'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import { fetchNotificationsPreferences, saveNotificationsPreferences } from './api'
import { FieldGroup, SectionTitle, StyledNotifications, StyledPageContainer, StyledSelectWrap } from './styles'
import { AllNotification, NotificationPreferences, NotificationPreferencesPayload } from './types'
import { Button } from '../../../components/Button'

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

type NotificationPreferencesForm = NotificationPreferences

const NotificationForm = ({ preferences, onSave }: { preferences: NotificationPreferences; onSave: (v: NotificationPreferences) => void }) => {
  const [selectedRole, setSelectedRole] = useState<Roles>(Roles['reviewer'])
  const spaceNotificationRoles = Object.keys(preferences).filter(i => i !== 'private') as Array<Roles>
  const options = spaceNotificationRoles.map(value => ({ value, label: RoleLabel[value] }))
  const { control, handleSubmit, setValue, getValues, watch, formState: { isSubmitting }} = useForm<NotificationPreferencesForm>({
    defaultValues: preferences,
  })

  const handleSelectAll = (role: Roles, checked: boolean) => {
    Object.keys(getValues(role)).forEach(notification => {
      setValue(`${role}.${notification}`, checked)
    })
  }

  const isAllChecked = (role: Roles) => {
    return Object.values(watch()[role])?.every(value => value)
  }

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <StyledNotifications>
        <SectionTitle>Site Notifications</SectionTitle>
        <FieldGroup>
          <Controller
            name="private.private_challenge_opened"
            defaultValue={false}
            control={control}
            render={({ field }) => (
              <FieldLabelRow >
                <Checkbox
                  {...field}
                  disabled={isSubmitting}
                  checked={field.value}
                  onChange={e => setValue(field.name, e.target.checked)}
                />
                Notify me when a new precisionFDA challenge is opened.
              </FieldLabelRow>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="private.private_challenge_preregister"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FieldLabelRow id="preregChallenge">
                <Checkbox
                  {...field}
                  disabled={isSubmitting}
                  checked={field.value}
                  onChange={e => setValue(`${StaticRoles.private}.private_challenge_preregister`, e.target.checked)}
                />
                Notify me when a new precisionFDA challenge is open for pre-registration.
              </FieldLabelRow>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="private.private_job_finished"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FieldLabelRow id="finishedExecution">
                <Checkbox
                  {...field}
                  disabled={isSubmitting}
                  id="finishedExecution"
                  checked={field.value}
                  onChange={e => setValue('private.private_job_finished', e.target.checked)}
                />
                Notify me when an execution has finished.
              </FieldLabelRow>
            )}
          />
        </FieldGroup>

        <SectionTitle>Space Notifications</SectionTitle>

        <StyledSelectWrap>
          <Select
            options={options}
            isDisabled={isSubmitting}
            value={options.find(i => i.value === selectedRole)}
            onChange={(selected: any) => setSelectedRole(selected?.value)}
          />
        </StyledSelectWrap>

        <FieldGroup>
          <FieldLabelRow id="all">
            <Checkbox
              id="all"
              disabled={isSubmitting}
              checked={isAllChecked(selectedRole)}
              onChange={e => handleSelectAll(selectedRole, e.target.checked)}
            />
            All
          </FieldLabelRow>
        </FieldGroup>

        {Object.keys(watch()[selectedRole]).map(notification => {
          const name = `${selectedRole}.${notification}`
          return (
            <FieldGroup key={name}>
              <Controller
                name={name}
                disabled={isSubmitting}
                control={control}
                render={({ field }) => (
                  <FieldLabelRow id={name}>
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={e => setValue(name, e.target.checked)}
                    />
                    {NotificationLabel[notification]}
                  </FieldLabelRow>
                )}
              />
            </FieldGroup>
          )
        })}
      </StyledNotifications>
      <PageActions>
        <Button data-variant="primary" type="submit" disabled={isSubmitting}>Save Settings</Button>
      </PageActions>
    </form>
  )
}

const NotificationsPage = () => {
  usePageMeta({ title: 'Notifications - precisionFDA' })
  const user = useAuthUser()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotificationsPreferences,
  })

  const queryCache = useQueryClient()
  const { mutateAsync: notificationsMutation } = useMutation({
    mutationKey: ['save-notifications-pref'],
    mutationFn: saveNotificationsPreferences,
    onSuccess: () => {
      queryCache.invalidateQueries({
        queryKey: ['notifications'],
      })
      toast.success('Saved notification preferences')
    },
  })

  const handleOnsSubmit = async (variables: NotificationPreferences) => {
    const all = {
      ...variables.reviewer,
      ...variables.sponsor,
      ...variables.reviewer_lead,
      ...variables.sponsor_lead,
      ...variables.admin,
      ...variables.private,
    } satisfies Record<AllNotification, boolean>

    const payload = {} as NotificationPreferencesPayload
    Object.entries(all).forEach(([key, value]) => {
      const newValue = value === true ? 1 : 0
      payload[key] = newValue
    })

    return notificationsMutation(payload)
  }

  if (user?.is_guest) {
    return (
      <UserLayout mainScroll>
        <GuestNotAllowed />
      </UserLayout>
    )
  }

  return (
    <UserLayout mainScroll>
      <StyledPageContainer>
        <PageHeader>
          <PageTitle>Notification Preferences</PageTitle>
        </PageHeader>
        {isLoading ? <Loader /> : <NotificationForm onSave={handleOnsSubmit} preferences={data!.preference} />}
      </StyledPageContainer>
    </UserLayout>
  )
}

export default NotificationsPage
