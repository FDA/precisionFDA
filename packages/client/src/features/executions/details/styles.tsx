import styled from 'styled-components'
import { Refresh } from '../../../components/Page/styles'

export const StyledRefresh = styled(Refresh)`
  margin-right: 16px;
`

export const StyledStatusText = styled.div`
  margin-right: 16px;
 `

export const StyledExecutionState = styled.span`
  border-radius: 8px;
  font-size: 13px;
  margin-right: 8px;
  font-weight: bold;
`

export const TitleLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const FailureMessage = styled.div`
  color: white;
  background-color: var(--warning-500);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`
