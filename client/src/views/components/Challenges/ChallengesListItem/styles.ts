import styled from 'styled-components'

import { CHALLENGE_TIME_STATUS } from '../../../../constants'
import { breakPoints, colors, fontSize, padding, sizing, values } from '../../../../styles/theme'
import { commonStyles } from '../../../../styles/commonStyles'


interface IChallengesListItemComponent {
  timeStatus: string,
}

export const ChallengeListItemContent = styled.div`
  flex-grow: 1;

  h1 {
    ${commonStyles.titleStyle};
    cursor: pointer;
    padding-top: 0px;
    margin-top: 0px;
    margin-bottom: 8px;

    &:hover {
      color: ${colors.textDarkGrey};
    }
  }

  .date-area {
    font-size: 12px;
    color: ${colors.textDarkGrey};

    .challenge-date-label {
      font-size: 10px;
      color: ${colors.textMediumGrey};
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
    font-size: ${fontSize.body};
    font-weight: 400;
    color: ${colors.textMediumGrey};
    margin-top: 5px;
  }

  a, button {
    margin-right: ${padding.contentMargin};
  }
`

export const ChallengeListItem = styled.li<IChallengesListItemComponent>`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin-bottom: 32px;

  @media (min-width: ${breakPoints.medium}px) {
    flex-direction: row;
    ${ChallengeListItemContent} {
      padding-left: 32px;
    }
  }
`

export const ChallengeListItemThumbnail = styled.div<IChallengesListItemComponent>`
  cursor: pointer;
  padding: 0px;

  img {
    width: ${sizing.thumbnailWidth};
    height: ${sizing.thumbnailHeight};
    object-fit: contain;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    img {
      width: ${sizing.thumbnailWidthSmall};
      height: ${sizing.thumbnailHeightSmall};
    }
  }

  ${(props) => {
		if (props.timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
			const marginTop = -values.thumbnailHeight + values.contentMargin
			return `
        &:after {
          display: block;
          position: absolute;
          margin-top: ${marginTop}px;
          padding: 2px 4px;
          background: ${colors.highlightGreen};
          content: 'OPEN';
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
      `
		}
	}};
`

export const ChallengesListSectionHeader = styled.div<IChallengesListItemComponent>`
  margin-bottom: 8px;
  vertical-align: top;

  hr {
    border: 0;
    height: ${sizing.highlightBarWidth};
    background: ${colors.highlightYellow};
    margin: 10px 0 0 0;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    hr {
      width: ${sizing.thumbnailWidthSmall};
    }
  }

  ${(props) => {
		if (props.timeStatus === CHALLENGE_TIME_STATUS.UPCOMING) {
			return `
        hr {
          background-color: ${colors.highlightYellow};
        }
      `
		}
		if (props.timeStatus === CHALLENGE_TIME_STATUS.CURRENT) {
			return `
        hr {
          background-color: ${colors.highlightGreen};
        }
      `
		}
		if (props.timeStatus === CHALLENGE_TIME_STATUS.ENDED) {
			return `
        hr {
          background-color: ${colors.highlightBlue};
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
  width: ${sizing.smallerColumnWidth};
  flex: 0 0 ${sizing.smallerColumnWidth};
`

export const SectionHeaderLabel_LeftColumn = styled(SectionHeaderLabel)`
  color: ${colors.textBlack};
  white-space: normal;
`
