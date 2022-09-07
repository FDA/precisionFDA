import React from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { format } from 'date-fns-tz'
import enUS from 'date-fns/locale/en-US'
import './style.sass'

import ChallengeTimeRemaining from '../../../../components/Challenges/ChallengeTimeRemaining'
import { CHALLENGE_TIME_STATUS } from '../../../../../constants'
import { IChallenge } from '../../../../../types/challenge'
import { breakPoints, theme } from '../../../../../styles/theme'
import { commonStyles } from '../../../../../styles/commonStyles'
import { PageContainer, pagePadding } from '../../../../../components/Page/styles'


const LeftColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  min-width: 300px;
  max-width: 720px;
  flex: 1 1 auto;
`

const RightColumn = styled.div`
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 320px;
  flex: 1 1 auto;
`

const StyledChallengeDetailsBanner = styled(PageContainer)`
  ${pagePadding}
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;

  @media (min-width: ${breakPoints.medium}px) {
    flex-direction: row;
  }
`

const ChallengeName = styled.h1`
  ${commonStyles.bannerTitle};
  margin: ${theme.padding.contentMargin} 0px;
  color: ${theme.colors.textWhite};
`

const ChallengeDescription = styled.p`
  font-size: ${theme.fontSize.body};
  font-weight: ${theme.fontWeight.regular};
  color: ${theme.colors.textWhite};
  margin-top: ${theme.padding.contentMargin};
`

const ChallengeThumbnail = styled.img`
  width: ${theme.sizing.thumbnailWidth};
  height: ${theme.sizing.thumbnailHeight};
  object-fit: contain;
  overflow: hidden;
  box-shadow: 0px 0px 16px #000;
`

interface IChallengeTimeStatusControl {
  timeStatus: string,
}

const ChallengeStateLabel = styled.span<IChallengeTimeStatusControl>`
  ${commonStyles.sectionHeading};
  text-transform: uppercase;
  padding: 3px 0px;
  color: ${theme.colors.textWhite};

  ${({ timeStatus }) => {
    if (timeStatus === CHALLENGE_TIME_STATUS.UPCOMING) {
      return css`
        color: ${theme.colors.highlightYellow};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.highlightYellow};
      `
    }
    else if (timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
      return css`
        color: ${theme.colors.highlightGreen};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.highlightGreen};
      `
    }
    else if (timeStatus === CHALLENGE_TIME_STATUS.ENDED) {
      return css`
        color: ${theme.colors.stateLabelGrey};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.stateLabelGrey};
      `
    }
  }}
`

const ChallengeDateArea = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 12px;
  color: white;
`

const ChallengeDateLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

const ChallengeDate = styled.div<IChallengeTimeStatusControl>`
  padding: ${theme.padding.contentMarginThird} 0px;
  padding-right: 20px;
  font-size: 13px;
  font-weight: ${theme.fontWeight.medium};
  text-align: left;

  ${({ timeStatus }) => {
    if (timeStatus === CHALLENGE_TIME_STATUS.UPCOMING) {
      return css`
        color: ${theme.colors.highlightYellow};
      `
    }
    else if (timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
      return css`
        color: ${theme.colors.highlightGreen};
      `
    }
    else if (timeStatus === CHALLENGE_TIME_STATUS.ENDED) {
      return css`
        color: ${theme.colors.colorDateGrey};
      `
    }
  }}
`

const ChallengeDateRemaining = styled.div`
  padding: ${theme.padding.contentMarginThird} 0px;
  font-weight: ${theme.fontWeight.bold};
  margin-left: 24px;
`

//   &.upcoming
//     .challenge-state-label
//       color: $color-highlight-yellow
//       border-top: $sizing-highlight-bar-width solid $color-highlight-yellow

//     .challenge-date
//       color: $color-highlight-yellow

//   &.current
//     .challenge-state-label
//       color: $color-highlight-green
//       border-top: $sizing-highlight-bar-width solid $color-highlight-green

//     .challenge-date
//       color: $color-highlight-green

//   &.ended
//     .challenge-state-label
//       color: $color-text-medium-grey
//       border-top: $sizing-highlight-bar-width solid $color-text-medium-grey

//     .challenge-date
//       color: $color-text-medium-grey
// `

interface IChallengeDetailsBanner {
  challenge: IChallenge,
}

export const ChallengeDetailsBanner: React.FunctionComponent<IChallengeDetailsBanner> = ({ challenge }) => {

  let stateLabel = 'Previous precisionFDA Challenge'
  switch (challenge.timeStatus) {
    case CHALLENGE_TIME_STATUS.UPCOMING:
      stateLabel = 'Upcoming precisionFDA Challenge'
      break
    case CHALLENGE_TIME_STATUS.CURRENT:
      stateLabel = 'Current precisionFDA Challenge'
      break
  }

  // const bannerClasses = classNames('challenge-details-main-container', 'challenge-details-banner', {
  //   'upcoming': challenge.timeStatus == CHALLENGE_TIME_STATUS.UPCOMING,
  //   'current': challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT,
  //   'ended': challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED,
  // })

  // N.B. it's not enough to specify timeZone to date-fns-tz's format function, as it also
  //      depends on the locale
  //      See https://stackoverflow.com/questions/65416339/how-to-detect-timezone-abbreviation-using-date-fns-tz
  const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone

  return (
    <StyledChallengeDetailsBanner>
      <LeftColumn>
        <div>
          <Link to={{ pathname: '/challenges' }} className="backToChallenges">
            &larr; Back to All Challenges
          </Link>
          <div style={{ 'marginTop': '20px' }}><ChallengeStateLabel timeStatus={challenge.timeStatus}>{stateLabel}</ChallengeStateLabel></div>
          <ChallengeName>{challenge.name}</ChallengeName>
          <ChallengeDescription>{challenge.description}</ChallengeDescription>
        </div>
        <ChallengeDateArea>
          <div>
            <ChallengeDateLabel>Starts</ChallengeDateLabel>
            <ChallengeDate timeStatus={challenge.timeStatus}>{format(challenge.startAt, 'MM/dd/yyyy HH:mm:ss z', { timeZone: userTimeZone, locale: enUS })}</ChallengeDate>
          </div>
          <div>
            <ChallengeDateLabel>Ends</ChallengeDateLabel>
            <ChallengeDate timeStatus={challenge.timeStatus}>{format(challenge.endAt, 'MM/dd/yyyy HH:mm:ss z', { timeZone: userTimeZone, locale: enUS })}</ChallengeDate>
          </div>
          <ChallengeDateRemaining><ChallengeTimeRemaining challenge={challenge} /></ChallengeDateRemaining>
        </ChallengeDateArea>
      </LeftColumn>
      <RightColumn>
        <ChallengeThumbnail src={challenge.cardImageUrl} alt={`${challenge.name} thumbnail`} />
      </RightColumn>
    </StyledChallengeDetailsBanner>
  )
}
