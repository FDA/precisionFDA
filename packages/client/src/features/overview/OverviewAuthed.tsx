import { formatDistance, parseISO } from 'date-fns'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { PageContainerMargin } from '../../components/Page/styles'
import {
  PageMainBody,
  PageRow,
  RightSide,
  RightSideItem,
  SectionTitle,
} from '../../components/Public/styles'
import { usePageMeta } from '../../hooks/usePageMeta'
import { IUser } from '../../types/user'
import GuestRestrictedLink from '../../components/Controls/GuestRestrictedLink'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { ExpertListItem } from '../experts/list/ExpertListItem'
import { useExpertsListQuery } from '../experts/useExpertsListQuery'
import { fetchApps } from '../apps/apps.api'
import { IApp } from '../apps/apps.types'
import { ChallengesBanner } from './ChallengesBanner'
import ChallengesOverviewList from './ChallengesOverviewList'
import { OverviewNewsList } from './OverviewNewsList'
import { ParticipantOrgsList } from './ParticipantsOrgsList'
import {
  CommunityParticipants,
  ExpertSection,
  Hr,
  InfoRow,
  PageOverviewMainBody,
} from './styles'
import { AppTypeIconBlue } from '../../components/icons/AppTypeIconBlue'
import { AppTypeIconYellow } from '../../components/icons/AppTypeIconYellow'
import { Button } from '../../components/Button'
import { ToolsIcon } from '../../components/icons/ToolsIcon'
import { RocketIcon } from '../../components/icons/RocketIcon'
import { AppMarketIcon } from '../../components/icons/AppMarketIcon'

const StyledGetStarted = styled.div`
  background-color: var(--tertiary-70);
  padding: 16px;
  margin-bottom: 32px;
  font-size: 13px;
  line-height: 26px;
`

const IconLink = styled(Link)`
  display: flex;
  gap: 8px;
  align-items: center;
`

const GetStarted = ({ user }: { user?: IUser }) => {
  // for FDA users
  if (user && user.isGovUser) {
    return (
      <StyledGetStarted>
        <SectionTitle>Getting Started</SectionTitle>
        <Hr/>
        <IconLink data-turbolinks="false" to="/data-portals/19">
          <RocketIcon height={17} />
          Introduction and Next Steps
        </IconLink>

        <IconLink data-turbolinks="false" to="/data-portals/17">
          <ToolsIcon height={17} />
          Use Case Toolbox
        </IconLink>

        <IconLink data-turbolinks="false" to="/data-portals/20">
          <AppMarketIcon height={17} />
          Multi-omics App Library
        </IconLink>
        <Hr />
        <a
          href="https://public.govdelivery.com/accounts/USFDA/subscriber/new?topic_id=USFDA_564"
          target="_blank"
          rel="noreferrer"
        >
          precisionFDA Mailing List
        </a>
      </StyledGetStarted>
    )
  }

  // for General users
  return (
    <StyledGetStarted>
      <SectionTitle>Getting Started</SectionTitle>
      <Hr/>
      <div>
        <Link data-turbolinks="false" to="/docs/introduction">Introduction to precisionFDA</Link>
      </div>
      <div>
        <Link data-turbolinks="false" to="/docs/files">Uploading Files &amp; Data</Link>
      </div>
      <div>
        <Link data-turbolinks="false" to="/docs/apps">Running Apps</Link>
      </div>
      <div>
        <Link to="/docs/spaces">Collaborating with Spaces</Link>
      </div>
      <div>
        <Link to="/home/files/file-GfkBx1j0Kj2Yj04FJVV0xXzF-2">Multi-omics App Library</Link>
      </div>
      <Hr/>
      <div>
        <a
          href="https://public.govdelivery.com/accounts/USFDA/subscriber/new?topic_id=USFDA_564"
          target="_blank"
          rel="noreferrer"
        >
          precisionFDA Mailing List
        </a>
      </div>
    </StyledGetStarted>
  )
}

const TopAppsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 64px;
  gap: 32px;

  @media (min-width: 660px) {
    flex-direction: row;
  }
`

const TopAppsColumn = styled.div`
  flex-grow: 1;
  flex-basis: 0;
`

const TopAppsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StyledTopAppItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  a {
      cursor: pointer;
  }
`

const Title = styled.div`
  a {
    color: var(--c-text-700);
    font-weight: bolder;
    line-height: 20px;
    font-size: 14px;
  }

  a:hover {
    color: var(--primary-500);
  }
`
const AppOrg = styled.div`
  color: var(--c-text-500);
  line-height: 20px;
  font-size: 12px;
`
const AppUpdatedAt = styled.div`
  color: var(--c-text-700);
  line-height: 20px;
  font-size: 12px;
`

const TopAppItem = ({ app }: { app: IApp }) => {
  const timeDistance = formatDistance(new Date(), parseISO(app.updated_at))
  const isRegular = app.entity_type === 'regular'
  const linkToApp = `/home${app.links.show}`
  const ariaLabel = `Click this to navigate to the ${app.title} page`

  return (
    <StyledTopAppItem>
      <div>
        <GuestRestrictedLink to={linkToApp} aria-label={ariaLabel}>
          {isRegular ? (
            <AppTypeIconBlue width={56} height={56}/>
          ) : (
            <AppTypeIconYellow width={56} height={56}/>
          )}
        </GuestRestrictedLink>
      </div>
      <div>
        <Title>
          <GuestRestrictedLink to={linkToApp} aria-label={ariaLabel}>
            {app.title}
          </GuestRestrictedLink>
        </Title>
        <AppOrg>{app.org}</AppOrg>
        <AppUpdatedAt>Updated {timeDistance} ago</AppUpdatedAt>
      </div>
    </StyledTopAppItem>
  )
}

export const TopApps = () => {
  const { data: recentAppsData, isLoading: isLoadingRecentAppsData } = useQuery({
    queryKey: ['recent-apps-everybody'],
    queryFn: () => fetchApps([], { scope: 'everybody' }),
  })
  const { data: featuredAppsData, isLoading: isLoadingFeaturedAppsData } =
    useQuery({
      queryKey: ['featured-apps'],
      queryFn: () => fetchApps([], { scope: 'featured' }),
    })
  return (
    <TopAppsContainer>
      <TopAppsColumn>
        <SectionTitle>Most Recent Apps</SectionTitle>
        <TopAppsList>
          {isLoadingRecentAppsData ? (
            <Loader className="inline"/>
          ) : (
            recentAppsData?.apps?.slice(0, 4).map(a => <TopAppItem key={a.id} app={a}/>)
          )}
        </TopAppsList>
      </TopAppsColumn>
      <TopAppsColumn>
        <SectionTitle>Top Featured Apps</SectionTitle>
        <TopAppsList>
          {isLoadingFeaturedAppsData ? (
            <Loader className="inline"/>
          ) : (
            featuredAppsData?.apps?.slice(0, 4)
              .map(a => <TopAppItem key={a.id} app={a}/>)
          )}
        </TopAppsList>
      </TopAppsColumn>
    </TopAppsContainer>
  )
}

export const OverviewAuthed = () => {
  usePageMeta({ title: 'precisionFDA - Overview' })
  const user = useAuthUser()
  const { data: expertsData, isLoading: expertsIsLoading } =
    useExpertsListQuery({})

  return (
    <PublicLayout mainScroll>
      <NavigationBar user={user} title="Overview"/>
      <PageContainerMargin>
        <PageRow>
          <PageOverviewMainBody>
            <TopApps/>
            <ChallengesBanner/>
            <ChallengesOverviewList/>
            <ExpertSection>
              <SectionTitle>Expert Highlight</SectionTitle>
              {expertsData?.experts[0] && (expertsIsLoading ? (
                <Loader className="inline"/>
              ) : (
                <ExpertListItem expert={expertsData.experts[0]}/>
              ))}
            </ExpertSection>
          </PageOverviewMainBody>
          <RightSide>
            <GetStarted user={user}/>
            <RightSideItem>
              <SectionTitle>Latest News</SectionTitle>
              <OverviewNewsList pick={3}/>
              <Hr/>
              <Link to="/news">View All News</Link>
              <Hr/>
              <Link to="/news?type=publication">View All Publications</Link>
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
      <CommunityParticipants>
        <SectionTitle>COMMUNITY PARTICIPANTS</SectionTitle>
        <ParticipantOrgsList/>
      </CommunityParticipants>

      <PageMainBody>
        <InfoRow>
          <Button data-variant="primary" as={Link} to="/docs">
            Learn more about precisionFDA
          </Button>
          <a href="mailto:precisionfda@fda.hhs.gov">Feedback</a>
        </InfoRow>
      </PageMainBody>
    </PublicLayout>
  )
}
