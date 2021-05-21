import styled from 'styled-components'
import { Button } from '../../../components/Button'

export const ButtonGroup = styled.div`
  ${Button}{
    border-radius: 0;
  }

  ${Button}:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  ${Button}:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
`
