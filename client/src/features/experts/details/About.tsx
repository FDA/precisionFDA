import React from 'react'
import styled from 'styled-components'
import { ExpertDetails } from '../types'
import { MarkdownStyle } from '../../../components/Markdown'

const StyledExpertAbout = styled(MarkdownStyle)`
  padding-left: 0;
`

export const ExpertAbout = ({ expert }: { expert: ExpertDetails }) => (
  <StyledExpertAbout>
    <p>{expert.about}</p>
  </StyledExpertAbout>
)
