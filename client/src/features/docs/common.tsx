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

export const OutdatedDocsApps = () => {
  return <StyledOutdatedDocs>
    The content on this page may be outdated. Please refer to the new <a target='_blank' href="/pdfs/Tutorial_-_Apps_and_Workflows_-_20221130.pdf">tutorials</a>.
  </StyledOutdatedDocs>
}
export const OutdatedDocsWorkstations = () => {
  return <StyledOutdatedDocs>
    The content on this page may be outdated. Please refer to the new <a target='_blank' href="/pdfs/Tutorial_-_Workstations_and_Databases_-_20231122.pdf">tutorials</a>.
  </StyledOutdatedDocs>
}
