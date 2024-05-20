import React from 'react'
import styled from 'styled-components'

import ExternalLink from '../../Controls/ExternalLink'
import { theme } from '../../../styles/theme'
import { EnvelopeIcon } from '../../icons/EnvelopeIcon'
import { TwitterIcon } from '../../icons/TwitterIcon'
import { LinkedInIcon } from '../../icons/LinkedInIcon'


const StyledSocialMediaButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  order: 3;
  align-self: flex-end;
  text-align: right;
  font-family: ${theme.fontFamily};
  width: auto;

  a {
    display: flex;
    align-items: center;
    color: white;
    font-weight: bold;
    padding: 3px 6px;
    cursor: pointer;
    white-space: nowrap; 
  }

  @media (min-width: 640px) {
    min-width: ${theme.sizing.smallColumnWidth};
  }

  @media (min-width: 1024px) {
    width: ${theme.sizing.largeColumnWidth};
  }
`

export const SocialMediaButtons = () => {
  return (
    <StyledSocialMediaButtons>
      <a href='mailto:precisionfda@fda.hhs.gov' aria-label='Click this icon to email the PrecisionFDA team'><EnvelopeIcon /></a>
      <ExternalLink to='https://twitter.com/precisionfda' ariaLabel='Click this icon to view the PrecisionFDA Twitter page in a new Tab'><TwitterIcon /></ExternalLink>
      <ExternalLink to='https://www.linkedin.com/company/fda' ariaLabel='Click this icon to view the PrecisionFDA LinkedIn page in a new tab'><LinkedInIcon /></ExternalLink>
    </StyledSocialMediaButtons>
  )
}

export default SocialMediaButtons
