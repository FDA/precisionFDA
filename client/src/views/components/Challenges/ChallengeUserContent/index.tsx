import React, { FunctionComponent } from 'react'
import styled from 'styled-components'


const StyledUserContent = styled.div`
h1 {
  font-size: 20px; // $pfda-font-size-h1;
  line-height: 24px
}

h2 {
  font-size: 18px; // $pfda-font-size-h2;
  line-height: 20px
}

p {
  font-size: 14px; // $pfda-font-size-body;
  font-weight: 400;
  line-height: 20px;
}
      
img {
  max-width: 820px;
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
