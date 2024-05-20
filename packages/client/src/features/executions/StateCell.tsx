import React from 'react'
import styled from 'styled-components'
import { Done, Failed, Idle, Runnable, Running, Terminated } from '../../components/icons/StateIcons'
import { Svg } from '../../components/icons/Svg'
import { JobState } from './executions.types'

const StateLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: capitalize;

  ${Svg} {
    width: 15px;
  }
  min-width: max-content;
`

export const StateCell = ({ state }: { state: JobState }) => {
  return (
    <>
      {state === 'done' && (
        <StateLabel>
          <Done />
          {state}
        </StateLabel>
      )}
      {state === 'idle' && (
        <StateLabel>
          <Idle />
          {state}
        </StateLabel>
      )}
      {state === 'runnable' && (
        <StateLabel>
          <Runnable />
          {state}
        </StateLabel>
      )}
      {state === 'running' && (
        <StateLabel>
          <Running />
          {state}
        </StateLabel>
      )}
      {state === 'terminating' && (
        <StateLabel>
          <Terminated />
          {state}
        </StateLabel>
      )}
      {state === 'terminated' && (
        <StateLabel>
          <Terminated />
          {state}
        </StateLabel>
      )}
      {state === 'failed' && (
        <StateLabel>
          <Failed />
          {state}
        </StateLabel>
      )}
    </>
  )
}
