import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

import { theme } from '../../../../styles/theme'


const StyledUserContent = styled.div`
h1 {
  font-size: ${theme.fontSize.h1};
  line-height: 24px;
  margin-top: ${theme.padding.mainContentVertical};
}

h2 {
  font-size: ${theme.fontSize.h2};
  line-height: 20px;
  margin-top: ${theme.padding.contentMarginLarge};
}

p {
  font-size: ${theme.fontSize.body};
  font-weight: 400;
  line-height: 20px;
}
      
img {
  max-width: ${theme.sizing.mainColumnMaxImageSize};
  object-fit: contain;
}
`

interface IChallengeUserContent {
  html: string,
}

// ChallengeUserContent renders the html contained within the
//    'intro' and 'results' regions in the meta attributes into a container
export const ChallengeUserContent: FunctionComponent<IChallengeUserContent> = ({ html }) => {
  return <StyledUserContent dangerouslySetInnerHTML={{ __html: html }} />
}

export default ChallengeUserContent
