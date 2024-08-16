import React from 'react'
import { Link } from 'react-router-dom'
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
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from '../../components/NavigationBar/NavigationBar'
import SocialMediaButtons from '../../components/NavigationBar/SocialMediaButtons'
import PublicLayout from '../../layouts/PublicLayout'
import { Tagline } from '../../pages/Tagline'
import { useAuthUser } from '../auth/useAuthUser'
import { ExpertListItem } from '../experts/list/ExpertListItem'
import { useExpertsListQuery } from '../experts/useExpertsListQuery'
import { ChallengesBanner } from './ChallengesBanner'
import ChallengesOverviewList from './ChallengesOverviewList'
import { OverviewExpertsCondensedList } from './OverviewExpertsListCondensed'
import { OverviewNewsList } from './OverviewNewsList'
import { ParticipantOrgsList } from './ParticipantsOrgsList'
import {
  CommunityParticipants,
  ExpertSection,
  Hr,
  InfoRow,
  PageOverviewMainBody,
} from './styles'
import { Button } from '../../components/Button'

export const OverviewPublic = () => {
  usePageMeta({ title: 'precisionFDA - Overview' })
  const user = useAuthUser()
  const { data: expertsData, isLoading: expertsIsLoading } = useExpertsListQuery({})

  return (
    <PublicLayout mainScroll>
      <NavigationBar user={user}>
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle>
              <Tagline />
            </NavigationBarPublicLandingTitle>
            <SocialMediaButtons />
          </NavigationBarBanner>
        </PageContainerMargin>
      </NavigationBar>
      <PageContainerMargin>
        <PageRow>
          <PageOverviewMainBody>
            <ExpertSection>
              <SectionTitle>Expert Highlight</SectionTitle>
              {expertsData?.experts[0] && (expertsIsLoading ? (
                <Loader className="inline" />
              ) : expertsData?.experts[0] && <ExpertListItem expert={expertsData.experts[0]} />)}
            </ExpertSection>

            <ChallengesBanner />
            <ChallengesOverviewList />
          </PageOverviewMainBody>
          <RightSide>
            <RightSideItem>
              <SectionTitle>RECENT EXPERT BLOGS</SectionTitle>
              <OverviewExpertsCondensedList pick={3} />
              <Hr />
              <Link to="/experts">View All Expert Blogs</Link>
            </RightSideItem>
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
          <Button data-variant="primary" as={Link} to="/docs">
            Learn more about precisionFDA
          </Button>
          <a href="mailto:precisionfda@fda.hhs.gov">Feedback</a>
        </InfoRow>
      </PageMainBody>
    </PublicLayout>
  )
}
