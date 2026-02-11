import styled from 'styled-components'
import { MarkdownStyle } from '../../../components/Markdown'
import { ExpertDetails } from '../types'

const StyledExpertAbout = styled(MarkdownStyle)`
  padding-left: 0;
`

export const ExpertAbout = ({ expert }: { expert: ExpertDetails }) => (
  <StyledExpertAbout>
    <p>{expert.about}</p>
  </StyledExpertAbout>
)
