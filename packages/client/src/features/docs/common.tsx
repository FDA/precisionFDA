import React from 'react'
import { Link } from 'react-router-dom'
import { StyledOutdatedDocs } from './styles'

export const OutdatedDocsApps = () => {
  return <StyledOutdatedDocs>
      The content on this page may be outdated. Please refer to the new <Link to="/docs/tutorials/apps-workflows">tutorials</Link>.
  </StyledOutdatedDocs>
}
export const OutdatedDocsWorkstations = () => {
  return <StyledOutdatedDocs>
        The content on this page may be outdated. Please refer to the new <Link to="/docs/tutorials/workstations-databases">tutorials</Link>.
  </StyledOutdatedDocs>
}
