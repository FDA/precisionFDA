import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { BackLink } from '../../../components/Page/PageBackLink'
import { FormPageContainer } from '../../../components/Page/styles'
import { useAuthUser } from '../../auth/useAuthUser'
import { HomeLoader, NotFound, Title } from '../../home/show.styles'
import { fetchApp } from '../apps.api'
import { RunJobForm } from './RunJobForm'
import { Topbox, TopboxItem } from './styles'
import { getBaseLink } from './utils'
import { defaultHomeContext, HomeScopeContextValue } from '../../home/HomeScopeContext'
import { useHomeDisplayScope } from '../../home/useHomeDisplayScope'

export const RunJobPage = ({ homeContext = defaultHomeContext }: { homeContext?: HomeScopeContextValue }) => {
  const { appIdentifier, spaceId } = useParams<{ appIdentifier: string, spaceId: string }>()
  const user = useAuthUser()
  const { data: appData, isLoading } = useQuery({
    queryKey: ['app', appIdentifier],
    queryFn: () => fetchApp(appIdentifier as string),
    enabled: !!appIdentifier,
  })

  const app = appData?.app
  const spec = appData?.meta.spec

  useHomeDisplayScope(homeContext, app?.scope, app?.featured)

  if (isLoading || user === undefined) {
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
        <BackLink linkTo={`/${getBaseLink(spaceId)}/apps/${app.uid}`}>Back to App</BackLink>
        <TopboxItem>
          <Title>
            <CubeIcon height={20} />
            <span>Run App:</span>
            <span>
              {appTitle} (rev{app.revision})
            </span>
          </Title>
        </TopboxItem>
      </Topbox>

      <RunJobForm app={app} spec={spec} userJobLimit={user.job_limit} />
    </FormPageContainer>
  )
}
