import styled from 'styled-components'

import { CHALLENGE_TIME_STATUS } from '../../../../constants'
import { theme } from '../../../../styles/theme'
import { commonStyles } from '../../../../styles/commonStyles'


interface IChallengesListItemComponent {
  timeStatus: string,
}

export const ChallengeListItem = styled.li<IChallengesListItemComponent>`
  display: flex;
  flex-flow: row nowrap;
  list-style: none;
  margin-bottom: ${theme.padding.mainContentVertical};

  @media (max-width: 768px) {
    flex-flow: row nowrap;
  }
`

export const ChallengeListItemThumbnail = styled.div<IChallengesListItemComponent>`
  cursor: pointer;
  padding: 0px;

  img {
    width: ${theme.sizing.thumbnailWidth};
    height: ${theme.sizing.thumbnailHeight};
    object-fit: contain;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    img {
      width: ${theme.sizing.thumbnailWidthSmall};
      height: ${theme.sizing.thumbnailHeightSmall};
    }
  }

  ${(props) => {
		if (props.timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
			const marginTop = -theme.values.thumbnailHeight + theme.values.contentMargin
			return `
        &:after {
          display: block;
          position: absolute;
          margin-top: ${marginTop}px;
          padding: 2px 4px;
          background: ${theme.colors.highlightGreen};
          content: 'OPEN';
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
      `
		}
	}};
`

export const ChallengeListItemContent = styled.div`
  flex-grow: 1;
  vertical-align: top;
  padding: 0 0 0 ${theme.padding.mainContentHorizontal};

  h1 {
    ${commonStyles.titleStyle};
    cursor: pointer;
    padding-top: 0px;
    margin-top: 0px;
    margin-bottom: 8px;

    &:hover {
      color: ${theme.colors.textDarkGrey};
    }
  }

  .date-area {
    font-size: 12px;
    color: ${theme.colors.textDarkGrey};

    .challenge-date-label {
      font-size: 10px;
      color: ${theme.colors.textMediumGrey};
      text-transform: uppercase;
    }

    .challenge-date {
      padding: 3px 3px;
      margin: 3px;
      font-weight: 500;
    }

    .challenge-date-remaining {
      font-weight: 600;
      margin-left: 12px;
      display: inline-block;
    }
  }

  p {
    font-size: ${theme.fontSize.body};
    font-weight: 400;
    color: ${theme.colors.textMediumGrey};
    margin-top: 5px;
  }

  a, button {
    margin-right: ${theme.padding.contentMargin};
  }
`

export const ChallengesListSectionHeader = styled.div<IChallengesListItemComponent>`
  margin-bottom: 8px;
  vertical-align: top;

  hr {
    border: 0;
    height: ${theme.sizing.highlightBarWidth};
    background: ${theme.colors.highlightYellow};
    margin: 10px 0 0 0;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    hr {
      width: ${theme.sizing.thumbnailWidthSmall};
    }
  }

  ${(props) => {
		if (props.timeStatus === CHALLENGE_TIME_STATUS.UPCOMING) {
			return `
        hr {
          background-color: ${theme.colors.highlightYellow};
        }
      `
		}
		if (props.timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
			return `
        hr {
          background-color: ${theme.colors.highlightGreen};
        }
      `
		}
		if (props.timeStatus === CHALLENGE_TIME_STATUS.ENDED) {
			return `
        hr {
          background-color: ${theme.colors.highlightBlue};
        }
      `
		}
	}};
`

export const SectionHeaderLabel = styled.span`
  ${commonStyles.sectionHeading}
  text-align: left;
  text-transform: uppercase;
  margin: 0;
  padding-left: 0;
`


// For Landing page list item
//
export const ChallengeListItemLanding_LeftColumn = styled.div`
  width: ${theme.sizing.smallerColumnWidth};
  flex: 0 0 ${theme.sizing.smallerColumnWidth};
`

export const SectionHeaderLabel_LeftColumn = styled(SectionHeaderLabel)`
  color: ${theme.colors.textBlack};
  white-space: normal;
`
