import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router'
import { CubeIcon } from '../../../../components/icons/CubeIcon'
import DefaultLayout from '../../../../layouts/DefaultLayout'
import { useAuthUser } from '../../../auth/useAuthUser'
import { HomeLoader, NotFound, Title } from '../../show.styles'
import { fetchApp } from '../apps.api'
import { RunJobForm } from './RunJobForm'
import {
  StyledBackLink,
  Topbox,
  TopboxItem,
} from './styles'
import { getBaseLink } from './utils'


export const RunJobPage = ({ spaceId }: { spaceId: string }) => {
  const { appUid } = useParams<{ appUid: string }>()
  const user = useAuthUser()
  const { data: appData, status: loadingAppStatus } = useQuery(
    ['app', appUid],
    () => fetchApp(appUid),
  )

  const app = appData?.app
  const spec = appData?.meta.spec

  if (loadingAppStatus === 'loading' || user === undefined ) {
    return <HomeLoader />
  }

  if (!app || !spec) {
    return (
      <NotFound>
        <h1>App not found</h1>
        <div>Sorry, this app does not exist or is not accessible by you.</div>
      </NotFound>
    )
  }

  const appTitle = app.title ? app.title : app.name

  return (
    <DefaultLayout>
    <Topbox>
      <StyledBackLink linkTo={`/${getBaseLink(spaceId)}/apps/${app.uid}`}>
        Back to App
      </StyledBackLink>
      <TopboxItem>
        <Title>
          <CubeIcon height={20} />
          <span>Run App:</span>
          <span>{appTitle}</span>
        </Title>
      </TopboxItem>
    </Topbox>

    <RunJobForm
      app={app}
      spec={spec}
      userJobLimit={user.job_limit}
    />
  </DefaultLayout>

  )
}