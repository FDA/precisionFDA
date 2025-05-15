import styled, { css } from 'styled-components'
import { PageContainer, pagePaddingLR } from '../../../components/Page/styles'
import { breakPoints, colors, theme } from '../../../styles/theme'
import { TimeStatus } from '../types'
import { Button } from '../../../components/Button'

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
  justify-content: flex-end;
  align-items: center;
  min-width: 320px;
  flex: 1 1 auto;
`

export const ChallengeThumbnail = styled.img`
  height: 180px;
  object-fit: contain;
  overflow: hidden;
  border-radius: 8px;
  background-color: white;
  min-height: 300px;
  border: 2px solid white;
  box-shadow: 0 0 16px #000;
`

export const StyledChallengeDetailsBanner = styled(PageContainer)`
  ${pagePaddingLR}
  display: flex;
  padding-top: 32px;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 32px;

  a {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary-400);
    &:hover {
      color: var(--primary-300);
    }
  }

  @media (min-width: ${breakPoints.medium}px) {
    flex-direction: row;
  }
`

export const ChallengeName = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 16px 0;
`

export const ChallengeDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  margin-top: 16px;
  margin-bottom: 16px;
`
export const NoInfo = styled.div`
  margin-bottom: 24px;
`

export const ChallengeStateLabel = styled.span<{ $timeStatus: TimeStatus }>`
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.05em;
  margin-top: 12px;
  text-transform: uppercase;
  padding: 3px 0;
  color: white;

  ${({ $timeStatus }) => {
    if ($timeStatus === 'upcoming') {
      return css`
        color: ${theme.colors.highlightYellow};
        border-top: 4px solid ${theme.colors.highlightYellow};
      `
    }
    if ($timeStatus === 'current') {
      return css`
        color: ${theme.colors.highlightGreen};
        border-top: 4px solid ${theme.colors.highlightGreen};
      `
    }
    if ($timeStatus === 'ended') {
      return css`
        color: ${theme.colors.stateLabelGrey};
        border-top: 4px solid ${theme.colors.stateLabelGrey};
      `
    }
    return ''
  }}
`

export const ChallengeDateArea = styled.div`
  font-size: 12px;
  padding-top: 16px;
  flex-wrap: wrap;
`

export const StartEnd = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ChallengeDateLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: bold;
  white-space: nowrap;
`

export const ChallengeDate = styled.div<{ $timeStatus: TimeStatus }>`
  padding: 4px 20px 4px 0;
  font-size: 13px;
  font-weight: 500;
  text-align: left;

  ${({ $timeStatus }) => {
    if ($timeStatus === 'upcoming') {
      return css`
        color: ${theme.colors.highlightYellow};
      `
    }
    if ($timeStatus === 'current') {
      return css`
        color: ${theme.colors.highlightGreen};
      `
    }
    if ($timeStatus === 'ended') {
      return css`
        color: ${theme.colors.colorDateGrey};
      `
    }
    return ''
  }}
`

export const ChallengeDateRemaining = styled.div`
  padding: 16px 0;
  font-weight: 600;
  white-space: nowrap;
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

export const CallToActionButton = styled(Button).attrs({ 'data-variant': 'primary' })`
  display: block;
  width: 100%;
  margin-bottom: 0;
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
