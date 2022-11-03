import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns-tz'
import enUS from 'date-fns/locale/en-US'
import { Challenge } from '../types'
import {
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
  StyledChallengeDetailsBanner,
} from './styles'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'
import NavigationBar from '../../../views/components/NavigationBar/NavigationBar'
import { IUser } from '../../../types/user'

export const ChallengeDetailsBanner = ({
  challenge,
  user,
}: {
  challenge: Challenge,
  user?: IUser
}) => {
  const timeStatus = getTimeStatus(challenge.start_at, challenge.end_at)
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

  // N.B. it's not enough to specify timeZone to date-fns-tz's format function, as it also
  //      depends on the locale
  //      See https://stackoverflow.com/questions/65416339/how-to-detect-timezone-abbreviation-using-date-fns-tz
  const userTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <NavigationBar user={user}>
      <StyledChallengeDetailsBanner>
        <LeftColumn>
          <div>
            <Link to={{ pathname: '/challenges' }} className="backToChallenges">
              &larr; Back to All Challenges
            </Link>
            <div style={{ marginTop: '20px' }}>
              <ChallengeStateLabel timeStatus={timeStatus}>
                {stateLabel}
              </ChallengeStateLabel>
            </div>
            <ChallengeName>{challenge.name}</ChallengeName>
            <ChallengeDescription>{challenge.description}</ChallengeDescription>
          </div>
          <ChallengeDateArea>
            <div>
              <ChallengeDateLabel>Starts</ChallengeDateLabel>
              <ChallengeDate timeStatus={timeStatus}>
                {format(challenge.start_at, 'MM/dd/yyyy HH:mm:ss z', {
                  timeZone: userTimeZone,
                  locale: enUS,
                })}
              </ChallengeDate>
            </div>
            <div>
              <ChallengeDateLabel>Ends</ChallengeDateLabel>
              <ChallengeDate timeStatus={timeStatus}>
                {format(challenge.end_at, 'MM/dd/yyyy HH:mm:ss z', {
                  timeZone: userTimeZone,
                  locale: enUS,
                })}
              </ChallengeDate>
            </div>
            <ChallengeDateRemaining>
              {getChallengeTimeRemaining({
                start_at: challenge.start_at,
                end_at: challenge.end_at,
              })}
            </ChallengeDateRemaining>
          </ChallengeDateArea>
        </LeftColumn>
        <RightColumn>
          <ChallengeThumbnail
            src={challenge.card_image_url}
            alt={`${challenge.name} thumbnail`}
          />
        </RightColumn>
      </StyledChallengeDetailsBanner>
    </NavigationBar>
  )
}
