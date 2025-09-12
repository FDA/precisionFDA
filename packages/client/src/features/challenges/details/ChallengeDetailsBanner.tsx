import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns-tz'
import { enUS } from 'date-fns/locale'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button, OutlineButton } from '../../../components/Button'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { PageContainer, pagePadding } from '../../../components/Page/styles'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { CogsIcon } from '../../../components/icons/Cogs'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { PencilIcon } from '../../../components/icons/PencilIcon'
import { IUser } from '../../../types/user'
import { Challenge } from '../types'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'
import {
  CallToActionButton,
  ChallengeDate,
  ChallengeDateArea,
  ChallengeDateLabel,
  ChallengeDateRemaining,
  ChallengeDescription,
  ChallengeName,
  ChallengeStateLabel,
  ChallengeThumbnail,
  LeftColumn,
  RightColumn,
  StartEnd,
  StyledChallengeDetailsBanner,
} from './styles'

const ChallengeActionRow = styled(PageContainer)`
  ${pagePadding}
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
`
const ChallengeActionCol = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`
const ChallengeActionColLeft = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`
const StyledOutlineButton = styled(OutlineButton)`
  border-color: white;
  &:hover {
    color: inherit;
  }
`

export const ChallengeDetailsBanner = ({ challenge, user }: { challenge: Challenge; user?: IUser }) => {
  const isLoggedIn = !!user?.id
  const timeStatus = getTimeStatus(challenge.startAt, challenge.endAt)
  let stateLabel = 'Previous precisionFDA Challenge'
  switch (timeStatus) {
    case 'upcoming':
      stateLabel = 'Upcoming precisionFDA Challenge'
      break
    case 'current':
      stateLabel = 'Current precisionFDA Challenge'
      break
    default:
      break
  }
  const userCanSubmitEntry = isLoggedIn && challenge.follows && timeStatus === 'current' && challenge.status === 'open'
  const userCanJoin = isLoggedIn && !challenge.follows && timeStatus === 'current' && challenge.status === 'open'

  const hasJoined = challenge.follows

  const challengePreRegistration = challenge.status === 'pre-registration'

  const onClickPreRegistrationButton = () => {
    if (challenge.preRegistrationUrl) {
      if (window) {
        window.open(challenge.preRegistrationUrl || '#', '_blank')!.focus()
      }
    }
  }

  const handleJoinChallenge = () => {
    if (challenge.follows) {
      return
    }
    // this.props.history.push(`/challenges/${challengeId}/join`)
    window.location.assign(`/challenges/${challenge.id}/join`)
  }

  // N.B. it's not enough to specify timeZone to date-fns-tz's format function, as it also
  //      depends on the locale
  //      See https://stackoverflow.com/questions/65416339/how-to-detect-timezone-abbreviation-using-date-fns-tz
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone

  const challengeAction = () => {
    if (challengePreRegistration) {
      return <CallToActionButton onClick={onClickPreRegistrationButton}>Sign Up for Pre-Registration</CallToActionButton>
    }

    if (timeStatus === 'ended') {
      return null
    }

    return (
      <div>
        {hasJoined && <div>You have joined this challenge</div>}
        {userCanJoin && !hasJoined && (
          <div>
            <Button data-variant="primary" disabled={!userCanJoin} onClick={handleJoinChallenge}>
              Join This Challenge
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <NavigationBar user={user}>
      <StyledChallengeDetailsBanner>
        <LeftColumn>
          <div>
            <Link to={{ pathname: '/challenges' }} className="backToChallenges">
              <ArrowLeftIcon /> Back to All Challenges
            </Link>
            <ChallengeName>{challenge.name}</ChallengeName>
            <ChallengeDescription>{challenge.description}</ChallengeDescription>
          </div>
          <ChallengeStateLabel $timeStatus={timeStatus}>{stateLabel}</ChallengeStateLabel>
          <ChallengeDateArea>
            <StartEnd>
              <ChallengeDateLabel>Starts</ChallengeDateLabel>
              <ChallengeDate $timeStatus={timeStatus}>
                {format(new TZDate(challenge.startAt, userTimeZone), 'MM/dd/yyyy HH:mm:ss z', { locale: enUS })}
              </ChallengeDate>

              <ChallengeDateLabel>Ends</ChallengeDateLabel>
              <ChallengeDate $timeStatus={timeStatus}>
                {format(new TZDate(challenge.endAt, userTimeZone), 'MM/dd/yyyy HH:mm:ss z', { locale: enUS })}
              </ChallengeDate>
            </StartEnd>
            <ChallengeDateRemaining>
              {getChallengeTimeRemaining({
                startAt: challenge.startAt,
                endAt: challenge.endAt,
              })}
            </ChallengeDateRemaining>
          </ChallengeDateArea>
        </LeftColumn>
        <RightColumn>
          <ChallengeThumbnail src={challenge.cardImageUrl} alt={`${challenge.name} thumbnail`} />
        </RightColumn>
      </StyledChallengeDetailsBanner>
      <ChallengeActionRow>
        <ChallengeActionColLeft>
          {challengeAction()}
          {userCanSubmitEntry && (
            <Button
              data-turbolinks="false"
              data-variant="primary"
              as="a"
              style={{ marginTop: '12px' }}
              href={`/challenges/${challenge.id}/submissions/new?app_dxid=${challenge.appUid}`}
            >
              Submit Challenge Entry
            </Button>
          )}
        </ChallengeActionColLeft>
        <ChallengeActionCol>
          {user?.can_create_challenges && (
            <>
              {challenge?.meta ? (
                <StyledOutlineButton as="a" href={`/challenges/${challenge.id}/editor`}>
                  <PencilIcon /> Challenge Content
                </StyledOutlineButton>
              ) : (
                <StyledOutlineButton as={Link} to={`/challenges/${challenge.id}/content`}>
                  <PencilIcon /> Challenge Content
                </StyledOutlineButton>
              )}
              <StyledOutlineButton as={Link} to={`/challenges/${challenge.id}/settings`}>
                <CogsIcon /> Settings
              </StyledOutlineButton>
              <StyledOutlineButton as={Link} to={`/spaces/${challenge.spaceId}`}>
                <ObjectGroupIcon /> Challenge Space
              </StyledOutlineButton>
            </>
          )}
        </ChallengeActionCol>
      </ChallengeActionRow>
    </NavigationBar>
  )
}
