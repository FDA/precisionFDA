import styled from 'styled-components'
import { ToggleButton } from '.'

// Use ToggleButton to implement a multi-selection button group

export const ButtonGroup = styled.div`
  display: flex;

  ${ToggleButton}{
    border-radius: 0;
    border-right: 0px;
  }

  ${ToggleButton}:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  ${ToggleButton}:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    border-right: 1px;
  }
`
