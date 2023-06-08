import styled, { css } from 'styled-components'
import { Refresh } from '../../../../components/Page/styles'
import { colors } from '../../../../styles/theme'
import { JobState } from '../executions.types'

export const StyledRefresh = styled(Refresh)`
  margin-right: 16px;
`

export const StyledExecutionState = styled.span<{ state: JobState }>`
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 13px;

  ${({ state }) =>
    state === 'running' &&
    css`
      color: ${colors.stateRunningColor};
      background-color: ${colors.stateRunningBackground};
    `}
  ${({ state }) =>
    state === 'idle' &&
    css`
      color: ${colors.stateRunningColor};
      background-color: ${colors.stateRunningBackground};
    `}

  ${({ state }) =>
    state === 'done' &&
    css`
      color: #336534;
      background-color: ${colors.stateDoneBackground};
    `}

  ${({ state }) =>
    state === 'terminated' &&
    css`
      color: ${colors.stateFailedColor};
      background-color: ${colors.stateFailedBackground};
    `}

  ${({ state }) =>
    state === 'failed' &&
    css`
      color: ${colors.stateFailedColor};
      background-color: ${colors.stateFailedBackground};
    `}
`

export const FailureMessage = styled.div`
  color: ${colors.stateFailedColor};
  background-color: ${colors.stateFailedBackground};
  padding: 3px 5px;
  border-radius: 3px;
  /* font-size: 13px; */
`
