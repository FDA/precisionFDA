import React from 'react'
import styled from 'styled-components'
import { theme } from '../../../styles/theme'
import { EnvelopeIcon } from '../../icons/EnvelopeIcon'

export const StyledSocialMediaButtons = styled.div`
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
`

export const MailButton = () => {
  return (
    <StyledSocialMediaButtons>
      <a href="mailto:precisionfda@fda.hhs.gov" aria-label="Click this icon to email the PrecisionFDA team">
        <EnvelopeIcon />
      </a>
    </StyledSocialMediaButtons>
  )
}

export default MailButton
