import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../styles/theme'

const StyledOutdatedDocs = styled.div`
  color: ${theme.colors.hoverDarkRed};
  background-color: #fddbdc;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 32px;
`

export const OutdatedDocs = () => {
  return <StyledOutdatedDocs>
    The content on this page may be outdated. Please refer to the new <Link to="/docs/tutorials/apps-workflows">tutorials</Link>.
  </StyledOutdatedDocs>
}
