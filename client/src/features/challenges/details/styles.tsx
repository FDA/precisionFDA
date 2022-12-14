import styled, { css } from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { PageContainer, pagePadding } from '../../../components/Page/styles'
import { commonStyles } from '../../../styles/commonStyles'
import { breakPoints, colors, theme } from '../../../styles/theme'
import { TimeStatus } from '../types'

export const LeftColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  min-width: 300px;
  max-width: 720px;
  flex: 1 1 auto;
`

export const RightColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 320px;
  flex: 1 1 auto;
  padding: 32px 16px;
`

export const ChallengeThumbnail = styled.img`
  height: 180px;
  object-fit: contain;
  overflow: hidden;
  box-shadow: 0px 0px 16px #000;
`

export const StyledChallengeDetailsBanner = styled(PageContainer)`
  ${pagePadding}
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;

  @media (min-width: ${breakPoints.medium}px) {
    flex-direction: row;

    ${RightColumn} {
      padding: 0 16px;
    }
  }
`

export const ChallengeName = styled.h1`
  ${commonStyles.bannerTitle};
  margin: ${theme.padding.contentMargin} 0px;
  color: ${theme.colors.textWhite};
`

export const ChallengeDescription = styled.p`
  font-size: ${theme.fontSize.body};
  font-weight: ${theme.fontWeight.regular};
  color: ${theme.colors.textWhite};
  margin-top: ${theme.padding.contentMargin};
`



export const ChallengeStateLabel = styled.span<{timeStatus: TimeStatus}>`
  ${commonStyles.sectionHeading};
  text-transform: uppercase;
  padding: 3px 0px;
  color: ${theme.colors.textWhite};

  ${({ timeStatus }) => {
    if (timeStatus === 'upcoming') {
      return css`
        color: ${theme.colors.highlightYellow};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.highlightYellow};
      `
    }
    if (timeStatus === 'current') {
      return css`
        color: ${theme.colors.highlightGreen};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.highlightGreen};
      `
    }
    if (timeStatus === 'ended') {
      return css`
        color: ${theme.colors.stateLabelGrey};
        border-top: ${theme.sizing.highlightBarWidth} solid ${theme.colors.stateLabelGrey};
      `
    }
    return ''
  }}
`

export const ChallengeDateArea = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 12px;
  color: white;
`

export const ChallengeDateLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const ChallengeDate = styled.div<{timeStatus: TimeStatus}>`
  padding: ${theme.padding.contentMarginThird} 0px;
  padding-right: 20px;
  font-size: 13px;
  font-weight: ${theme.fontWeight.medium};
  text-align: left;

  ${({ timeStatus }) => {
    if (timeStatus === 'upcoming') {
      return css`
        color: ${theme.colors.highlightYellow};
      `
    }
    if (timeStatus === 'current') {
      return css`
        color: ${theme.colors.highlightGreen};
      `
    }
    if (timeStatus === 'ended') {
      return css`
        color: ${theme.colors.colorDateGrey};
      `
    }
    return ''
  }}
`

export const ChallengeDateRemaining = styled.div`
  padding: ${theme.padding.contentMarginThird} 0px;
  font-weight: ${theme.fontWeight.bold};
  margin-left: 24px;
`

export const StyledTabs = styled.div`
  .challenge-details-tabs {
    &__tab-list {
      list-style: none;
      padding: 0;
      margin-bottom: 24px;
      margin-top: 0;
    }
    &__tab {
      color: ${colors.greyTextOnWhite};
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.05em;
      margin-top: 12px;
      display: inline-block;
      border-bottom: 3px solid transparent;
      color: ${colors.blueOnWhite};
      text-transform: uppercase;
      letter-spacing: 0;
      margin-right: 12px;
      padding: 0 0 2px 0;
      cursor: pointer;
      margin-top: 0;

      &:hover {
        border-bottom: 3px solid ${colors.greyTextOnWhite};
      }
      &--selected {
        color: ${colors.blueOnWhite};
        border-bottom: 3px solid ${colors.brownOnGrey};

        &:hover {
          border-bottom: 3px solid ${colors.brownOnGrey};
        }
      }
    }
  }
`

export const CallToActionButton = styled(ButtonSolidBlue)`
  display: block;
  width: 100%;
  margin-bottom: 0px;
`

export const StyledChallengeSubmissionsTable = styled.div`
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    border: none;

    thead {
      border: 2px solid #d8d8d8;
      border-right: none;
      border-left: none;
    }

    thead tr {
      text-align: left;
    }

    th,
    td {
      padding: 12px 15px;
      border-right: 0;
    }

    tbody tr {
      border-bottom: 2px solid #dddddd;
      border-right: 0;
    }

    tbody tr:nth-of-type(even) {
      background-color: #f3f3f3;
    }

    tbody tr:last-of-type {
    }

    tbody tr.active-row {
      font-weight: bold;
    }

    .state-cell {
      padding: 0;
    }
  }
`
