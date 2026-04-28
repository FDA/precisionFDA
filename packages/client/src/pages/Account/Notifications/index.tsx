import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, Path, PathValue, useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/CheckboxNext'
import { FieldLabelRow } from '@/components/form/styles'
import { Loader } from '@/components/Loader'
import { toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { PageActions, PageHeader, PageTitle } from '@/components/Page/styles'
import { usePageMeta } from '@/hooks/usePageMeta'
import { fetchNotificationsPreferences, saveNotificationsPreferences } from './api'
import {
  FieldGroup,
  NotificationSectionColumn,
  NotificationSectionRow,
  SectionTitle,
  SectionTitleSmall,
  StyledNotifications,
  StyledPageContainer,
} from './styles'
import { AllNotification, NotificationPreferences } from './types'

type NotificationLabelType = Record<string, string>

const NotificationLabel: NotificationLabelType = {
  admin_membership_changed: 'Membership Changed',
  admin_comment_activity: 'Comment Activity',
  admin_content_added_or_deleted: 'Content Added Or Deleted',
  admin_member_added_to_space: 'Member Added to Space',
  admin_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  group_lead_membership_changed: 'Membership Changed',
  group_lead_comment_activity: 'Comment Activity',
  group_lead_content_added_or_deleted: 'Content Added Or Deleted',
  group_lead_member_added_to_space: 'Member Added to Space',
  group_lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  shared_lead_membership_changed: 'Membership Changed',
  shared_lead_comment_activity: 'Comment Activity',
  shared_lead_content_added_or_deleted: 'Content Added Or Deleted',
  shared_lead_member_added_to_space: 'Member Added to Space',
  shared_lead_space_locked_unlocked_deleted: 'Space Locked, Unlocked, or Deleted',

  group_contributor_membership_changed: 'Membership Changed',
  group_contributor_comment_activity: 'Comment Activity',
  group_contributor_content_added_or_deleted: 'Content Added or Deleted',

  group_viewer_membership_changed: 'Membership Changed',
  group_viewer_comment_activity: 'Comment Activity',
  group_viewer_content_added_or_deleted: 'Content Added or Deleted',

  shared_contributor_membership_changed: 'Membership Changed',
  shared_contributor_comment_activity: 'Comment Activity',
  shared_contributor_content_added_or_deleted: 'Content Added or Deleted',

  shared_viewer_membership_changed: 'Membership Changed',
  shared_viewer_comment_activity: 'Comment Activity',
  shared_viewer_content_added_or_deleted: 'Content Added or Deleted',
}

const NotificationForm = ({
  preferences,
  onSave,
}: {
  preferences: NotificationPreferences
  onSave: (v: NotificationPreferences) => void
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<NotificationPreferences>({
    defaultValues: preferences,
  })

  const handleSetValue = (
    path: Path<NotificationPreferences>,
    value: PathValue<NotificationPreferences, Path<NotificationPreferences>>,
  ) => {
    setValue(path, value, { shouldValidate: true })
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
              <FieldLabelRow>
                <Checkbox
                  {...field}
                  disabled={isSubmitting}
                  checked={field.value}
                  onChange={e => handleSetValue('private.private_challenge_opened', e.target.checked)}
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
                  onChange={e => handleSetValue('private.private_challenge_preregister', e.target.checked)}
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
                  checked={field.value}
                  onChange={e => handleSetValue('private.private_job_finished', e.target.checked)}
                />
                Notify me when an execution has finished.
              </FieldLabelRow>
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name="private.private_job_stale"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FieldLabelRow id="staleExecution">
                <Checkbox
                  {...field}
                  disabled={isSubmitting}
                  checked={field.value}
                  onChange={e => handleSetValue('private.private_job_stale', e.target.checked)}
                />
                Notify me when executions may be stuck or stale.
              </FieldLabelRow>
            )}
          />
        </FieldGroup>

        <SectionTitle>Space Notifications</SectionTitle>

        <SectionTitleSmall>Admin Role</SectionTitleSmall>
        {Object.entries(preferences.admin).map(([notification]) => (
          <FieldGroup key={notification}>
            <Controller
              name={`admin.${notification}` as Path<NotificationPreferences>}
              control={control}
              render={({ field }) => (
                <FieldLabelRow>
                  <Checkbox
                    {...field}
                    disabled={isSubmitting}
                    checked={!!field.value}
                    onChange={e =>
                      handleSetValue(`admin.${notification}` as Path<NotificationPreferences>, e.target.checked)
                    }
                  />
                  {NotificationLabel[notification]}
                </FieldLabelRow>
              )}
            />
          </FieldGroup>
        ))}

        <SectionTitle>Group Space Notifications</SectionTitle>

        <NotificationSectionRow>
          <NotificationSectionColumn>
            <SectionTitleSmall>Lead Role</SectionTitleSmall>
            {Object.entries(preferences.group_lead).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`group_lead.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `group_lead.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>

          <NotificationSectionColumn>
            <SectionTitleSmall>Contributor Role</SectionTitleSmall>
            {Object.entries(preferences.group_contributor).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`group_contributor.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `group_contributor.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>

          <NotificationSectionColumn>
            <SectionTitleSmall>Viewer Role</SectionTitleSmall>
            {Object.entries(preferences.group_viewer).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`group_viewer.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `group_viewer.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>
        </NotificationSectionRow>

        <SectionTitle>Review Space Notifications</SectionTitle>

        <NotificationSectionRow>
          <NotificationSectionColumn>
            <SectionTitleSmall>Lead Role</SectionTitleSmall>
            {Object.entries(preferences.shared_lead).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`shared_lead.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `shared_lead.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>

          <NotificationSectionColumn>
            <SectionTitleSmall>Contributor Role</SectionTitleSmall>
            {Object.entries(preferences.shared_contributor).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`shared_contributor.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `shared_contributor.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>

          <NotificationSectionColumn>
            <SectionTitleSmall>Viewer Role</SectionTitleSmall>
            {Object.entries(preferences.shared_viewer).map(([notification]) => (
              <FieldGroup key={notification}>
                <Controller
                  name={`shared_viewer.${notification}` as Path<NotificationPreferences>}
                  control={control}
                  render={({ field }) => (
                    <FieldLabelRow>
                      <Checkbox
                        {...field}
                        disabled={isSubmitting}
                        checked={!!field.value}
                        onChange={e =>
                          handleSetValue(
                            `shared_viewer.${notification}` as Path<NotificationPreferences>,
                            e.target.checked,
                          )
                        }
                      />
                      {NotificationLabel[notification]}
                    </FieldLabelRow>
                  )}
                />
              </FieldGroup>
            ))}
          </NotificationSectionColumn>
        </NotificationSectionRow>
      </StyledNotifications>
      <PageActions>
        <Button data-variant="primary" type="submit" disabled={isSubmitting}>
          Save Settings
        </Button>
      </PageActions>
    </form>
  )
}

const NotificationsPage = () => {
  usePageMeta({ title: 'Notifications - precisionFDA' })
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
      toastSuccess('Saved notification preferences')
    },
  })

  const handleOnsSubmit = async (variables: NotificationPreferences) => {
    const all = {
      ...variables.group_contributor,
      ...variables.shared_contributor,
      ...variables.group_viewer,
      ...variables.shared_viewer,
      ...variables.group_lead,
      ...variables.shared_lead,
      ...variables.admin,
      ...variables.private,
    } satisfies Record<AllNotification, boolean>

    return notificationsMutation(all)
  }

  return (
    <StyledPageContainer>
      <PageHeader>
        <PageTitle>Notification Preferences</PageTitle>
      </PageHeader>
      {isLoading ? <Loader /> : <NotificationForm onSave={handleOnsSubmit} preferences={data!.preference} />}
    </StyledPageContainer>
  )
}

export default NotificationsPage
