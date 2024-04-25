import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BackLink } from '../../../components/Page/PageBackLink'
import { FormPageContainer } from '../../../components/Page/styles'
import { Topbox, TopboxItem } from './styles'
import { useAuthUser } from '../../auth/useAuthUser'
import { fetchApp } from '../apps.api'
import { HomeLoader, NotFound, Title } from '../../home/show.styles'
import { getBaseLink } from './utils'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { RunJobForm } from './RunJobForm'

export const RunJobPage = ({ spaceId }: { spaceId?: number }) => {
  const { appUid } = useParams<{ appUid: string }>()
  const user = useAuthUser()
  const { data: appData, isLoading } = useQuery({
    queryKey: ['app', appUid],
    queryFn: () => fetchApp(appUid as string),
    enabled: !!appUid,
  })

  const app = appData?.app
  const spec = appData?.meta.spec

  if (isLoading || user === undefined ) {
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
    <FormPageContainer>
      <Topbox>
        <BackLink linkTo={`/${getBaseLink(spaceId)}/apps/${app.uid}`}>
          Back to App
        </BackLink>
        <TopboxItem>
          <Title>
            <CubeIcon height={20} />
            <span>Run App:</span>
            <span>{appTitle}</span>
          </Title>
        </TopboxItem>
      </Topbox>

      <RunJobForm app={app} spec={spec} userJobLimit={user.job_limit} />
    </FormPageContainer>
  )
}
