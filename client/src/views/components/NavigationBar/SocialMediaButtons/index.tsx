import React from 'react'
import styled from 'styled-components'

import ExternalLink from '../../Controls/ExternalLink'
import { theme } from '../../../../styles/theme'


const StyledSocialMediaButtons = styled.div<ISocialMediaButtonProps>`
  order: 3;
  align-self: flex-end;
  text-align: right;
  font-family: ${theme.fontFamily};
  width: auto;
  ${props => props.showText ? `
    flex-grow: 1;
    margin: auto 0;
  ` : `
    margin-bottom: ${theme.padding.mainContentVertical};
  `}

  a {
    color: white;
    font-size: ${props => props.showText ? '14px' : '18px'};
    font-weight: bold;
    padding: 3px 6px;
  }

  @media (min-width: 640px) {
    min-width: ${theme.sizing.smallColumnWidth};
  }

  @media (min-width: 1024px) {
    width: ${theme.sizing.largeColumnWidth};
  }
`

const SocialMediaButtonText = styled.span`
  color: white;
  font-family: ${theme.fontFamily};
  font-size: 14px;
  font-weight: bold;
  padding: 3px 6px;
`


interface ISocialMediaButtonProps {
  showText?: boolean,
}

export const SocialMediaButtons : React.FunctionComponent<ISocialMediaButtonProps> = ({ showText=false }) => {
  return (
    <StyledSocialMediaButtons showText={showText}>
      <a href='mailto:precisionfda@fda.hhs.gov' className="fa fa-envelope" aria-label='Click this icon to email the PrecisionFDA team'>{showText ? (<SocialMediaButtonText>Email the team</SocialMediaButtonText>) : ''}</a>
      <ExternalLink to='https://twitter.com/precisionfda' className="fa fa-twitter" ariaLabel='Click this icon to view the PrecisionFDA Twitter page in a new Tab'>{showText ? (<SocialMediaButtonText>Twitter</SocialMediaButtonText>) : ''}</ExternalLink>
      <ExternalLink to='https://www.linkedin.com/showcase/precisionfda' className="fa fa-linkedin" ariaLabel='Click this icon to view the PrecisionFDA LinkedIn page in a new tab'>{showText ? (<SocialMediaButtonText>LinkedIn</SocialMediaButtonText>) : ''}</ExternalLink>
    </StyledSocialMediaButtons>
  )
}

export default SocialMediaButtons
