/* eslint-disable no-nested-ternary */
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { ButtonSolidBlue } from '../../../components/Button/index'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import {
  ListItem,
  PageMainBody,
  PageRow,
  RightList,
  RightSide,
  RightSideItem,
} from '../../../components/Public/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { cleanObject } from '../../../utils/object'
import { ChallengeSubmissionsTable } from './ChallengeSubmissionsTable'
import { ChallengeMyEntriesTable } from './ChallengeMyEntriesTable'
import GuestRestrictedLink from '../../../components/Controls/GuestRestrictedLink'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../../layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { Challenge } from '../types'
import { useChallengeDetailsQuery } from '../useChallengeDetailsQuery'
import { getTimeStatus } from '../util'
import { ChallengeDetailsBanner } from './ChallengeDetailsBanner'
import { ChallengeNotFound } from './ChallengeNotFound'
import { CallToActionButton, NoInfo, StyledTabs } from './styles'
import { setTocFromRef, ToC, IToCItem } from '../../markdown/Toc'
import { AddIdsToHeaders } from '../../../components/Markdown/AddIdsToHeaders'

export const ChallengeDetails = ({
  challenge,
  isOld = false,
  canCreate = false,
  isLoggedIn = false,
  isGuest = false,
  oldChallenge,
  page,
  user,
}: {
  challenge: Challenge
  oldChallenge?: { regions: { intro: string; results: string } }
  isOld?: boolean
  canCreate?: boolean
  isGuest?: boolean
  isLoggedIn?: boolean
  page?: string
  user?: any
}) => {
  const history = useHistory()
  usePageMeta({ title: `${challenge.name} - precisionFDA Challenge` })
  const [tabIndex, setTabIndex] = useState(-1)
  const docRef = useRef(null)
  const [toc, setToc] = useState<IToCItem[]>([])
  useEffect(() => {
    setTocFromRef(docRef, setToc)
  }, [docRef, tabIndex])
  
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
      tabs.push({
        title: 'PRE-REGISTRATION',
        subroute: '',
        content: <AddIdsToHeaders docRef={docRef} content={preRegistrationContent} />,
      })
    }
  }

  if (userCanSeeIntroduction) {
    const introductionContent = regions?.intro
    if (introductionContent) {
      tabs.push({
        title: 'INTRODUCTION',
        subroute: '',
        content: <AddIdsToHeaders docRef={docRef} content={introductionContent} />,
      })
    }
  }

  if (userCanSeeSubmissions) {
    tabs.push({
      title: 'SUBMISSIONS',
      subroute: '/submissions',
      content: (
        <ChallengeSubmissionsTable
          user={user}
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
          user={user}  
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
      tabs.push({
        title: 'RESULTS',
        subroute: '/results',
        content: <AddIdsToHeaders docRef={docRef} content={resultsContent} />,
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
    history.replace(url)
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

  // document.title = `${challenge.name} - PrecisionFDA Challenge`

  return (
    <PageContainerMargin>
      <PageRow>
        <PageMainBody>
          {isNoInfoProvided && (
            <NoInfo>
              No information about this challenge has been provided yet.
            </NoInfo>
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
                  data-turbolinks="false"
                >
                  Submit Challenge Entry
                </a>
              </RightSideItem>
            )}

            {toc && toc.length > 0 && <RightSideItem><ToC items={toc} /></RightSideItem>}

            {challenge.can_edit && (
              <RightSideItem>
                <RightList>
                  <ListItem as={Link} to={`/challenges/${challenge.id}/edit`}>
                    <span className="fa fa-cog fa-fw" /> Settings
                  </ListItem>
                  <ListItem
                    as="a"
                    href={`/challenges/${challenge.id}/editor`}
                    data-turbolinks="false"
                  >
                    <span className="fa fa-file-code-o fa-fw" /> Edit Page
                  </ListItem>
                </RightList>
              </RightSideItem>
            )}
          </RightSide>
        )}
      </PageRow>
    </PageContainerMargin>
  )
}

const ChallengeDetailsPage = () => {
  const { challengeId, page } = useParams<{
    challengeId: string
    page?: string
  }>()

  const user = useAuthUser()
  const { data, isLoading, isFetched } = useChallengeDetailsQuery(challengeId)

  if (isFetched && !data) {
    return (
      <PublicLayout>
        <NavigationBar
          user={user}
        />
        <ChallengeNotFound />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {isLoading ? (
        <PageContainerMargin><Loader /></PageContainerMargin>
      ) : (
        <>
          <ChallengeDetailsBanner challenge={data?.challenge} user={user} />
          <ChallengeDetails
            canCreate={user?.can_create_challenges}
            isLoggedIn={!!user?.id}
            isGuest={user?.is_guest}
            challenge={data?.challenge}
            page={page}
            user={user}
          />
        </>
      )}
    </PublicLayout>
  )
}

export default ChallengeDetailsPage
