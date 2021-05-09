import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { PFDALogoLight } from '../../../components/NavigationBar/PFDALogo'
import NewsList from '../../../components/News/NewsList'
import { NewsListItemSmall } from '../../../components/News/NewsListItem'
import ChallengesBanner from '../../../components/Challenges/ChallengesBanner'
import ChallengesList from '../../../components/Challenges/ChallengesList'
import { ChallengesListItemLanding, IChallengeListItem } from '../../../components/Challenges/ChallengesListItem'
import { ExpertsListItemBlogEntry, ExpertsListItemBlogEntrySmall } from '../../../components/Experts/ExpertsListItem'
import ExpertsList from '../../../components/Experts/ExpertsList'
import ParticipantOrgsList from '../../../components/Participants/ParticipantOrgsList'
import ParticipantPersonsList from '../../../components/Participants/ParticipantPersonsList'
import { fetchNews } from '../../../../actions/news'
import { fetchExperts } from '../../../../actions/experts'
import { fetchChallenges } from '../../../../actions/challenges'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { queryRecentApps, queryFeaturedApps } from '../../../../api/apps'
import { TopAppsList } from '../../../components/Apps/TopAppsList'
import { CHALLENGE_TIME_STATUS, MAILING_LIST } from '../../../../constants'
import { theme } from '../../../../styles/theme'
import { commonStyles } from '../../../../styles/commonStyles'
import { ViewAllButton } from '../../../components/Controls/ViewAllButton'
import { SectionHeading } from '../../../components/Controls/SectionHeading'
import ExternalLink from '../../../components/Controls/ExternalLink'


const pFDATagLine = 'A secure, collaborative, high-performance computing platform that builds a community of experts around the analysis of biological datasets in order to advance precision medicine.'

const challengeListFilter = (items: IChallengeListItem[]) => {
  const firstCompletedChallenge = items.find((item) => item.timeStatus == CHALLENGE_TIME_STATUS.ENDED)
  if (!firstCompletedChallenge) {
    return items
  }
  const indexOfFirstUpcoming = items.indexOf(firstCompletedChallenge)
  const noCurrentOrUpcomingChallenges = (indexOfFirstUpcoming == 0)
  const numberOfItemsToShow = noCurrentOrUpcomingChallenges ? 1 : indexOfFirstUpcoming
  return items.slice(0, numberOfItemsToShow)
}


const LandingPageLayout = styled.div`
  ${commonStyles.mainContainerTwoColumns};
`

const LandingPageLayout_LeftColumn = styled.div`
  ${commonStyles.mainContainerTwoColumns_LeftColumn};
`

const LandingPageLayout_RightColumn = styled.div`
  ${commonStyles.mainContainerTwoColumns_RightColumn};

  p {
    padding-top: 8px;
  }
`

const LandingPageRightColumnHr = styled.hr`
  border-color: ${theme.colors.textMediumGrey};
  margin: 16px 0 0 0;
`

const StyledViewAllButton  = styled(ViewAllButton)`
  margin-top: 12px;
`

const SmallLeftMarginContainer = styled.div`
  margin-left: ${theme.sizing.smallColumnWidth};
`
const LargeLeftMarginContainer = styled.div`
  margin-left: ${theme.values.largeColumnWidth + theme.values.paddingMainContentHorizontal}px;
`

const CommunityParticipants = styled.div`
  background-color: ${theme.colors.subtleBlue};
  margin: ${theme.padding.mainContentVertical} 0;
  padding: ${theme.values.paddingMainContentVertical/2}px 0;
  text-align: center;
`

const PrecisionFDATeamHeading = styled.div`
  ${commonStyles.sectionHeading};
  margin: 0 auto;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.textDarkGrey};
  width: 256px;
  text-align: center;
`

const PrecisionFDATeam = styled.div`
  overflow: scroll;
`

const NavigationBarPublicLandingTitle = styled.div`
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: ${theme.padding.mainContentVertical};

  h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 400;
    margin: 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 400;
    line-height: 133%;
    padding-bottom: 0px;
    margin-bottom: 0px;
  }
`


const TopAppsContainer = styled.div`
  display: flex;
`

const TopAppsColumn = styled.div`
  flex-grow: 1;
  flex-basis: 0;
`

const GettingStarted = styled.div`
  background-color: ${theme.colors.backgroundLightGray};
  margin: -6px -16px -12px -16px;
  padding: 6px 16px 12px 16px;

  a {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.5em;
  }
`

const GettingStartedHr = styled.hr`
  margin: 12px 0px !important;
  border-color: ${theme.colors.highlightBlue} !important;
`

const GettingStartedHeading = styled(SectionHeading)`
  margin-bottom: 8px;
`

const MediumGreyHr = styled.hr`
  border-color: ${theme.colors.textMediumGrey};
`


const LandingPage : FunctionComponent = () => {

  const renderPublic = () => {
    return (
      <PublicLayout>
        <NavigationBar>
          <div className="navigation-bar-banner">
            <NavigationBarPublicLandingTitle>
              <PFDALogoLight className="pfda-navbar-logo" />
              <h2>{pFDATagLine}</h2>
            </NavigationBarPublicLandingTitle>
            <div className="navigation-bar-social-media-buttons">
              <a href="mailto:precisionfda@fda.hhs.gov" className="fa fa-envelope"></a>
              <ExternalLink to="https://twitter.com/precisionfda" className="fa fa-twitter"></ExternalLink>
              <ExternalLink to="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin"></ExternalLink>
            </div>
          </div>
        </NavigationBar>

        <LandingPageLayout>
          <LandingPageLayout_LeftColumn>
            <SmallLeftMarginContainer>
              <SectionHeading>EXPERT HIGHLIGHT</SectionHeading>
            </SmallLeftMarginContainer>
            <ExpertsList listItemComponent={ExpertsListItemBlogEntry} filter={(items) => { return items.slice(0, 1) }} allowPagination={false} />
            <div style={{ marginTop: '12px' }}>
              <ChallengesBanner />
            </div>
            <div style={{ marginTop: '12px' }}>
              <ChallengesList listItemComponent={ChallengesListItemLanding} filter={challengeListFilter} allowPagination={false} />
            </div>
            <SmallLeftMarginContainer>
              <StyledViewAllButton title="View All Challenges" url="/challenges" />
            </SmallLeftMarginContainer>
          </LandingPageLayout_LeftColumn>
          <LandingPageLayout_RightColumn>
            <SectionHeading>RECENT EXPERT BLOGS</SectionHeading>
            <div style={{ marginTop: '12px' }}>
            <ExpertsList listItemComponent={ExpertsListItemBlogEntrySmall} filter={(items) => { return items.slice(1, 2) }} allowPagination={false} />
            </div>
            <StyledViewAllButton title="View All Expert Blogs" url="/experts" />
            <LandingPageRightColumnHr style={{ marginTop: '40px' }} />
            <SectionHeading>LATEST NEWS</SectionHeading>
            <NewsList listItemComponent={NewsListItemSmall} filter={(items) => { return items.slice(0, 3) }} allowPagination={false} />
            <StyledViewAllButton title="View All News" url="/news" />
          </LandingPageLayout_RightColumn>
        </LandingPageLayout>

        <CommunityParticipants>
          <SectionHeading>COMMUNITY PARTICIPANTS</SectionHeading>
          <ParticipantOrgsList />
        </CommunityParticipants>

        <div style={{ textAlign: 'center', margin: '32px' }}>
          <a className="btn accessible-btn-primary btn-md" href="/docs">Learn more about precisionFDA</a>
          <a className="btn accessible-btn-link btn-md" href="mailto:precisionfda@fda.hhs.gov">Feedback</a>
        </div>

        <PrecisionFDATeamHeading>PRECISIONFDA TEAM</PrecisionFDATeamHeading>
        <PrecisionFDATeam>
          <ParticipantPersonsList />
        </PrecisionFDATeam>

      </PublicLayout>
    )
  }

  const renderLoggedIn = (user: any) => {
    const guestWelcomeTitle = 'Welcome to precisionFDA'

    return (
      <PublicLayout>
        {user.is_guest ? 
          <NavigationBar user={user}>
            <div className="navigation-bar-banner">
              <NavigationBarPublicLandingTitle>
                <h1>{guestWelcomeTitle}</h1>
                <h2>{pFDATagLine}</h2>
              </NavigationBarPublicLandingTitle>
              <div className="navigation-bar-social-media-buttons">
                <a href="mailto:precisionfda@fda.hhs.gov" className="fa fa-envelope"></a>
                <ExternalLink to="https://twitter.com/precisionfda" className="fa fa-twitter"></ExternalLink>
                <ExternalLink to="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin"></ExternalLink>
              </div>
            </div>
          </NavigationBar>
          :
          <NavigationBar user={user} />
        }

        <LandingPageLayout>
          <LandingPageLayout_LeftColumn>
            <TopAppsContainer>
              <TopAppsColumn>
                <SectionHeading>MOST RECENT APPS</SectionHeading>
                <TopAppsList query={queryRecentApps} />
              </TopAppsColumn>
              <TopAppsColumn>
                <SectionHeading>TOP FEATURED APPS</SectionHeading>
                <TopAppsList query={queryFeaturedApps} />
              </TopAppsColumn>
              {/* <TopAppsColumn>
                <SectionHeading>TOP REVIEWER APPS</SectionHeading>
                <TopAppsList query={queryTopReviewerApps} />
              </TopAppsColumn> */}
            </TopAppsContainer>
            <div style={{ marginTop: '12px' }}>
              <ChallengesBanner />
            </div>
            <div style={{ marginTop: '12px' }}>
              <ChallengesList filter={challengeListFilter} allowPagination={false} />
            </div>
            <LargeLeftMarginContainer>
              <StyledViewAllButton title="View All Challenges" url="/challenges" />
            </LargeLeftMarginContainer>
            <MediumGreyHr />
            <SectionHeading>EXPERT HIGHLIGHT</SectionHeading>
            <ExpertsList listItemComponent={ExpertsListItemBlogEntry} filter={(items) => { return items.slice(0, 1) }} allowPagination={false} />
            <SmallLeftMarginContainer>
              <StyledViewAllButton title="View All Expert Blogs" url="/experts" />
            </SmallLeftMarginContainer>
          </LandingPageLayout_LeftColumn>
          <LandingPageLayout_RightColumn>
            <GettingStarted>
              <GettingStartedHeading>GETTING STARTED</GettingStartedHeading>
              <a href={'/docs'}>For New Users</a>
              {user.can_see_spaces && 
              <a href={'/docs/spaces'}>For Reviewers</a>
              }
              <GettingStartedHr />
              <a href={'/docs'}>Introduction to precisionFDA</a>
              <a href={'/docs/files'}>Uploading Files &amp; Data</a>
              <a href={'/docs/apps'}>Running Apps</a>
              {user.can_see_spaces && 
              <a href={'/docs/spaces'}>Review Spaces: Step by Step</a>
              }
              <GettingStartedHr />
              <a href={MAILING_LIST} target="_blank">precisionFDA Mailing List</a>
            </GettingStarted>
            <div style={{ height: '32px' }}></div>
            <LandingPageRightColumnHr />
            <SectionHeading>LATEST NEWS</SectionHeading>
            <NewsList listItemComponent={NewsListItemSmall} filter={(items) => { return items.slice(0, 8) }} allowPagination={false} />
            <StyledViewAllButton title="View All News" url="/news" />
          </LandingPageLayout_RightColumn>
        </LandingPageLayout>
      </PublicLayout>
    )
  }

  const user = useSelector(contextUserSelector)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchNews())
    dispatch(fetchExperts())
    dispatch(fetchChallenges())
  }, [])

  const isLoggedIn = user && Object.keys(user).length > 0
  if (isLoggedIn) {
    return renderLoggedIn(user)
  }
  else {
    return renderPublic()
  }
}

export {
  LandingPage,
}

export default LandingPage
