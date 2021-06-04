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
  width: 100%;
  height: auto;
  margin: ${theme.padding.contentMargin} 0;
  object-fit: contain;
}
`

interface IUserContentDisplay {
  html: string,
}

// UserContentDisplay renders the user html contained within the database into a container
//
// For example, challenge introduction and results sections, or expert blog entries
//
export const UserContentDisplay: FunctionComponent<IUserContentDisplay> = ({ html }) => {
  return <StyledUserContent dangerouslySetInnerHTML={{ __html: html }} />
}
