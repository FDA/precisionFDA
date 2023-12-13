import styled from 'styled-components'
import { Footer } from '../../modal/styles'

export const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--modal-padding-TB) var(--modal-padding-LR);
  gap: 1rem;
`

export const StyledFooter = styled(Footer)`
  padding: var(--modal-padding-TB) var(--modal-padding-LR);
`
