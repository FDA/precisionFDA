/* eslint-disable no-nested-ternary */
import classNames from 'classnames'
import React, { useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { MainBanner } from '../../../components/Banner'
import { ButtonSolidBlue } from '../../../components/Button/index'
import { Loader } from '../../../components/Loader'
import {
  Container,
  ListItem,
  PageMainBody,
  PageRow,
  RightList,
  RightSide,
  RightSideItem,
} from '../../../components/Public/styles'
import { cleanObject } from '../../../utils/object'
import ChallengeMyEntriesTable from '../../../views/components/Challenges/ChallengeMyEntriesTable'
import ChallengeSubmissionsTable from '../../../views/components/Challenges/ChallengeSubmissionsTable'
import GuestRestrictedLink from '../../../views/components/Controls/GuestRestrictedLink'
import PublicNavbar from '../../../views/components/NavigationBar/PublicNavbar'
import UserContent from '../../../views/components/UserContent'
import PublicLayout from '../../../views/layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { Challenge } from '../types'
import { useChallengeDetailsQuery } from '../useChallengeDetailsQuery'
import { getTimeStatus } from '../util'
import { ChallengeDetailsBanner } from './ChallengeDetailsBanner'
import { CallToActionButton, StyledTabs } from './styles'

export const ChallengeDetails = ({
  challenge,
  isOld = false,
  canCreate = false,
  isLoggedIn = false,
  isGuest = false,
  oldChallenge,
  page,
}: {
  challenge: Challenge
  oldChallenge?: { regions: { intro: string; results: string } }
  isOld?: boolean
  canCreate?: boolean
  isGuest?: boolean
  isLoggedIn?: boolean
  page?: string
}) => {
  const [tabIndex, setTabIndex] = useState(-1)
  const history = useHistory()

  const handleJoinChallenge = () => {
    if (challenge.is_followed) {
      return
    }
    // this.props.history.push(`/challenges/${challengeId}/join`)
    window.location.assign(`/challenges/${challenge.id}/join`)
  }

  const timeStatus = getTimeStatus(challenge.start_at, challenge.end_at)

  const challengePreRegistration = challenge.status === 'pre-registration'
  const challengeSetupOrPreRegistration =
    challenge.status === 'setup' || challengePreRegistration

  const userCanJoin =
    isLoggedIn &&
    !challenge.is_followed &&
    timeStatus === 'current' &&
    challenge.status === 'open'
  const userCanSubmitEntry =
    isLoggedIn &&
    challenge.is_followed &&
    timeStatus === 'current' &&
    challenge.status === 'open'
  const userIsChallengeAdmin = isLoggedIn && canCreate

  const userCanSeePreRegistration =
    (challengePreRegistration ||
      (userIsChallengeAdmin && challengeSetupOrPreRegistration)) &&
    !isOld

  // Introduction is visible to:
  //  - everyone when a challenge is not in pre-registration phase
  //  - challenge admins in all phases of a challenge
  const userCanSeeIntroduction =
    !challengePreRegistration || userIsChallengeAdmin

  // Submissions are visible to:
  //  - any logged in users when challenge is not in setup or pre-registration phase
  const userCanSeeSubmissions = isLoggedIn && !challengeSetupOrPreRegistration

  // Results are visible to:
  //  - challenge admins
  //  - everyone when results are announced or challenge is archived
  const userCanSeeResults =
    userIsChallengeAdmin ||
    challenge.status === 'result_announced' ||
    challenge.status === 'archived'

  const tabs = []

  const regions: Record<string, string | undefined> = {
    preRegistration:
      (challenge?.meta?.regions &&
        challenge?.meta?.regions['pre-registration']) ||
      undefined,
    intro: challenge?.meta?.regions?.intro || undefined,
    resultsDetails:
      (challenge?.meta?.regions &&
        challenge?.meta?.regions['results-details']) ||
      undefined,
    results:
      (challenge?.meta?.regions && challenge?.meta?.regions.results) ||
      undefined,
  }

  if (oldChallenge) {
    regions.intro = oldChallenge?.regions?.intro
    regions.results = oldChallenge?.regions?.results
  }

  if (userCanSeePreRegistration) {
    const preRegistrationContent = regions?.preRegistration
    if (preRegistrationContent) {
      const userContent = new UserContent(preRegistrationContent, isLoggedIn)

      tabs.push({
        title: 'PRE-REGISTRATION',
        subroute: '',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }
  }

  if (userCanSeeIntroduction) {
    const introductionContent = regions?.intro
    if (introductionContent) {
      const userContent = new UserContent(introductionContent, isLoggedIn)
      tabs.push({
        title: 'INTRODUCTION',
        subroute: '',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }
  }

  if (userCanSeeSubmissions) {
    tabs.push({
      title: 'SUBMISSIONS',
      subroute: '/submissions',
      content: (
        <ChallengeSubmissionsTable
          challengeId={challenge.id}
          isSpaceMember={challenge.is_space_member}
        />
      ),
    })
    tabs.push({
      title: 'MY ENTRIES',
      subroute: '/my_entries',
      content: (
        <ChallengeMyEntriesTable
          challengeId={challenge.id}
          isSpaceMember={challenge.is_space_member}
        />
      ),
    })
  }

  if (userCanSeeResults) {
    const resultsContent = `${regions?.results || ''}${
      regions?.resultsDetails || ''
    }`

    if (resultsContent) {
      const userContent = new UserContent(resultsContent, isLoggedIn)
      tabs.push({
        title: 'RESULTS',
        subroute: '/results',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }
  }

  const isNoInfoProvided = Object.keys(cleanObject(regions)).length === 0

  const tabSubroutes = tabs.map(x => x['subroute'])

  if (tabIndex < 0) {
    const pageRoute = `/${page}`
    setTabIndex(
      tabSubroutes.includes(pageRoute) ? tabSubroutes.indexOf(pageRoute) : 0,
    )
  }

  const currentTab = tabs[tabIndex]

  const onSelectTab = (index: number) => {
    const url = `/challenges/${challenge.id}${tabSubroutes[index]}`
    history.push(url)
    setTabIndex(index)
  }

  const onClickPreRegistrationButton = () => {
    if (challenge.pre_registration_url) {
      window?.open(challenge.pre_registration_url, '_blank').focus()
    }
  }

  const joinChallengeButtonTitle =
    timeStatus === 'ended'
      ? 'Challenge Ended'
      : challenge.is_followed
      ? 'You Have Joined This Challenge'
      : isLoggedIn
      ? 'Join Challenge'
      : 'Log In to Join Challenge'

  const joinChallengeButtonClasses = classNames(
    {
      disabled: !userCanJoin,
    },
    'btn',
    'btn-primary',
    'challenge-join-button',
  )

  document.title = `${challenge.name} - PrecisionFDA Challenge`

  return (
    <>
      <Container>
        <PageRow>
          <PageMainBody>
            {isNoInfoProvided && (
              <div>
                No information about this challenge has been provided yet.
              </div>
            )}
            <StyledTabs>
              <Tabs defaultIndex={tabIndex} onSelect={onSelectTab}>
                <TabList className="challenge-details-tabs__tab-list">
                  {tabs.map(tab => (
                    <Tab
                      key={tab.title}
                      className="challenge-details-tabs__tab"
                      selectedClassName="challenge-details-tabs__tab--selected"
                    >
                      {tab.title}
                    </Tab>
                  ))}
                </TabList>

                {tabs.map(tab => (
                  <TabPanel key={tab.title}>{tab.content}</TabPanel>
                ))}
              </Tabs>
            </StyledTabs>
          </PageMainBody>
          {!isOld && (
            <RightSide>
              {challengePreRegistration ? (
                <RightSideItem>
                  <CallToActionButton onClick={onClickPreRegistrationButton}>
                    Sign Up for Pre-Registration
                  </CallToActionButton>
                </RightSideItem>
              ) : isGuest ? (
                <RightSideItem>
                  <GuestRestrictedLink
                    to={`/challenges/${challenge.id}/join`}
                    className={joinChallengeButtonClasses}
                  >
                    Join Challenge
                  </GuestRestrictedLink>
                </RightSideItem>
              ) : (
                <RightSideItem>
                  <ButtonSolidBlue
                    className={joinChallengeButtonClasses}
                    onClick={() => {
                      if (userCanJoin) {
                        handleJoinChallenge()
                      }
                    }}
                  >
                    {joinChallengeButtonTitle}
                  </ButtonSolidBlue>
                </RightSideItem>
              )}

              {userCanSubmitEntry && (
                <RightSideItem>
                  <a
                    className="btn btn-primary btn-block"
                    style={{ marginTop: '12px' }}
                    href={challenge.links.new_submission}
                  >
                    Submit Challenge Entry
                  </a>
                </RightSideItem>
              )}
              {currentTab?.outline?.props.anchors.length > 0 && (
                <RightSideItem>{currentTab.outline}</RightSideItem>
              )}

              {challenge.can_edit && (
                <RightSideItem>
                  <RightList>
                    <ListItem as={Link} to={`/challenges/${challenge.id}/edit`}>
                      <span className="fa fa-cog fa-fw" /> Settings
                    </ListItem>
                    <ListItem
                      as="a"
                      href={`/challenges/${challenge.id}/editor`}
                      data-no-turbolink="true"
                    >
                      <span className="fa fa-file-code-o fa-fw" /> Edit Page
                    </ListItem>
                  </RightList>
                </RightSideItem>
              )}
            </RightSide>
          )}
        </PageRow>
      </Container>
    </>
  )
}

export const ChallengeDetailsPage = () => {
  const { challengeId, page } = useParams<{
    challengeId: string
    page?: string
  }>()

  const user = useAuthUser()
  const { data, isLoading } = useChallengeDetailsQuery(challengeId)
  const isUserAvailable = !user?.id
  return (
    <PublicLayout>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {isUserAvailable ? (
            <MainBanner>
              <PublicNavbar showLogo />
              <ChallengeDetailsBanner challenge={data?.challenge} />
            </MainBanner>
          ) : (
            <MainBanner>
              <ChallengeDetailsBanner challenge={data?.challenge} />
            </MainBanner>
          )}
          <ChallengeDetails
            canCreate={user?.can_create_challenges}
            isLoggedIn={!!user?.id}
            isGuest={user?.is_guest}
            challenge={data?.challenge}
            page={page}
          />
        </>
      )}
    </PublicLayout>
  )
}
