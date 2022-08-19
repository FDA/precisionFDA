import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar, { NavigationBarBanner, NavigationBarPublicLandingTitle } from '../../../components/NavigationBar/NavigationBar'
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
import { breakPoints, padding, theme } from '../../../../styles/theme'
import { commonStyles } from '../../../../styles/commonStyles'
import { ViewAllButton } from '../../../components/Controls/ViewAllButton'
import { SectionHeading } from '../../../components/Controls/SectionHeading'
import ExternalLink from '../../../components/Controls/ExternalLink'
import SocialMediaButtons from '../../../components/NavigationBar/SocialMediaButtons'
import { PageContainer } from '../../../../components/Page/styles'
import { Tagline } from '../Tagline'


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


const LandingPageLayout = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  padding: 24px 0px;

  @media(min-width: ${breakPoints.large}px) {
    flex-direction: row;
  }
`

const LeftColumn = styled.div`
  flex-grow: 1;
  margin-bottom: ${padding.contentMargin};
  @media(min-width: ${breakPoints.large}px) {
    padding-right: 16px;
  }
`

// LeftColumnInset is used as a container for all components other than ChallengesBanner
// which is to extend to the edge of the parent container
const LeftColumnInset = styled.div`
  margin: 0px ${padding.mainContentHorizontalHalf};

  @media(min-width: ${breakPoints.small}px) {
    margin: 0px ${padding.mainContentHorizontal};
  }
`

const RightColumn = styled.div`
  p {
    padding-top: 8px;
  }

  @media(min-width: ${breakPoints.medium}px) {
    min-width: ${theme.sizing.largeColumnWidth};
    max-width: ${theme.sizing.largeColumnWidth};
    margin-right: ${padding.mainContentHorizontal};
  }
`

const RightColumnInset = styled.div`
  margin: 0px ${padding.mainContentHorizontalHalf};
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

const LandingPageRightColumnHr = styled.hr`
  border-color: ${theme.colors.textMediumGrey};
  margin: 32px 0 0 0;
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
  padding: ${padding.mainContentHorizontalHalf};
  padding-top: ${padding.contentMarginHalf};

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

export const StyledViewAllButton  = styled(ViewAllButton)`
  margin-top: 12px;
`


const LandingPage : FunctionComponent = () => {

  const renderPublic = () => {
    return (
      <PublicLayout>
        <NavigationBar>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle>
              <PFDALogoLight />
              <Tagline />
            </NavigationBarPublicLandingTitle>
            <SocialMediaButtons showText={false} />
          </NavigationBarBanner>
        </NavigationBar>

        <LandingPageLayout>
          <LeftColumn>
            <LeftColumnInset>
              <SmallLeftMarginContainer>
                <SectionHeading>EXPERT HIGHLIGHT</SectionHeading>
              </SmallLeftMarginContainer>
              <ExpertsList listItemComponent={ExpertsListItemBlogEntry} filter={(items) => { return items.slice(0, 1) }} allowPagination={false} />
            </LeftColumnInset>
            <ChallengesBanner />
            <LeftColumnInset>
              <ChallengesList listItemComponent={ChallengesListItemLanding} filter={challengeListFilter} allowPagination={false} />
              <SmallLeftMarginContainer>
                <StyledViewAllButton title="View All Challenges" url="/challenges" />
              </SmallLeftMarginContainer>
            </LeftColumnInset>
          </LeftColumn>
          <RightColumn>
            <RightColumnInset>
              <SectionHeading>RECENT EXPERT BLOGS</SectionHeading>
              <ExpertsList listItemComponent={ExpertsListItemBlogEntrySmall} filter={(items) => { return items.slice(1, 3) }} allowPagination={false} />
              <StyledViewAllButton title="View All Expert Blogs" url="/experts" />
              <LandingPageRightColumnHr />
              <SectionHeading>LATEST NEWS</SectionHeading>
              <NewsList listItemComponent={NewsListItemSmall} filter={(items) => { return items.slice(0, 3) }} allowPagination={false} />
              <StyledViewAllButton title="View All News" url="/news" />
            </RightColumnInset>
          </RightColumn>
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
            <NavigationBarBanner>
              <NavigationBarPublicLandingTitle>
                <h1>{guestWelcomeTitle}</h1>
                <Tagline />
              </NavigationBarPublicLandingTitle>
              <SocialMediaButtons>
                <a href="mailto:precisionfda@fda.hhs.gov" className="fa fa-envelope"></a>
                <ExternalLink to="https://twitter.com/precisionfda" className="fa fa-twitter"></ExternalLink>
                <ExternalLink to="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin"></ExternalLink>
              </SocialMediaButtons>
            </NavigationBarBanner>
          </NavigationBar>
          :
          <NavigationBar user={user} />
        }

        <LandingPageLayout>
          <LeftColumn>
            <LeftColumnInset>
              <TopAppsContainer>
                <TopAppsColumn>
                  <SectionHeading>MOST RECENT APPS</SectionHeading>
                  <TopAppsList query={queryRecentApps} />
                </TopAppsColumn>
                <TopAppsColumn>
                  <SectionHeading>TOP FEATURED APPS</SectionHeading>
                  <TopAppsList query={queryFeaturedApps} />
                </TopAppsColumn>
              </TopAppsContainer>
            </LeftColumnInset>
            <div style={{ marginTop: '12px' }}>
              <ChallengesBanner />
            </div>
            <LeftColumnInset>
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
            </LeftColumnInset>
          </LeftColumn>
          <RightColumn>
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
            <RightColumnInset>
              <LandingPageRightColumnHr />
              <SectionHeading>LATEST NEWS</SectionHeading>
              <NewsList listItemComponent={NewsListItemSmall} filter={(items) => { return items.slice(0, 8) }} allowPagination={false} />
              <StyledViewAllButton title="View All News" url="/news" />
            </RightColumnInset>
          </RightColumn>
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
