import styled from 'styled-components'
import { StyledButton } from './StyledButton'

export const ButtonGroup = styled.div`
  ${StyledButton}{
    border-radius: 0;
  }

  ${StyledButton}:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  ${StyledButton}:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
`
