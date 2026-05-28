import styled from 'styled-components'
import { Button } from '../../components/Button'

export const DateArea = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  vertical-align: center;
  gap: 6px;

  .challenge-date-label {
    font-size: 10px;
    color: var(--c-text-500);
    text-transform: uppercase;
  }
  .challenge-date {
    font-weight: 500;
  }
  .challenge-date-remaining {
    font-weight: 600;
    padding-left: 8px;
  }
`

export const ViewDetailsButton = styled(Button)`
  font-weight: bold;
  width: fit-content;
`
