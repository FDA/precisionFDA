import React from 'react'
import styled from 'styled-components'
import { colors, padding, theme, values } from '../../../../styles/theme'
import { ViewAllButton } from '../../Controls/ViewAllButton'
import challengesBannerLeft from '../../../../assets/ChallengesBannerBackground-Left.png'
import challengesBannerRight from '../../../../assets/ChallengesBannerBackground-Right.png'


const StyledChallengesBanner = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.subtleBlue};
  justify-content: space-between;
  margin-top: 12px;
`

const StyledChallengesBannerLeft = styled.div`
  flex: 1 1 auto;
  text-align: left;
  padding: 20px 0 20px ${theme.padding.mainContentHorizontal};
  background-image: url(${challengesBannerLeft});
  background-repeat: no-repeat;
  background-position: 0% 50%;
  background-size: contain;

  h4 {
    color: ${colors.textBlack};
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 4px 0;
  }

  h2 {
    color: ${colors.textBlack};
    font-size: 20px;
    font-weight: bold;
    margin: 4px 0 0 0;
  }
`

const StyledChallengesBannerRight = styled.div`
  align-self: stretch;
  padding: 32px ${theme.values.paddingMainContentVertical*2}px 0 0;
  background-image: url(${challengesBannerRight});
  background-repeat: no-repeat;
  background-position: 100% 50%;
  background-size: contain;
`


const ChallengesBanner = () => {
  return (
    <StyledChallengesBanner>
      <StyledChallengesBannerLeft>
        <h4>precisionFDA</h4>
        <h2>Challenges</h2>
      </StyledChallengesBannerLeft>
      <StyledChallengesBannerRight >
        <ViewAllButton title="View All Challenges" url="/challenges" />
      </StyledChallengesBannerRight>
    </StyledChallengesBanner>
  )
}

export {
  ChallengesBanner,
}

export default ChallengesBanner
