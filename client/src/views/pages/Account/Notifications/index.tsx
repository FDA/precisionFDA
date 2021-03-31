import React from 'react'
import { Formik, Form, Field } from 'formik'
import { PageContainer, PageHeader, PageTitle, PageActions } from '../../../../components/Page/styles'
import { FieldGroup, SectionTitle, StyledNotifications } from './styles'
import { Button, ButtonSolidBlue } from '../../../../components/Button'

interface FormValues {
  [key: string]: boolean
}

export const NotificationsPage = () => {
  const initialValues: FormValues = {
      newChallenge: false,
      finishedExecution: false,
      membershipChanged: false,
      newTaskAssigned: false,
      taskStatusChanged: false,
      commentActivity: false,
      contentAddedOrDeleted: false,
      memberAddedOrRemovedFromSpace: false,
  } 

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, actions) => {
        console.log({ values, actions })
        alert(JSON.stringify(values, null, 2))
        actions.setSubmitting(false)
      }}
    >
      <PageContainer>
        <PageHeader>
          <PageTitle>Notification Preferences</PageTitle>
          <PageActions>
            <Button type="submit">Cancel</Button>
            <ButtonSolidBlue type="submit">Save Settings</ButtonSolidBlue>
          </PageActions>
        </PageHeader>

        <Form>
          <StyledNotifications>
            <SectionTitle>Site Notifications</SectionTitle>

            <FieldGroup>
              <Field
                id="newChallenge"
                name="newChallenge"
                type="checkbox"
              />
              <label htmlFor="newChallenge">Notify me when a new precisionFDA challenge is created.</label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="finishedExecution"
                name="finishedExecution"
                type="checkbox"
              />
              <label htmlFor="finishedExecution">Notify me when an execution has finished.</label>
            </FieldGroup>

            <SectionTitle>Space Notifications</SectionTitle>

            <FieldGroup>
              <Field
                id="membershipChanged"
                name="membershipChanged"
                type="checkbox"
              />
              <label htmlFor="membershipChanged">Membership Changed</label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="newTaskAssigned"
                name="newTaskAssigned"
                type="checkbox"
              />
              <label htmlFor="newTaskAssigned">New Task Assigned</label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="taskStatusChanged"
                name="taskStatusChanged"
                type="checkbox"
              />
              <label htmlFor="taskStatusChanged">Task Status Changed</label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="commentActivity"
                name="commentActivity"
                type="checkbox"
              />
              <label htmlFor="commentActivity">Comment Activity</label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="contentAddedOrDeleted"
                name="contentAddedOrDeleted"
                type="checkbox"
              />
              <label htmlFor="contentAddedOrDeleted">
                Content Added Or Deleted
              </label>
            </FieldGroup>

            <FieldGroup>
              <Field
                id="memberAddedOrRemovedFromSpace"
                name="memberAddedOrRemovedFromSpace"
                type="checkbox"
              />
              <label htmlFor="memberAddedOrRemovedFromSpace">
                Member Added Or Removed From Space
              </label>
            </FieldGroup>
          </StyledNotifications>
        </Form>
      </PageContainer>
    </Formik>
  )
}
