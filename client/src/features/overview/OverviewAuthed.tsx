import { formatDistance, parseISO } from 'date-fns'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../components/Button'
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
import { colors, fontWeight } from '../../styles/theme'
import { IUser } from '../../types/user'
import GuestRestrictedLink from '../../components/Controls/GuestRestrictedLink'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { ExpertListItem } from '../experts/list/ExpertListItem'
import { useExpertsListQuery } from '../experts/useExpertsListQuery'
import { fetchApps } from '../home/apps/apps.api'
import { IApp } from '../home/apps/apps.types'
import { ChallengesBanner } from './ChallengesBanner'
import ChallengesOverviewList from './ChallengesOverviewList'
import { OverviewNewsList } from './OverviewNewsList'
import { ParticipantPersonsList } from './ParticipantPersonsList'
import { ParticipantOrgsList } from './ParticipantsOrgsList'
import {
  CommunityParticipants,
  ExpertSection,
  Hr,
  InfoRow,
  PFDATeamSection,
} from './styles'
import { AppTypeIconBlue } from '../../components/icons/AppTypeIconBlue'
import { AppTypeIconYellow } from '../../components/icons/AppTypeIconYellow'

const StyledGetStarted = styled.div`
  background-color: rgb(242, 242, 242);
  padding: 16px;
  margin-bottom: 32px;
`

const GettingStartedHr = styled.hr`
  margin: 12px 0;
  border-top: 1px solid ${colors.highlightBlue};
`

const Row = styled.div`
  font-size: 13px;
  line-height: 26px;
`

const GetStarted = ({ user }: { user?: IUser }) => {
  return (
    <StyledGetStarted>
      <SectionTitle>Getting Started</SectionTitle>
      <Row>
        <Link data-turbolinks="false" to="/docs">
          For New Users
        </Link>
      </Row>
      {user?.can_see_spaces && (
        <Row>
          <Link data-turbolinks="false" to="/docs/spaces">
            For Reviewers
          </Link>
        </Row>
      )}
      <GettingStartedHr />
      <Row>
        <Link data-turbolinks="false" to="/docs">
          Introduction to precisionFDA
        </Link>
      </Row>
      <Row>
        <Link data-turbolinks="false" to="/docs/files">
          Uploading Files &amp; Data
        </Link>
      </Row>
      <Row>
        <Link data-turbolinks="false" to="/docs/apps">
          Running Apps
        </Link>
      </Row>
      {user?.can_see_spaces && (
        <Row>
          <Link to="/docs/spaces">Review Spaces: Step by Step</Link>
        </Row>
      )}
      <GettingStartedHr />
      <Row>
        <a
          href="https://public.govdelivery.com/accounts/USFDA/subscriber/new?topic_id=USFDA_564"
          target="_blank"
          rel="noreferrer"
        >
          precisionFDA Mailing List
        </a>
      </Row>
    </StyledGetStarted>
  )
}

const TopAppsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 64px;
  gap: 32px;

  @media(min-width: 660px) {
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
    color: ${colors.textBlack};
    font-weight: ${fontWeight.black};
    line-height: 20px;
    font-size: 14px;
  }
  a:hover {
    color: ${colors.primaryBlue};
  }
`
const AppOrg = styled.div`
  color: ${colors.textMediumGrey};
  line-height: 20px;
  font-size: 12px;
`
const AppUpdatedAt = styled.div`
  color: ${colors.blacktextOnWhite};
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
            <AppTypeIconBlue width={56} height={56} />
          ) : (
            <AppTypeIconYellow width={56} height={56} />
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
  const { data: recentAppsData, isLoading: isLoadingRecentAppsData } = useQuery(
    ['recent-apps-everybody'],
    {
      queryFn: () => fetchApps([], { scope: 'everybody' }),
    },
  )
  const { data: featuredAppsData, isLoading: isLoadingFeaturedAppsData } =
    useQuery(['featured-apps'], {
      queryFn: () => fetchApps([], { scope: 'featured' }),
    })
  return (
    <TopAppsContainer>
      <TopAppsColumn>
        <SectionTitle>Most Recent Apps</SectionTitle>
        <TopAppsList>
          {isLoadingRecentAppsData ? (
            <Loader displayInline />
          ) : (
            recentAppsData?.apps
              .slice(0, 4)
              .map(a => <TopAppItem key={a.id} app={a} />)
          )}
        </TopAppsList>
      </TopAppsColumn>
      <TopAppsColumn>
        <SectionTitle>Top Featured Apps</SectionTitle>
        <TopAppsList>
          {isLoadingFeaturedAppsData ? (
            <Loader displayInline />
          ) : (
            featuredAppsData?.apps
              .slice(0, 4)
              .map(a => <TopAppItem key={a.id} app={a} />)
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
    <PublicLayout>
      <NavigationBar user={user} title="Overview" />
      <PageContainerMargin>
        <PageRow>
          <PageMainBody>
            <TopApps />
            <ChallengesBanner />
            <ChallengesOverviewList />
            <ExpertSection>
              <SectionTitle>Expert Highlight</SectionTitle>
              {expertsData?.experts[0] && (expertsIsLoading ? (
                <Loader displayInline />
              ) : (
                <ExpertListItem expert={expertsData.experts[0]} />
              ))}
            </ExpertSection>
          </PageMainBody>
          <RightSide>
            <GetStarted user={user} />
            <RightSideItem>
              <SectionTitle>Latest News</SectionTitle>
              <OverviewNewsList pick={3} />
              <Hr />
              <Link to="/news">View All News</Link>
              <Hr />
              <Link to="/news?type=publication">View All Publications</Link>
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
      <CommunityParticipants>
        <SectionTitle>COMMUNITY PARTICIPANTS</SectionTitle>
        <ParticipantOrgsList />
      </CommunityParticipants>

      <PageMainBody>
        <InfoRow>
          <ButtonSolidBlue as={Link} to="/docs">
            Learn more about precisionFDA
          </ButtonSolidBlue>
          <a href="mailto:precisionfda@fda.hhs.gov">Feedback</a>
        </InfoRow>
      </PageMainBody>

      <PFDATeamSection>
        <SectionTitle>PRECISIONFDA TEAM</SectionTitle>
        <div>
          <ParticipantPersonsList />
        </div>
      </PFDATeamSection>
    </PublicLayout>
  )
}
